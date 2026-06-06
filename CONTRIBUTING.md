# Contributing to HAIS ERP

Thank you for your interest in contributing to HAIS ERP!

## Branching Strategy

We follow **GitHub Flow**:

- `main` branch is always production-ready
- Create short-lived feature branches from `main`
- Naming convention:
  - `feature/login-ui`
  - `fix/invoice-calculation`
  - `hotfix/critical-payment-bug`

## Commit Messages

We use **Conventional Commits** for better changelog and versioning:

```bash
git commit -m "feat: add multi-level approval workflow"
git commit -m "fix: correct stock calculation in inventory module"
git commit -m "docs: update API contract"
```

## Pull Requests

1. Keep PRs small (< 400 lines ideal)
2. Add clear description + screenshots for UI changes
3. Link related issues if any
4. All CI checks must pass
5. Request review from team members

## Code Style

- Backend (Rust): Follow `cargo fmt` and `cargo clippy`
- Frontend (React Native): Follow project ESLint + TypeScript strict mode

## Questions?

Open an issue or ask in team chat.
