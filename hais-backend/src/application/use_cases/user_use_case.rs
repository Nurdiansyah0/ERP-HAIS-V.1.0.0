use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;
use argon2::{
    password_hash::{PasswordHasher, SaltString},
    Argon2,
};
use rand_core::OsRng;

use crate::domain::repositories::user_repository::UserRepository;
use crate::domain::repositories::audit_log_repository::AuditLogRepository;
use crate::domain::entities::user::User;
use crate::domain::entities::audit_log::AuditLog;
use crate::application::dto::user_dto::{CreateUserRequest, UpdateUserRequest, UserResponse};
use crate::shared::errors::AppError;

pub struct UserUseCase<U, A> {
    user_repo: Arc<U>,
    audit_repo: Arc<A>,
}

impl<U, A> UserUseCase<U, A>
where
    U: UserRepository,
    A: AuditLogRepository,
{
    pub fn new(user_repo: Arc<U>, audit_repo: Arc<A>) -> Self {
        Self { user_repo, audit_repo }
    }

    pub async fn get_all_users(&self) -> Result<Vec<UserResponse>, AppError> {
        let users = self.user_repo.find_all().await
            .map_err(|e| AppError::InternalServerError(e))?;

        let responses = users.into_iter().map(|u| UserResponse {
            id: u.id,
            name: u.name,
            username: u.username,
            role: u.role,
        }).collect();

        Ok(responses)
    }

    pub async fn get_user_by_id(&self, id: Uuid) -> Result<UserResponse, AppError> {
        let user = self.user_repo.find_by_id(id).await
            .map_err(|e| AppError::InternalServerError(e))?
            .ok_or_else(|| AppError::NotFound("User tidak ditemukan".to_string()))?;

        Ok(UserResponse {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
        })
    }

    pub async fn create_user(&self, req: CreateUserRequest, actor_id: Uuid) -> Result<UserResponse, AppError> {
        let existing = self.user_repo.find_by_username(&req.username).await
            .map_err(|e| AppError::InternalServerError(e))?;
            
        if existing.is_some() {
            return Err(AppError::BadRequest("Username sudah digunakan".to_string()));
        }

        let password = req.password.unwrap_or_else(|| "password".to_string());
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map_err(|_| AppError::InternalServerError("Gagal hashing password".to_string()))?
            .to_string();

        let new_user = User {
            id: Uuid::new_v4(),
            name: req.name,
            username: req.username,
            password_hash,
            role: req.role,
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        self.user_repo.create(&new_user).await
            .map_err(|e| AppError::InternalServerError(e))?;

        // Audit Log
        let audit = AuditLog {
            id: Uuid::new_v4(),
            actor_id: Some(actor_id),
            action: "CREATE_USER".to_string(),
            entity_type: "users".to_string(),
            entity_id: new_user.id,
            ip_address: None,
            timestamp: Some(Utc::now()),
        };
        let _ = self.audit_repo.log_action(&audit).await;

        Ok(UserResponse {
            id: new_user.id,
            name: new_user.name,
            username: new_user.username,
            role: new_user.role,
        })
    }

    pub async fn update_user(&self, id: Uuid, req: UpdateUserRequest, actor_id: Uuid) -> Result<UserResponse, AppError> {
        let mut user = self.user_repo.find_by_id(id).await
            .map_err(|e| AppError::InternalServerError(e))?
            .ok_or_else(|| AppError::NotFound("User tidak ditemukan".to_string()))?;

        user.name = req.name;
        user.username = req.username;
        user.role = req.role;

        if let Some(pwd) = req.password {
            if !pwd.is_empty() {
                let salt = SaltString::generate(&mut OsRng);
                user.password_hash = Argon2::default()
                    .hash_password(pwd.as_bytes(), &salt)
                    .map_err(|_| AppError::InternalServerError("Gagal hashing password".to_string()))?
                    .to_string();
            }
        }

        self.user_repo.update(&user).await
            .map_err(|e| AppError::InternalServerError(e))?;

        // Audit Log
        let audit = AuditLog {
            id: Uuid::new_v4(),
            actor_id: Some(actor_id),
            action: "UPDATE_USER".to_string(),
            entity_type: "users".to_string(),
            entity_id: user.id,
            ip_address: None,
            timestamp: Some(Utc::now()),
        };
        let _ = self.audit_repo.log_action(&audit).await;

        Ok(UserResponse {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
        })
    }

    pub async fn delete_user(&self, id: Uuid, actor_id: Uuid) -> Result<(), AppError> {
        let user = self.user_repo.find_by_id(id).await
            .map_err(|e| AppError::InternalServerError(e))?
            .ok_or_else(|| AppError::NotFound("User tidak ditemukan".to_string()))?;

        self.user_repo.delete(user.id).await
            .map_err(|e| AppError::InternalServerError(e))?;

        // Audit Log
        let audit = AuditLog {
            id: Uuid::new_v4(),
            actor_id: Some(actor_id),
            action: "DELETE_USER".to_string(),
            entity_type: "users".to_string(),
            entity_id: user.id,
            ip_address: None,
            timestamp: Some(Utc::now()),
        };
        let _ = self.audit_repo.log_action(&audit).await;

        Ok(())
    }
}
