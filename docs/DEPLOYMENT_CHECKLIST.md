# Taska — Production Deployment Checklist

## Pre-deployment

### Backend

- [ ] `NODE_ENV=production` and `DEV_MODE=false` set
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` generated via `openssl rand -hex 32`
- [ ] `DATABASE_URL` points to production PostgreSQL (with SSL)
- [ ] `CORS_ORIGINS` restricted to known app domains
- [ ] `LOG_FORMAT=combined` for structured logging
- [ ] Environment variables loaded from `.env.production` or secrets manager
- [ ] Rate limiting configured (200 req/15min default)
- [ ] `npm run build` passes (TypeScript compiles cleanly)
- [ ] `npm test` passes (all unit, integration, and API tests)
- [ ] Prisma migrations generated and tested: `npm run db:migrate:deploy`
- [ ] Prisma client generated: `npm run db:generate`
- [ ] Swagger docs accessible at `/api/docs` (may be disabled in prod)
- [ ] Health endpoint `GET /api/health` responds with `status: "ok"` and DB `"connected"`
- [ ] All secrets excluded from version control (`.env`, `.env.production` in `.gitignore`)

### Mobile (Expo)

- [ ] `eas.json` configured with production build profile
- [ ] `app.json` has correct `ios.bundleIdentifier` and `android.package`
- [ ] `extra.eas.projectId` set to actual EAS project ID
- [ ] Production env vars set in `eas.json` build profile (`EXPO_PUBLIC_API_URL`, etc.)
- [ ] App icons and splash screen assets added
- [ ] App version bumped (`version` + `android.versionCode`)
- [ ] Code signing certificates configured in EAS (iOS)
- [ ] Keystore configured in EAS (Android)
- [ ] Test build submitted via `eas build --profile production`
- [ ] Production build tested on physical devices

---

## Docker Deployment

### Build & Run Locally

```bash
# Build image
docker compose build

# Start with dev defaults
docker compose up -d

# Start with production overrides
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Checklist

- [ ] `Dockerfile` builds without errors
- [ ] Image runs as non-root user (`taska`)
- [ ] Container health check configured (orchestrator-level)
- [ ] Logs output to stdout/stderr (not files) — 12-factor app
- [ ] Database migrations run on startup (`npm run db:migrate:deploy`)
- [ ] Secrets passed via environment variables, not baked into image
- [ ] Image tagged with semantic version or commit SHA
- [ ] Container restarts on crash (`restart: unless-stopped`)

---

## Platform-Specific Deployment

### Railway

```bash
# Deploy from GitHub repo or CLI
railway login
railway init
railway up

# Set environment variables via Dashboard or CLI
railway variables set NODE_ENV=production JWT_SECRET=...
```

- [ ] `NODE_ENV=production` set in Railway dashboard
- [ ] Public URL configured in `CORS_ORIGINS`
- [ ] PostgreSQL plugin added (Railway managed)
- [ ] Build command: `npm ci && npx prisma generate && npm run build`
- [ ] Start command: `npx prisma migrate deploy && node dist/server.js`

### Render

- [ ] Web Service created from Git repo or CLI
- [ ] Build command: `npm ci && npx prisma generate && npm run build`
- [ ] Start command: `./run-migrate-and-start.sh` (or inline)
- [ ] Environment variables set in Render dashboard
- [ ] Health check path: `/api/v1/health`
- [ ] Auto-deploy enabled for `main` branch

### Fly.io

```bash
fly launch --region iad
fly secrets set JWT_SECRET=... JWT_REFRESH_SECRET=... DATABASE_URL=...
fly deploy
```

- [ ] `fly.toml` configured with correct `internal_port` (5000)
- [ ] Secrets set via `fly secrets set` (not in `fly.toml`)
- [ ] PostgreSQL via Fly Volumes or managed Postgres
- [ ] App scaled to at least 1 instance (`min_machines_running = 1`)
- [ ] Auto-stop/start configured appropriately

### DigitalOcean App Platform

- [ ] App spec (`app.yaml` or via dashboard) configured
- [ ] Source repo connected with auto-deploy
- [ ] Environment variables set in dashboard

### AWS (ECS / Elastic Beanstalk / EKS)

- [ ] Container image pushed to ECR
- [ ] Task definition or app spec references correct image
- [ ] Secrets stored in AWS Secrets Manager or Parameter Store
- [ ] ALB health check path: `/api/v1/health`
- [ ] Auto-scaling rules configured (CPU > 70% triggers scale-up)
- [ ] RDS PostgreSQL with SSL enabled

---

## Post-deployment

### Smoke Tests

- [ ] `curl https://api.taska.app/api/v1/health` returns `{"status":"ok","database":"connected",...}`
- [ ] Auth flow works: send OTP → verify OTP → receive JWT
- [ ] Protected routes return 401 without token
- [ ] CORS headers present on cross-origin requests
- [ ] WebSocket connections accepted
- [ ] Swagger UI loads at `/api/docs`
- [ ] Rate limit returned on rapid requests (`429 Too Many Requests`)
- [ ] Response body compressed (`Content-Encoding: gzip`)
- [ ] Security headers present (`X-Frame-Options`, `X-Content-Type-Options`, etc.)

### Monitoring

- [ ] Health check pings every 30s (configured in platform dashboard)
- [ ] Application logs streaming to aggregator
- [ ] Error tracking (Sentry / Datadog) initialized
- [ ] Uptime monitoring configured (Pingdom / Better Uptime / Checkly)
- [ ] Database connection alerts configured
- [ ] CPU / Memory usage alerts configured
- [ ] SSL certificate valid and auto-renewing

### Security

- [ ] All HTTP traffic redirected to HTTPS
- [ ] JWT secrets rotated from defaults
- [ ] Database password rotated from defaults
- [ ] Rate limiting active (200 requests per 15 min globally)
- [ ] Request body limited to 1 MB
- [ ] Helmet security headers active
- [ ] CORS restricted to known domains
- [ ] Prisma client logs suppressed in production (only errors)
- [ ] `express.json` body size limited
- [ ] Graceful shutdown implemented (30s forced timeout)
- [ ] Non-root user runs container (not `root`)

---

## Rollback Plan

1. **Docker**: Revert to previous image tag
2. **Railway / Render**: Redeploy previous deployment from dashboard
3. **Fly.io**: `fly deploy --image registry.fly.io/taska-backend:<previous-tag>`
4. **Database migration rollback**: `npx prisma migrate down` (tested on staging first)
5. **Mobile**: Increment `versionCode`/`version`; submit hotfix build via EAS
