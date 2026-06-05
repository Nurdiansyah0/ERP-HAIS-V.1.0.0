use crate::domain::services::cache_service::CacheService;

pub struct RedisCacheService {
    client: redis::Client,
}

impl RedisCacheService {
    pub fn new(client: redis::Client) -> Self {
        Self { client }
    }
}

impl CacheService for RedisCacheService {
    async fn set_ex(&self, key: &str, value: &str, seconds: u64) -> Result<(), String> {
        let mut conn = self.client.get_multiplexed_async_connection().await
            .map_err(|e| format!("Redis Connection Error: {}", e))?;
            
        let _: () = redis::cmd("SET")
            .arg(key)
            .arg(value)
            .arg("EX")
            .arg(seconds)
            .query_async(&mut conn)
            .await
            .map_err(|e| format!("Redis SET Error: {}", e))?;

        Ok(())
    }
}
