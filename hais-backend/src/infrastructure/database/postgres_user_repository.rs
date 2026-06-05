use crate::domain::entities::user::User;
use crate::domain::repositories::user_repository::UserRepository;
use sqlx::PgPool;

pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl UserRepository for PostgresUserRepository {
    async fn find_by_username(&self, username: &str) -> Result<Option<User>, String> {
        let row = sqlx::query_as::<_, User>(
            r#"SELECT id, name, username, password_hash, role, created_at, updated_at 
               FROM users WHERE username = $1 AND deleted_at IS NULL"#
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(row)
    }

    async fn create(&self, user: &User) -> Result<(), String> {
        sqlx::query(
            r#"INSERT INTO users (id, name, username, password_hash, role, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7)"#
        )
        .bind(&user.id)
        .bind(&user.name)
        .bind(&user.username)
        .bind(&user.password_hash)
        .bind(&user.role)
        .bind(user.created_at)
        .bind(user.updated_at)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn find_by_id(&self, id: uuid::Uuid) -> Result<Option<User>, String> {
        let row = sqlx::query_as::<_, User>(
            r#"SELECT id, name, username, password_hash, role, created_at, updated_at 
               FROM users WHERE id = $1 AND deleted_at IS NULL"#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(row)
    }

    async fn find_all(&self) -> Result<Vec<User>, String> {
        let rows = sqlx::query_as::<_, User>(
            r#"SELECT id, name, username, password_hash, role, created_at, updated_at 
               FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC"#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(rows)
    }

    async fn update(&self, user: &User) -> Result<(), String> {
        sqlx::query(
            r#"UPDATE users SET name = $1, username = $2, password_hash = $3, role = $4, updated_at = NOW()
               WHERE id = $5 AND deleted_at IS NULL"#
        )
        .bind(&user.name)
        .bind(&user.username)
        .bind(&user.password_hash)
        .bind(&user.role)
        .bind(user.id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn delete(&self, id: uuid::Uuid) -> Result<(), String> {
        sqlx::query(
            r#"UPDATE users SET deleted_at = NOW() WHERE id = $1"#
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    async fn count_admins(&self) -> Result<i64, String> {
        let count: (i64,) = sqlx::query_as(
            r#"SELECT COUNT(*) FROM users WHERE username = 'admin'"#
        )
        .fetch_one(&self.pool)
        .await
        .unwrap_or((0,));

        Ok(count.0)
    }
}
