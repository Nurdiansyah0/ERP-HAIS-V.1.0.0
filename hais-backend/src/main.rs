use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use chrono::{Utc, Duration};
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite, Row};
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rand_core::OsRng;
use rand::Rng;
use std::env;
use redis::AsyncCommands;
use lettre::{Message, Transport};
use lettre::transport::stub::StubTransport;

// --- STATE APLIKASI ---
struct AppState {
    db: Pool<Sqlite>,
    redis: redis::Client, // Valkey Client
}

// --- CONTRACT API (Request & Response) ---

#[derive(Deserialize)]
struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
struct UserInfo {
    pub id: String,
    pub name: String,
    pub username: String,
    pub role: String,
}

#[derive(Serialize)]
struct LoginResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: UserInfo,
}

#[derive(Deserialize)]
struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Serialize)]
struct RefreshResponse {
    pub access_token: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    pub message: String,
}

#[derive(Deserialize)]
struct ForgotPasswordRequest {
    pub email: String, // Email atau NIK
}

#[derive(Serialize)]
struct GenericResponse {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    role: String,
    exp: usize,
    token_type: String, // "access" atau "refresh"
}

// --- ENDPOINT HANDLERS ---

#[post("/v1/auth/login")]
async fn login(
    req_body: web::Json<LoginRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let username = &req_body.username;
    let password = &req_body.password;

    let user_row = sqlx::query(
        "SELECT id, name, username, password_hash, role FROM users WHERE username = ?"
    )
    .bind(username)
    .fetch_optional(&data.db)
    .await;

    match user_row {
        Ok(Some(row)) => {
            let id: String = row.get("id");
            let name: String = row.get("name");
            let db_username: String = row.get("username");
            let role: String = row.get("role");
            let password_hash: String = row.get("password_hash");

            let parsed_hash = PasswordHash::new(&password_hash).unwrap();
            if Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok() {
                
                let access_exp = Utc::now()
                    .checked_add_signed(Duration::hours(1))
                    .expect("valid timestamp")
                    .timestamp() as usize;

                let refresh_exp = Utc::now()
                    .checked_add_signed(Duration::days(30))
                    .expect("valid timestamp")
                    .timestamp() as usize;

                let secret = "KODE_RAHASIA_SUPER_KUAT_UNTUK_JWT_HAIS";
                
                let access_claims = Claims {
                    sub: id.clone(),
                    role: role.clone(),
                    exp: access_exp,
                    token_type: "access".to_string(),
                };
                
                let refresh_claims = Claims {
                    sub: id.clone(),
                    role: role.clone(),
                    exp: refresh_exp,
                    token_type: "refresh".to_string(),
                };

                let access_token = encode(
                    &Header::default(),
                    &access_claims,
                    &EncodingKey::from_secret(secret.as_ref()),
                ).unwrap();

                let refresh_token = encode(
                    &Header::default(),
                    &refresh_claims,
                    &EncodingKey::from_secret(secret.as_ref()),
                ).unwrap();

                let response = LoginResponse {
                    access_token,
                    refresh_token,
                    user: UserInfo { id, name, username: db_username, role },
                };

                HttpResponse::Ok().json(response)
            } else {
                HttpResponse::Unauthorized().json(ErrorResponse {
                    message: "Username atau Password salah".to_string(),
                })
            }
        },
        _ => {
            HttpResponse::Unauthorized().json(ErrorResponse {
                message: "Username atau Password salah".to_string(),
            })
        }
    }
}

#[post("/v1/auth/refresh")]
async fn refresh(req_body: web::Json<RefreshRequest>) -> impl Responder {
    let secret = "KODE_RAHASIA_SUPER_KUAT_UNTUK_JWT_HAIS";
    
    // Validasi refresh token
    let mut validation = Validation::default();
    validation.validate_exp = true;
    
    let token_data = match decode::<Claims>(
        &req_body.refresh_token,
        &DecodingKey::from_secret(secret.as_ref()),
        &validation,
    ) {
        Ok(c) => c,
        Err(_) => return HttpResponse::Unauthorized().json(ErrorResponse {
            message: "Token tidak valid atau sudah kadaluwarsa".to_string(),
        }),
    };

    // Pastikan token yang dikirim benar-benar berjenis "refresh"
    if token_data.claims.token_type != "refresh" {
        return HttpResponse::Unauthorized().json(ErrorResponse {
            message: "Tipe token salah. Harap gunakan refresh token.".to_string(),
        });
    }

    // Buat access token baru selama 1 jam
    let access_exp = Utc::now()
        .checked_add_signed(Duration::hours(1))
        .expect("valid timestamp")
        .timestamp() as usize;

    let access_claims = Claims {
        sub: token_data.claims.sub,
        role: token_data.claims.role,
        exp: access_exp,
        token_type: "access".to_string(),
    };

    let access_token = encode(
        &Header::default(),
        &access_claims,
        &EncodingKey::from_secret(secret.as_ref()),
    ).unwrap();

    HttpResponse::Ok().json(RefreshResponse { access_token })
}

