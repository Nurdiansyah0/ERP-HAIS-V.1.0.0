# HAIS ERP

**Hang Nadim ARFF Integrated System** — Sistem ERP modern untuk operasional Airport Rescue and Fire Fighting (ARFF) di Bandar Udara Internasional Hang Nadim.

## 🚀 Tech Stack

- **Mobile Frontend**: React Native (Expo) + TypeScript
- **Backend**: Rust (Axum framework) + PostgreSQL
- **Architecture**: Clean Architecture + Domain-Driven Design (DDD)
- **Mobile Platform**: Cross-platform (iOS & Android)
- **CI/CD**: GitHub Actions

## 📁 Project Structure (Best Practice)

```
ERP-HAIS-V.1.0.0/
├── .github/workflows/     # CI/CD pipelines (lint, test, build)
├── docs/                  # All documentation
│   ├── API_CONTRACT.md    # API & DB contract
│   └── data/              # Sample data, templates, checklists
├── HAIS-App/              # React Native Mobile Application
│   ├── src/               # Source code (domain, data, presentation)
│   └── ...
├── hais-backend/          # Rust Backend (Axum)
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   └── ...
├── scripts/               # Build, migration, deploy scripts (future)
├── docker/                # Dockerfiles & compose (future)
├── .env.example
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
└── docker-compose.yml     # (optional, multi-service)
```

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- Rust (stable) + Cargo
- PostgreSQL
- Docker (recommended)

### Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in values
3. Backend: `cd hais-backend && cargo run`
4. Frontend: `cd HAIS-App && npm install && npx expo start`

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Branching strategy (GitHub Flow)
- Commit message convention (Conventional Commits)
- Pull Request process

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Developed for Hang Nadim International Airport ARFF operations.
