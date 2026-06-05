mod application;
mod config;
mod domain;
mod infrastructure;
mod interfaces;
mod shared;

use std::sync::Arc;
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::application::use_cases::auth_use_case::AuthUseCase;
use crate::application::use_cases::user_use_case::UserUseCase;
use crate::infrastructure::database::postgres_user_repository::PostgresUserRepository;
use crate::infrastructure::database::postgres_audit_log_repository::PostgresAuditLogRepository;
use crate::infrastructure::cache::redis_service::RedisCacheService;
use crate::infrastructure::external::email_service::GmailRestEmailService;
use crate::interfaces::http::handlers::auth_handler::AppState;
use crate::interfaces::http::routes::build_router;
use crate::domain::entities::user::User;
use crate::domain::repositories::user_repository::UserRepository;

use argon2::{
    password_hash::{PasswordHasher, SaltString},
    Argon2,
};
use rand_core::OsRng;
use chrono::Utc;

async fn setup_database(db_url: &str) -> sqlx::PgPool {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(db_url)
        .await
        .expect("Gagal terhubung ke PostgreSQL");

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );"
    )
    .execute(&pool)
    .await
    .expect("Gagal membuat tabel users");

    let repo = PostgresUserRepository::new(pool.clone());
    if repo.count_admins().await.unwrap_or(0) == 0 {
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = Argon2::default()
            .hash_password(b"admin123", &salt)
            .unwrap()
            .to_string();

        let admin_user = User {
            id: uuid::Uuid::new_v4(),
            name: "Super Administrator".to_string(),
            username: "admin".to_string(),
            password_hash,
            role: "superuser".to_string(),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        repo.create(&admin_user).await.expect("Gagal membuat superuser");
        tracing::info!("✅ Berhasil membuat akun Superuser!");
    }

    pool
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "hais_backend=debug,tower_http=debug,axum::rejection=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Memulai HAIS Enterprise Backend...");

    let db_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/hais_db".to_string());
    let pool = setup_database(&db_url).await;

    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379/".to_string());
    let redis_client = redis::Client::open(redis_url).expect("URL Valkey/Redis tidak valid");

    let user_repo = Arc::new(PostgresUserRepository::new(pool.clone()));
    let cache_service = Arc::new(RedisCacheService::new(redis_client));
    let gmail_client_id = std::env::var("GMAIL_CLIENT_ID").expect("GMAIL_CLIENT_ID harus diset di .env");
    let gmail_client_secret = std::env::var("GMAIL_CLIENT_SECRET").expect("GMAIL_CLIENT_SECRET harus diset di .env");
    let gmail_refresh_token = std::env::var("GMAIL_REFRESH_TOKEN").expect("GMAIL_REFRESH_TOKEN harus diset di .env");
    
    let email_service = Arc::new(GmailRestEmailService::new(
        gmail_client_id, 
        gmail_client_secret, 
        gmail_refresh_token
    ));
    
    let audit_repo = Arc::new(PostgresAuditLogRepository::new(pool));
    
    let auth_use_case = Arc::new(AuthUseCase::new(user_repo.clone(), cache_service, email_service));
    let user_use_case = Arc::new(UserUseCase::new(user_repo, audit_repo));

    let app_state = Arc::new(AppState {
        auth_use_case,
        user_use_case,
    });

    let app = build_router(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    tracing::info!("🚀 HAIS Rust Backend (Axum + DDD + Postgres) berjalan di http://0.0.0.0:8080");
    axum::serve(listener, app).await?;

    Ok(())
}
