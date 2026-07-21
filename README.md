# Taska — Task Management Platform

| Directory | Purpose |
|---|---|
| [`mobile/`](./mobile) | Customer & tasker mobile app (Expo / React Native) |
| [`backend/`](./backend) | REST API (Express.js / TypeScript / Prisma / PostgreSQL) |
| [`admin/`](./admin) | Admin dashboard (React / …) |
| [`docs/`](./docs) | Architecture docs, ADRs, runbooks |
| [`database/`](./database) | DB migrations, seed scripts, ERDs |
| [`api/`](./api) | API specs (OpenAPI / Postman collections) |
| [`assets/`](./assets) | Shared brand assets (logos, icons, fonts) |
| [`scripts/`](./scripts) | Dev / CI utility scripts |

---

## Quick start

```bash
# Install dependencies for all projects
npm install --prefix mobile
npm install --prefix backend

# Start the mobile app
npm run mobile:start

# Start the backend API (development)
npm run backend:dev
```

See each directory's own README for detailed instructions.
