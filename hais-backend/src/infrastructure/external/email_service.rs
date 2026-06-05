use crate::domain::services::email_service::EmailService;
use lettre::Message;
use reqwest::Client;
use serde_json::json;
use base64::{engine::general_purpose::URL_SAFE, Engine as _};

pub struct GmailRestEmailService {
    client_id: String,
    client_secret: String,
    refresh_token: String,
    http_client: Client,
}

impl GmailRestEmailService {
    pub fn new(client_id: String, client_secret: String, refresh_token: String) -> Self {
        Self {
            client_id,
            client_secret,
            refresh_token,
            http_client: Client::new(),
        }
    }

    async fn get_access_token(&self) -> Result<String, String> {
        let url = "https://oauth2.googleapis.com/token";
        
        let params = [
            ("client_id", self.client_id.as_str()),
            ("client_secret", self.client_secret.as_str()),
            ("refresh_token", self.refresh_token.as_str()),
            ("grant_type", "refresh_token"),
        ];

        let response = self.http_client.post(url)
            .form(&params)
            .send()
            .await
            .map_err(|e| format!("Gagal mendapatkan access token: {}", e))?;

        let status = response.status();
        if status.is_success() {
            let json_resp: serde_json::Value = response.json().await.unwrap_or_default();
            if let Some(token) = json_resp["access_token"].as_str() {
                return Ok(token.to_string());
            }
            return Err("Access token tidak ditemukan di response Gmail API".to_string());
        }
        
        let error_text = response.text().await.unwrap_or_default();
        Err(format!("Token response error: {}", error_text))
    }
}

impl EmailService for GmailRestEmailService {
    async fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<(), String> {
        // 1. Dapatkan Access Token terbaru dari Refresh Token
        let access_token = self.get_access_token().await?;

        // 2. Format email menjadi raw format RFC 2822
        let email = Message::builder()
            .from("HAIS System <noreply@hangnadim.com>".parse().unwrap())
            .to(format!("User <{}>", to).parse().unwrap_or_else(|_| "User <admin@hangnadim.com>".parse().unwrap()))
            .subject(subject)
            .body(body.to_string())
            .map_err(|e| format!("Email Builder Error: {}", e))?;

        let raw_email = email.formatted();
        
        // 3. Encode ke Base64 URL Safe (syarat dari Gmail API)
        let encoded_email = URL_SAFE.encode(raw_email);

        // 4. Kirim ke Gmail REST API
        let send_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
        let payload = json!({
            "raw": encoded_email
        });

        tracing::info!("📧 [MENGIRIM EMAIL GMAIL API] Ke: {}", to);

        let response = self.http_client.post(send_url)
            .bearer_auth(access_token)
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Gagal memanggil Gmail API: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Gmail API Error: {}", error_text));
        }
        
        tracing::info!("✅ [EMAIL GMAIL API TERKIRIM] Ke: {}", to);
        
        Ok(())
    }
}
