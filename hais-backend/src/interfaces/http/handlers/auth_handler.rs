use axum::{extract::State, Json};
use std::sync::Arc;

use crate::application::dto::auth_dto::{LoginRequest, RefreshRequest, ForgotPasswordRequest};
use crate::application::use_cases::auth_use_case::AuthUseCase;
use crate::infrastructure::database::postgres_user_repository::PostgresUserRepository;
use crate::infrastructure::cache::redis_service::RedisCacheService;
use crate::infrastructure::external::email_service::GmailRestEmailService;
use crate::interfaces::http::responses::ApiResponse;
use crate::shared::errors::AppError;

use crate::interfaces::http::handlers::user_handler::AppUserUseCase;

pub type AppAuthUseCase = AuthUseCase<PostgresUserRepository, RedisCacheService, GmailRestEmailService>;

pub struct AppState {
    pub auth_use_case: Arc<AppAuthUseCase>,
    pub user_use_case: Arc<AppUserUseCase>,
}

pub async fn login_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<ApiResponse<crate::application::dto::auth_dto::LoginResponse>, AppError> {
    let result = state.auth_use_case.login(payload).await?;
    Ok(ApiResponse::success(result, "Login berhasil"))
}

pub async fn refresh_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RefreshRequest>,
) -> Result<ApiResponse<crate::application::dto::auth_dto::RefreshResponse>, AppError> {
    let result = state.auth_use_case.refresh(payload).await?;
    Ok(ApiResponse::success(result, "Token berhasil diperbarui"))
}

pub async fn forgot_password_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ForgotPasswordRequest>,
) -> Result<ApiResponse<()>, AppError> {
    state.auth_use_case.forgot_password(payload).await?;
    Ok(ApiResponse::success_no_data("Email berisi kode OTP berhasil dikirim!"))
}
