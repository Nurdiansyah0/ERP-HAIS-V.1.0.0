use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub username: String,
    pub password: Option<String>,
    pub role: String,
}

#[derive(Deserialize)]
pub struct UpdateUserRequest {
    pub name: String,
    pub username: String,
    pub password: Option<String>,
    pub role: String,
}

#[derive(Serialize)]
pub struct UserResponse {
    pub id: uuid::Uuid,
    pub name: String,
    pub username: String,
    pub role: String,
}
