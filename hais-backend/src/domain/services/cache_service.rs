pub trait CacheService: Send + Sync {
    async fn set_ex(&self, key: &str, value: &str, seconds: u64) -> Result<(), String>;
}
