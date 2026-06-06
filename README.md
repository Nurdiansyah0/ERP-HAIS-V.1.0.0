# HAIS ERP - ARFF Hang Nadim

**ARFF Hang Nadim ERP System** yang mengintegrasikan operasi, pelatihan, dan pemeliharaan untuk Aircraft Rescue and Fire Fighting.

Memberikan real-time monitoring, asset management, personnel readiness, dan compliance dengan regulasi ICAO dan keselamatan penerbangan nasional.

## ✨ Fitur Utama

- **🔑 Accounts & RBAC**: Registrasi, OTP Auth, Role-Based Access Control
- **📅 Operations**: Shift scheduling, armada monitoring
- **👤 Personnel**: HR data, certifications tracking
- **🧯 Fire Protection**: QR-based daily inspections (APAR, Hosereel)
- **🛡️ Audit Log**: Full activity tracking for compliance

## 🏗️ Tech Stack

- **Frontend**: React Native (HAIS-App)
- **Backend**: Rust + Axum + PostgreSQL (hais-backend)
- **Architecture**: Clean / Domain-Driven Design (DDD)

## 🚀 Quick Start

Lihat `DEVELOPMENT.md` untuk setup lokal.

## 📁 Struktur Proyek

```bash
.
├── HAIS-App/          # React Native Mobile App
├── hais-backend/      # Rust Backend
├── docs/              # Dokumentasi
├── .github/           # CI/CD workflows
├── scripts/           # Utility scripts (nanti)
└── ... 
```

## 📄 Dokumentasi Lain

- [API Contract](docs/API_CONTRACT.md)
- [Development Guide](DEVELOPMENT.md) (coming soon)

---

**License**: MIT (lihat LICENSE)
