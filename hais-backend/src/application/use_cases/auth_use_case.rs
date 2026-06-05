use std::sync::Arc;
use argon2::{password_hash::{PasswordHash, PasswordVerifier}, Argon2};
use chrono::{Utc, Duration};
use jsonwebtoken::{encode, decode, EncodingKey, DecodingKey, Header, Validation};
use rand::Rng;

use crate::domain::services::cache_service::CacheService;
use crate::domain::services::email_service::EmailService;
use crate::domain::repositories::user_repository::UserRepository;
use crate::application::dto::auth_dto::{LoginRequest, LoginResponse, UserInfo, RefreshRequest, RefreshResponse, ForgotPasswordRequest};
use crate::shared::errors::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
    pub token_type: String,
}

pub struct AuthUseCase<U, C, E> {
    user_repo: Arc<U>,
    cache_service: Arc<C>,
    email_service: Arc<E>,
    jwt_secret: String,
}

impl<U, C, E> AuthUseCase<U, C, E>
where
    U: UserRepository,
    C: CacheService,
    E: EmailService,
{
    pub fn new(
        user_repo: Arc<U>, 
        cache_service: Arc<C>,
        email_service: Arc<E>
    ) -> Self {
        let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "KODE_RAHASIA_SUPER_KUAT_UNTUK_JWT_HAIS".to_string());
        Self { user_repo, cache_service, email_service, jwt_secret }
    }

    pub async fn login(&self, req: LoginRequest) -> Result<LoginResponse, AppError> {
        let user_opt = self.user_repo.find_by_username(&req.username).await
            .map_err(|e| AppError::InternalServerError(e))?;

        let user = match user_opt {
            Some(u) => u,
            None => return Err(AppError::Unauthorized("Username atau Password salah".to_string())),
        };

        let parsed_hash = PasswordHash::new(&user.password_hash)
            .map_err(|_| AppError::InternalServerError("Error hashing parsing".to_string()))?;
        
        if Argon2::default().verify_password(req.password.as_bytes(), &parsed_hash).is_err() {
            return Err(AppError::Unauthorized("Username atau Password salah".to_string()));
        }

        let access_exp = Utc::now()
            .checked_add_signed(Duration::hours(1))
            .expect("valid timestamp")
            .timestamp() as usize;

        let refresh_exp = Utc::now()
            .checked_add_signed(Duration::days(30))
            .expect("valid timestamp")
            .timestamp() as usize;

        let access_claims = Claims {
            sub: user.id.to_string(),
            role: user.role.clone(),
            exp: access_exp,
            token_type: "access".to_string(),
        };

        let refresh_claims = Claims {
            sub: user.id.to_string(),
            role: user.role.clone(),
            exp: refresh_exp,
            token_type: "refresh".to_string(),
        };

        let access_token = encode(
            &Header::default(),
            &access_claims,
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        ).map_err(|_| AppError::InternalServerError("Failed to sign token".to_string()))?;

        let refresh_token = encode(
            &Header::default(),
            &refresh_claims,
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        ).map_err(|_| AppError::InternalServerError("Failed to sign token".to_string()))?;

        Ok(LoginResponse {
            access_token,
            refresh_token,
            user: UserInfo { id: user.id, name: user.name, username: user.username, role: user.role },
        })
    }

    pub async fn refresh(&self, req: RefreshRequest) -> Result<RefreshResponse, AppError> {
        let mut validation = Validation::default();
        validation.validate_exp = true;
        
        let token_data = decode::<Claims>(
            &req.refresh_token,
            &DecodingKey::from_secret(self.jwt_secret.as_ref()),
            &validation,
        ).map_err(|_| AppError::Unauthorized("Token tidak valid atau sudah kadaluwarsa".to_string()))?;

        if token_data.claims.token_type != "refresh" {
            return Err(AppError::Unauthorized("Tipe token salah. Harap gunakan refresh token.".to_string()));
        }

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
            &EncodingKey::from_secret(self.jwt_secret.as_ref()),
        ).map_err(|_| AppError::InternalServerError("Failed to sign token".to_string()))?;

        Ok(RefreshResponse { access_token })
    }

    pub async fn forgot_password(&self, req: ForgotPasswordRequest) -> Result<(), AppError> {
        let user_opt = self.user_repo.find_by_username(&req.email).await
            .map_err(|e| AppError::InternalServerError(e))?;

        if user_opt.is_none() {
            return Err(AppError::NotFound("Email atau NIK tidak terdaftar dalam sistem.".to_string()));
        }

        let otp: String = {
            let mut rng = rand::thread_rng();
            (0..6).map(|_| rng.gen_range(0..10).to_string()).collect()
        };

        self.cache_service.set_ex(&format!("otp:{}", req.email), &otp, 300).await
            .map_err(|e| AppError::InternalServerError(format!("Gagal menyimpan OTP: {}", e)))?;

        self.email_service.send_email(
            &req.email,
            "Kode OTP Reset Password - HAIS ERP",
            &format!("Kode OTP Anda adalah: {}\n\nJangan berikan kode ini kepada siapapun.", otp)
        ).await.map_err(|e| AppError::InternalServerError(format!("Gagal mengirim email: {}", e)))?;

        Ok(())
    }
}
