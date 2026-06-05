use crate::domain::entities::user::User;

pub trait UserRepository: Send + Sync {
    async fn find_by_username(&self, username: &str) -> Result<Option<User>, String>;
    async fn find_by_id(&self, id: uuid::Uuid) -> Result<Option<User>, String>;
    async fn find_all(&self) -> Result<Vec<User>, String>;
    async fn create(&self, user: &User) -> Result<(), String>;
    async fn update(&self, user: &User) -> Result<(), String>;
    async fn delete(&self, id: uuid::Uuid) -> Result<(), String>;
    async fn count_admins(&self) -> Result<i64, String>;
}