#[post("/v1/auth/forgot-password")]
async fn forgot_password(
    req_body: web::Json<ForgotPasswordRequest>,
    data: web::Data<AppState>,
) -> impl Responder {
    let email_or_nik = &req_body.email;

    // 1. Cek apakah email/NIK terdaftar di database
    // Saat ini, skema `users` menggunakan `username` (yang bisa bertindak sebagai NIK/Email)
    let user_exists: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE username = ?")
        .bind(email_or_nik)
        .fetch_one(&data.db)
        .await
        .unwrap_or((0,));

    if user_exists.0 == 0 {
        return HttpResponse::NotFound().json(ErrorResponse {
            message: "Email atau NIK tidak terdaftar dalam sistem.".to_string(),
        });
    }

    // 2. Generate 6-digit OTP
    let mut rng = rand::thread_rng();
    let otp: String = (0..6).map(|_| rng.gen_range(0..10).to_string()).collect();

    // 3. Simpan OTP ke Valkey/Redis (Berlaku selama 5 menit / 300 detik)
    if let Ok(mut redis_conn) = data.redis.get_async_connection().await {
        let _: Result<(), redis::RedisError> = redis::cmd("SET")
            .arg(format!("otp:{}", email_or_nik))
            .arg(otp.clone())
            .arg("EX")
            .arg(300) // TTL 5 menit
            .query_async(&mut redis_conn)
            .await;
    } else {
        return HttpResponse::InternalServerError().json(ErrorResponse {
            message: "Gagal terhubung ke layanan caching (Valkey).".to_string(),
        });
    }

    // 4. Kirim Email SMTP menggunakan Lettre
    let email = Message::builder()
        .from("No Reply HAIS <noreply@hais.com>".parse().unwrap())
        .to(format!("User <{}>", email_or_nik).parse().unwrap_or_else(|_| "User <admin@hangnadim.com>".parse().unwrap()))
        .subject("Kode OTP Reset Password - HAIS ERP")
        .body(format!("Kode OTP Anda adalah: {}\n\nJangan berikan kode ini kepada siapapun.", otp))
        .unwrap();

    // Di production, Anda akan menggunakan SmtpTransport::relay("smtp.gmail.com")
    // Karena ini simulasi lokal, kita mencetak OTP ke terminal dan menggunakan StubTransport
    println!("📧 [MOCK EMAIL TERKIRIM] Ke: {}, OTP: {}", email_or_nik, otp);
    let mailer = StubTransport::new_ok();
    
    match mailer.send(&email) {
        Ok(_) => HttpResponse::Ok().json(GenericResponse {
            message: "Email berisi kode OTP berhasil dikirim!".to_string(),
        }),
        Err(e) => HttpResponse::InternalServerError().json(ErrorResponse {
            message: format!("Gagal mengirim email: {}", e),
        }),
    }
}

// --- SERVER SETUP & SEEDING ---

async fn setup_database() -> Pool<Sqlite> {
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:hais.db".to_string());
    
    if !std::path::Path::new("hais.db").exists() {
        std::fs::File::create("hais.db").unwrap();
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Gagal terhubung ke SQLite");

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL
        );"
    )
    .execute(&pool)
    .await
    .expect("Gagal membuat tabel users");

    let admin_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE username = 'admin'")
        .fetch_one(&pool)
        .await
        .unwrap_or((0,));

    if admin_count.0 == 0 {
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = Argon2::default()
            .hash_password(b"admin123", &salt)
            .unwrap()
            .to_string();

        sqlx::query(
            "INSERT INTO users (id, name, username, password_hash, role) VALUES (?, ?, ?, ?, ?)"
        )
        .bind("u-admin")
        .bind("Super Administrator")
        .bind("admin")
        .bind(password_hash)
        .bind("superuser")
        .execute(&pool)
        .await
        .expect("Gagal membuat superuser");
        
        println!("✅ Berhasil membuat akun Superuser!");
        println!("   Username : admin");
        println!("   Password : admin123");
    }

    pool
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = setup_database().await;

    // Koneksi ke Valkey (Redis)
    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379/".to_string());
    let redis_client = redis::Client::open(redis_url).expect("URL Valkey/Redis tidak valid");

    println!("🚀 HAIS Rust Backend (Actix-Web + SQLite + Valkey) berjalan di http://0.0.0.0:8080");

    HttpServer::new(move || {
        let cors = Cors::permissive(); 

        App::new()
            .app_data(web::Data::new(AppState { 
                db: pool.clone(),
                redis: redis_client.clone(),
            })) 
            .wrap(cors)
            .service(login)
            .service(refresh)
            .service(forgot_password)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
