use crate::domain::entities::audit_log::AuditLog;
use crate::domain::repositories::audit_log_repository::AuditLogRepository;
use sqlx::PgPool;

pub struct PostgresAuditLogRepository {
    pool: PgPool,
}

impl PostgresAuditLogRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl AuditLogRepository for PostgresAuditLogRepository {
    async fn log_action(&self, audit_log: &AuditLog) -> Result<(), String> {
        sqlx::query(
            r#"INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, ip_address, timestamp)
               VALUES ($1, $2, $3, $4, $5, $6, $7)"#
        )
        .bind(audit_log.id)
        .bind(audit_log.actor_id)
        .bind(&audit_log.action)
        .bind(&audit_log.entity_type)
        .bind(audit_log.entity_id)
        .bind(&audit_log.ip_address)
        .bind(audit_log.timestamp)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }
}
