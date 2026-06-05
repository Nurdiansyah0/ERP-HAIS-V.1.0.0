use crate::domain::entities::audit_log::AuditLog;

pub trait AuditLogRepository: Send + Sync {
    async fn log_action(&self, audit_log: &AuditLog) -> Result<(), String>;
}
