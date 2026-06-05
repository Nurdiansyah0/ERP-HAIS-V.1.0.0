use axum::{
    routing::{get, post, put, delete},
    Router, middleware,
};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};
use axum::http::{Method, header};

use crate::interfaces::http::handlers::auth_handler::{self, AppState};
use crate::interfaces::http::handlers::user_handler;
use crate::interfaces::http::middleware::auth_middleware;

pub fn build_router(state: Arc<AppState>) -> Router {
    // Pengaturan CORS yang lebih aman (Sesuai panduan Cybersecurity)
    let cors = CorsLayer::new()
        .allow_origin(Any) // Untuk produksi, ganti Any dengan URL Frontend spesifik
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE, header::ACCEPT]);

    // Routes yang tidak butuh login (Public)
    let public_routes = Router::new()
        .route("/v1/auth/login", post(auth_handler::login_handler))
        .route("/v1/auth/refresh", post(auth_handler::refresh_handler))
        .route("/v1/auth/forgot-password", post(auth_handler::forgot_password_handler));

    // Routes yang BUTUH login (Protected)
    let protected_routes = Router::new()
        .route("/v1/app/dashboard", get(|| async { "Selamat datang di Dashboard Internal HAIS!" }))
        // User CRUD
        .route("/v1/admin/users", get(user_handler::get_all_users_handler))
        .route("/v1/admin/users/:id", get(user_handler::get_user_by_id_handler))
        .route("/v1/admin/users", post(user_handler::create_user_handler))
        .route("/v1/admin/users/:id", put(user_handler::update_user_handler))
        .route("/v1/admin/users/:id", delete(user_handler::delete_user_handler))
        // Pasang middleware di sini:
        .layer(middleware::from_fn(auth_middleware));

    // Gabungkan semua route
    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .with_state(state)
        .layer(cors)
}
