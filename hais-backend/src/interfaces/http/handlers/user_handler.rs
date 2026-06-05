use axum::{
    extract::{State, Path},
    Json, Extension,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::application::dto::user_dto::{CreateUserRequest, UpdateUserRequest, UserResponse};
use crate::application::use_cases::user_use_case::UserUseCase;
use crate::infrastructure::database::postgres_user_repository::PostgresUserRepository;
use crate::infrastructure::database::postgres_audit_log_repository::PostgresAuditLogRepository;
use crate::interfaces::http::responses::ApiResponse;
use crate::shared::errors::AppError;
use crate::application::use_cases::auth_use_case::Claims;

use crate::interfaces::http::handlers::auth_handler::AppState;

pub type AppUserUseCase = UserUseCase<PostgresUserRepository, PostgresAuditLogRepository>;

pub async fn get_all_users_handler(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
) -> Result<ApiResponse<Vec<UserResponse>>, AppError> {
    if claims.role != "superuser" && claims.role != "administrator" {
        return Err(AppError::Unauthorized("Akses ditolak. Fitur ini hanya untuk administrator.".to_string()));
    }

    let result = state.user_use_case.get_all_users().await?;
    Ok(ApiResponse::success(result, "Berhasil mengambil daftar user"))
}

pub async fn get_user_by_id_handler(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Extension(claims): Extension<Claims>,
) -> Result<ApiResponse<UserResponse>, AppError> {
    if claims.role != "superuser" && claims.role != "administrator" {
        return Err(AppError::Unauthorized("Akses ditolak.".to_string()));
    }

    let result = state.user_use_case.get_user_by_id(id).await?;
    Ok(ApiResponse::success(result, "Berhasil mengambil data user"))
}

pub async fn create_user_handler(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<ApiResponse<UserResponse>, AppError> {
    if claims.role != "superuser" && claims.role != "administrator" {
        return Err(AppError::Unauthorized("Akses ditolak.".to_string()));
    }

    let actor_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::InternalServerError("Invalid actor ID".to_string()))?;

    let result = state.user_use_case.create_user(payload, actor_id).await?;
    Ok(ApiResponse::success(result, "Berhasil membuat user baru"))
}

pub async fn update_user_handler(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<ApiResponse<UserResponse>, AppError> {
    if claims.role != "superuser" && claims.role != "administrator" {
        return Err(AppError::Unauthorized("Akses ditolak.".to_string()));
    }

    let actor_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::InternalServerError("Invalid actor ID".to_string()))?;

    let result = state.user_use_case.update_user(id, payload, actor_id).await?;
    Ok(ApiResponse::success(result, "Berhasil memperbarui data user"))
}

pub async fn delete_user_handler(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Extension(claims): Extension<Claims>,
) -> Result<ApiResponse<()>, AppError> {
    if claims.role != "superuser" && claims.role != "administrator" {
        return Err(AppError::Unauthorized("Akses ditolak.".to_string()));
    }

    let actor_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::InternalServerError("Invalid actor ID".to_string()))?;

    state.user_use_case.delete_user(id, actor_id).await?;
    Ok(ApiResponse::success_no_data("Berhasil menghapus user"))
}
