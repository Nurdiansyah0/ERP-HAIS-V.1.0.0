use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AuditLog {
    pub id: uuid::Uuid,
    pub actor_id: Option<uuid::Uuid>,
    pub action: String,
    pub entity_type: String,
    pub entity_id: uuid::Uuid,
    pub ip_address: Option<String>,
    pub timestamp: Option<DateTime<Utc>>,
}
