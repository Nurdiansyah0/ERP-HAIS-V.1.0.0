use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
    http::header,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use crate::application::use_cases::auth_use_case::Claims;
use crate::shared::errors::AppError;

pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    // 1. Ekstrak Header Authorization
    let auth_header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .and_then(|h| {
            if h.starts_with("Bearer ") {
                Some(h[7..].to_string())
            } else {
                None
            }
        });

    let token = match auth_header {
        Some(token) => token,
        None => return Err(AppError::Unauthorized("Token otorisasi tidak ditemukan di Headers".to_string())),
    };

    // 2. Persiapkan secret key
    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "KODE_RAHASIA_SUPER_KUAT_UNTUK_JWT_HAIS".to_string());

    let mut validation = Validation::default();
    validation.validate_exp = true;

    // 3. Decode & Verifikasi Token
    let token_data = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &validation,
    ).map_err(|_| AppError::Unauthorized("Token tidak valid atau sudah kadaluwarsa".to_string()))?;

    if token_data.claims.token_type != "access" {
        return Err(AppError::Unauthorized("Harap gunakan Access Token, bukan Refresh Token".to_string()));
    }

    // 4. Masukkan data user (Claims) ke request extensions agar bisa diakses Handler
    req.extensions_mut().insert(token_data.claims);

    Ok(next.run(req).await)
}
