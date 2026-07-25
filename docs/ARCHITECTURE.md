# Taska — Admin Panel Architecture

> **Last updated:** July 26, 2026

---

## 1. Overview

The admin panel is a full-featured enterprise dashboard for managing the Taska platform. It provides role-based access control (RBAC) for platform operators to manage users, tasks, taskers, payments, notifications, reports, and system settings.

### Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Validation** | Zod |
| **Security** | Helmet, CORS, express-rate-limit, express-validator |
| **Export** | exceljs (XLSX), pdfkit (PDF) |

### Directory Structure

```
admin/
├── src/
│   ├── api/
│   │   └── client.ts          # API client (axios)
│   ├── components/
│   │   ├── Layout.tsx          # Admin layout with sidebar navigation
│   │   └── ConfirmModal.tsx    # Shared confirmation modal
│   ├── pages/
│   │   ├── Login.tsx           # Admin login page
│   │   ├── Dashboard.tsx       # Dashboard stats & charts
│   │   ├── Users.tsx           # User management
│   │   ├── UserDetail.tsx      # User profile details
│   │   ├── Tasks.tsx           # Task management
│   │   ├── TaskDetail.tsx      # Task details & dispute resolution
│   │   ├── Taskers.tsx         # Tasker management
│   │   ├── TaskerDetail.tsx    # Tasker profile details
│   │   ├── Payments.tsx        # Payment management
│   │   ├── PaymentDetail.tsx   # Payment details & refunds
│   │   ├── Wallets.tsx         # Wallet management & payouts
│   │   ├── Notifications.tsx   # Notification sending
│   │   ├── Reports.tsx         # Reports & analytics
│   │   ├── AuditLogs.tsx       # Audit log viewer
│   │   ├── AdminUsers.tsx      # Admin user management
│   │   └── Support.tsx         # Support tools & dispute management
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── App.tsx                 # App root with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles + Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js

backend/src/
├── common/
│   ├── config/
│   │   └── env.ts              # Environment config
│   ├── errors/
│   │   ├── index.ts            # Error exports
│   │   └── AppError.ts         # Custom error class
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── admin.middleware.ts  # Admin role check
│   │   ├── permission.middleware.ts  # RBAC check
│   │   ├── requestId.middleware.ts   # Request ID assignment
│   │   ├── perf.middleware.ts   # Performance monitoring
│   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   ├── security.middleware.ts    # Security audit logging
│   │   ├── notFound.middleware.ts    # 404 handler
│   │   └── error.middleware.ts       # Global error handler
│   ├── types/
│   │   └── index.ts            # Shared type definitions
│   └── utils/
│       ├── logger.ts           # Pino structured logger
│       ├── asyncHandler.ts     # Async error wrapper
│       └── perf.ts             # Performance tracker
├── modules/
│   ├── admin/                  # Admin panel backend
│   │   ├── admin.service.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.routes.ts
│   │   ├── admin.validation.ts
│   │   ├── audit.service.ts
│   │   └── permissions.ts
│   ├── health/                 # Health monitoring
│   │   ├── health.service.ts
│   │   ├── health.controller.ts
│   │   └── health.routes.ts
│   ├── analytics/
│   ├── auth/
│   ├── ...
├── prisma/
│   └── client.ts               # Prisma client (with query perf tracking)
├── app.ts                      # Express app setup
└── server.ts                   # HTTP server startup
```

---

## 2. Authentication & Authorization

### Authentication Flow

```
POST /api/v1/admin/auth/login
  Body: { phoneNumber, password }
  Response: { token, user: { id, role, permissions } }
```

1. Admin enters phone number and password on the login page
2. Backend validates credentials via `loginAdmin()` in `admin.service.ts`
3. On success, returns a JWT token containing `userId`, `phoneNumber`, `role`, and `adminRole`
4. Token is stored in localStorage and sent as `Authorization: Bearer <token>` header
5. Failed login attempts are logged via `logFailedLogin()` to the security audit log
6. JWT expiration is configured via `JWT_ACCESS_EXPIRES_IN` environment variable

### Global Middleware Chain (all requests)

```
Route Request
  │
  ▼
helmet                    ← Security headers
  │
  ▼
cors                      ← Cross-origin access control
  │
  ▼
compression               ← Response compression
  │
  ▼
requestIdMiddleware       ← Assigns x-request-id (UUID / header forward)
  │
  ▼
perfMiddleware            ← Tracks response time, request count, slow requests
  │
  ▼
globalRateLimit / authRateLimit
  │
  ▼
express.json / urlencoded  ← Body parsing (1 MB limit)
  │
  ▼
body-check middleware      ← Ensures POST/PUT/PATCH have req.body
  │
  ▼
request logging middleware ← Logs method / url / requestId → response status / duration
  │
  ▼
static files (/uploads)
  │
  ▼
Route handlers (/api/v1, /api/docs)
  │
  ▼
notFoundHandler           ← 404 → AppError
  │
  ▼
securityErrorHandler      ← Logs 401/403 to audit DB, passes through
  │
  ▼
globalErrorHandler        ← Formats JSON error, hides stack in production
```

### Admin Route Middleware Chain

```
Route handler
  │
  ▼
requireAuth               ← JWT verification (auth.middleware.ts)
  │
  ▼
requireAdmin              ← Role check: ADMIN or SUPER_ADMIN (admin.middleware.ts)
  │
  ▼
requirePermission()       ← Fine-grained RBAC (permission.middleware.ts)
  │
  ▼
Controller                ← Request handler (admin.controller.ts)
  │
  ▼
Service                   ← Business logic (admin.service.ts)
```

---

## 3. Role-Based Access Control (RBAC)

### Admin Roles

| Role | Description | Permissions Count |
|---|---|---|
| **SUPER_ADMIN** | Full system access, including admin user management | 27 |
| **ADMIN** | All operations except admin user management and task reassignment | 25 |
| **MODERATOR** | View + tasker verification + dispute resolution | 10 |
| **SUPPORT** | View-only + dispute resolution | 8 |

### Permission Matrix

| Permission | SUPER_ADMIN | ADMIN | MODERATOR | SUPPORT |
|---|---|---|---|---|
| dashboard:view | ✅ | ✅ | ✅ | ✅ |
| users:view | ✅ | ✅ | ✅ | ✅ |
| users:edit | ✅ | ✅ | ❌ | ❌ |
| users:suspend | ✅ | ✅ | ❌ | ❌ |
| users:reset | ✅ | ✅ | ❌ | ❌ |
| users:delete | ✅ | ❌ | ❌ | ❌ |
| tasks:view | ✅ | ✅ | ✅ | ✅ |
| tasks:edit | ✅ | ✅ | ✅ | ❌ |
| tasks:cancel | ✅ | ✅ | ❌ | ❌ |
| tasks:reassign | ✅ | ❌ | ❌ | ❌ |
| taskers:view | ✅ | ✅ | ✅ | ✅ |
| taskers:verify | ✅ | ✅ | ✅ | ❌ |
| taskers:suspend | ✅ | ✅ | ❌ | ❌ |
| payments:view | ✅ | ✅ | ✅ | ✅ |
| payments:refund | ✅ | ✅ | ❌ | ❌ |
| payouts:approve | ✅ | ✅ | ❌ | ❌ |
| notifications:send | ✅ | ✅ | ❌ | ❌ |
| notifications:broadcast | ✅ | ✅ | ❌ | ❌ |
| support:view | ✅ | ✅ | ✅ | ✅ |
| support:resolve | ✅ | ✅ | ✅ | ✅ |
| reports:view | ✅ | ✅ | ✅ | ✅ |
| reports:export | ✅ | ✅ | ❌ | ❌ |
| analytics:view | ✅ | ✅ | ✅ | ✅ |
| analytics:manage | ✅ | ✅ | ❌ | ❌ |
| audit:view | ✅ | ✅ | ❌ | ❌ |
| admins:manage | ✅ | ❌ | ❌ | ❌ |
| settings:view | ✅ | ✅ | ❌ | ❌ |
| settings:edit | ✅ | ✅ | ❌ | ❌ |

---

## 4. API Endpoints

All admin endpoints are prefixed with `/api/v1/admin`.

### Authentication
| Method | Path | Permission |
|---|---|---|
| POST | `/admin/auth/login` | None (public) |
| GET | `/health` | None (public) — server, database, prisma, memory, performance |

### Dashboard
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/dashboard/stats` | dashboard:view |
| GET | `/admin/dashboard/user-growth` | dashboard:view |
| GET | `/admin/dashboard/task-growth` | dashboard:view |
| GET | `/admin/dashboard/revenue-growth` | dashboard:view |
| GET | `/admin/dashboard/category-distribution` | dashboard:view |

### User Management
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/users` | users:view |
| GET | `/admin/users/:id` | users:view |
| PATCH | `/admin/users/:id` | users:edit |
| POST | `/admin/users/:id/suspend` | users:suspend |
| POST | `/admin/users/:id/reactivate` | users:suspend |
| DELETE | `/admin/users/:id` | users:delete |
| POST | `/admin/users/:id/reset-verification` | users:reset |
| POST | `/admin/users/:id/reset-account` | users:reset |

### Task Management
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/tasks` | tasks:view |
| GET | `/admin/tasks/:id` | tasks:view |
| POST | `/admin/tasks/:id/cancel` | tasks:cancel |
| POST | `/admin/tasks/:id/reassign` | tasks:reassign |
| POST | `/admin/tasks/:id/resolve-dispute` | support:resolve |

### Tasker Management
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/taskers` | taskers:view |
| GET | `/admin/taskers/:id` | taskers:view |
| POST | `/admin/taskers/:id/approve` | taskers:verify |
| POST | `/admin/taskers/:id/reject` | taskers:verify |
| POST | `/admin/taskers/:id/suspend` | taskers:suspend |

### Payments & Payouts
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/payments` | payments:view |
| GET | `/admin/payments/:id` | payments:view |
| POST | `/admin/payments/:id/refund` | payments:refund |
| GET | `/admin/wallets` | payments:view |
| GET | `/admin/wallets/:walletId/transactions` | payments:view |
| POST | `/admin/payouts/approve` | payouts:approve |

### Notifications
| Method | Path | Permission |
|---|---|---|
| POST | `/admin/notifications/send` | notifications:send |
| POST | `/admin/notifications/broadcast` | notifications:broadcast |
| POST | `/admin/notifications/targeted` | notifications:send |

### Reports & Analytics (Admin Module)
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/reports/revenue` | reports:view |
| GET | `/admin/reports/users` | reports:view |
| GET | `/admin/reports/tasks` | reports:view |
| GET | `/admin/reports/payments` | reports:view |
| GET | `/admin/reports/growth` | reports:view |
| GET | `/admin/reports/export` | reports:export |

### Analytics Module
| Method | Path | Permission |
|---|---|---|
| GET | `/analytics/events` | analytics:view |
| GET | `/analytics/events/:id` | analytics:view |
| POST | `/analytics/events` | analytics:manage |
| DELETE | `/analytics/events` | analytics:manage |
| GET | `/analytics/summary` | analytics:view |
| GET | `/analytics/users` | analytics:view |
| GET | `/analytics/tasks` | analytics:view |
| GET | `/analytics/revenue` | analytics:view |
| GET | `/analytics/charts/user-growth` | analytics:view |
| GET | `/analytics/charts/task-growth` | analytics:view |
| GET | `/analytics/charts/revenue-trend` | analytics:view |
| GET | `/analytics/charts/popular-categories` | analytics:view |

All analytics endpoints are prefixed with `/api/v1/analytics` and require admin authentication.

### Audit & Admin Management
| Method | Path | Permission |
|---|---|---|
| GET | `/admin/audit-logs` | audit:view |
| GET | `/admin/admins` | admins:manage |
| POST | `/admin/admins` | admins:manage |
| PATCH | `/admin/admins/:id/role` | admins:manage |
| DELETE | `/admin/admins/:id` | admins:manage |

---

## 5. Security Architecture

### Layers

1. **Helmet** — Sets security headers (CSP, HSTS, X-Frame-Options, etc.)
2. **CORS** — Restricts origins to configured domains
3. **Rate Limiting** — 200 requests per 15 min globally, stricter on auth routes
4. **Request Size Limit** — 1MB max JSON body
5. **JWT Authentication** — Bearer token validation on all protected routes
6. **Admin Role Check** — Ensures user has ADMIN or SUPER_ADMIN role
7. **Permission Check** — Fine-grained RBAC via `requirePermission()`
8. **Audit Logging** — All admin actions logged with admin ID, IP, and changes
9. **Security Error Handler** — Auto-logs 401/403 errors to audit log

### Audit Trail

Every admin action that modifies system state is logged to the `audit_logs` table:

```typescript
await createAuditLog({
  adminId,           // Who performed the action
  action,            // What was done (e.g., 'suspend_user', 'approve_payout')
  entityType,        // Affected entity type
  entityId,          // Affected entity ID
  changes,           // JSON diff of before/after
  ipAddress,         // Origin IP
});
```

### Security Event Logging

Security-relevant events are automatically logged:

| Event | Trigger | Action |
|---|---|---|
| Failed login | Wrong password or unknown account | `login_failed` |
| Auth failure | Invalid/missing JWT token | `auth_failure` |
| Permission denied | User lacks required permission | `permission_denied` |
| Admin access denied | Non-admin tries admin endpoint | `admin_access_denied` |

---

## 6. Frontend Pages

### Overview

| Page | Route | Description |
|---|---|---|
| Login | `/admin/login` | Admin authentication |
| Dashboard | `/admin` | Stats cards, growth charts, category distribution |
| Users | `/admin/users` | User list with search/filter, CRUD actions |
| User Detail | `/admin/users/:id` | User profile, tasker info, activity |
| Tasks | `/admin/tasks` | Task list with search/filter, status badges |
| Task Detail | `/admin/tasks/:id` | Task details, status history, dispute resolution |
| Taskers | `/admin/taskers` | Tasker list with verification filter |
| Tasker Detail | `/admin/taskers/:id` | Tasker profile, wallet, documents, reviews |
| Payments | `/admin/payments` | Payment list with summary cards, date filter |
| Payment Detail | `/admin/payments/:id` | Payment details, refund processing |
| Wallets | `/admin/wallets` | Wallet list, transaction history, payout approval |
| Notifications | `/admin/notifications` | Send/broadcast/targeted notifications |
| Reports | `/admin/reports` | Revenue/users/tasks/payments/growth reports with export |
| Audit Logs | `/admin/audit-logs` | Audit log viewer with action/entity filters |
| Admin Users | `/admin/admins` | Admin user management (SUPER_ADMIN only) |
| Support | `/admin/support` | Support tools, dispute resolution, quick actions |

---

## 7. Export System

### Supported Formats

| Format | Library | Implementation |
|---|---|---|
| **CSV** | Built-in | Manual string building with header row + data rows; field values are escaped for commas, quotes, and newlines |
| **XLSX** | `exceljs` | Styled workbook with summary section + data sheet; column widths and headers defined upfront |
| **PDF** | `pdfkit` | Professional document with header, summary table, detail table, auto-generated footer |

### Export Flow

```
User clicks "Export" →
  Selects report type (Revenue/Users/Tasks/Payments/Growth) →
  Selects format (CSV/XLSX/PDF) →
  GET /admin/reports/export?type=revenue&format=csv →
  Backend fetches data from service layer →
  Formats into requested format →
  Returns file with appropriate Content-Type and Content-Disposition headers
```

---

## 8. Observability

### 8.1 Structured Logging

All server-side logging goes through a centralized **Pino** logger (`common/utils/logger.ts`).

**Configuration:**

| Environment | Level | Format |
|---|---|---|
| `development` | `debug` | Pretty-printed with colors (pino-pretty) |
| `production` | `info` | JSON (structured) |
| `test` | `silent` | No output |

**Redacted fields** (never written to logs):
- `req.headers.authorization` (Bearer tokens)
- `req.headers.cookie`

**Log output format (production):**
```json
{"level":30,"time":"2026-07-26T12:00:00.000Z","requestId":"uuid","method":"GET","url":"/api/v1/health","statusCode":200,"duration":12,"msg":"response sent"}
```

**Key logging points:**
| Point | Level | Data |
|---|---|---|
| Incoming request | `info` | requestId, method, url |
| Response sent | `info` | requestId, method, url, statusCode, duration |
| Unhandled error | `error` | requestId, path, method, err.message, stack (dev only) |
| Slow request (>500ms) | `warn` | method, path, duration, statusCode |
| Slow database query (>1000ms) | `warn` | model, operation, duration |
| Database unreachable | `error` | Error details |
| Server startup | `info` | environment, port, database config status |
| Graceful shutdown | `info` / `error` | Shutdown progress |

### 8.2 Global Error Handler

The `globalErrorHandler` (`common/middleware/error.middleware.ts`) is the last middleware in the chain. It catches all unhandled errors and returns consistent JSON.

**Response format:**
```json
{ "success": false, "error": "Human-readable message", "requestId": "uuid" }
```

**Error type handling:**

| Error Type | Status | Behavior |
|---|---|---|
| `AppError` (operational) | Custom (typically 400–409) | Uses `err.message` and `err.statusCode` |
| `ZodError` (validation) | 400 | Lists all field errors: `"Validation failed: field: message; field2: message2"` |
| `SyntaxError` (malformed JSON) | 400 | `"Invalid JSON in request body."` |
| Prisma P2002 (unique constraint) | 409 | `"A record with that value already exists."` |
| Prisma P2025 (not found) | 404 | `"Record not found."` |
| Prisma P2003 (FK violation) | 400 | `"Referenced record does not exist."` |
| Prisma validation error | 400 | `"Invalid data provided to the database."` |
| Unknown error | 500 | Dev: real message; Production: `"Internal server error"` |

Stack traces are logged in development but **never exposed to clients** in production.

### 8.3 Health Monitoring

**Endpoint:** `GET /api/v1/health` (public, no auth required)

Returns HTTP **200** when all critical services are healthy, **503** when the database is unreachable.

**Response structure:**
```json
{
  "status": "ok",
  "service": "Taska API",
  "version": "1.0.0",
  "timestamp": "2026-07-26T12:00:00.000Z",
  "uptime": 84321,
  "environment": "development",
  "database": { "status": "connected", "latencyMs": 3 },
  "prisma": { "status": "ready", "version": "5.22.0" },
  "memory": { "rss": 89.42, "heapTotal": 67.31, "heapUsed": 52.18, "external": 4.72 },
  "performance": {
    "totalRequests": 1421,
    "routes": [
      { "route": "GET /api/v1/health", "count": 85, "avgMs": 2.5, "maxMs": 15 },
      { "route": "GET /api/v1/auth/send-otp", "count": 320, "avgMs": 180, "maxMs": 1200 }
    ],
    "windowSeconds": 300
  }
}
```

### 8.4 Performance Monitoring

The performance tracker (`common/utils/perf.ts`) records metrics in memory with a **5-minute rolling window**.

**What is tracked:**

| Metric | Source | Threshold |
|---|---|---|
| Request count | `perfMiddleware` — hooks `res.on('finish')` | — |
| Response time (avg / max / min) | `perfMiddleware` | — |
| Slow requests | `perfMiddleware` → `perf.recordRequest()` | >500ms |
| Database query duration | Prisma `$extends` query middleware | — |
| Slow database queries | `prisma/client.ts` → `perf.recordQuery()` | >1000ms |

**Route tracking:** Metrics are keyed by Express route patterns (e.g., `GET /api/v1/users/:id`) rather than raw paths, so parameterized routes are correctly grouped.

**Data exposure:** Performance data is exposed through the health endpoint (`GET /api/v1/health`) for live monitoring. The rolling window resets every 5 minutes to prevent unbounded memory growth.

---

## 9. Testing

### Test Coverage (260 tests)

| Category | Tests | What's Covered |
|---|---|---|
| Auth & Authorization | 5 | Login, missing/expired/malformed token, non-admin rejection |
| Dashboard | 5 | Stats, user/task/revenue growth, category distribution |
| User Management | 10 | List, search, details, update, suspend, reactivate, delete, reset |
| Task Management | 6 | List, filter, details, cancel, reassign, dispute resolution |
| Tasker Management | 6 | List, filter, details, approve, reject, suspend |
| Payments & Refunds | 4 | List, filter, details, process refund |
| Wallets & Payouts | 3 | List, approve payout, wallet transactions |
| Notifications | 4 | Single send, broadcast, broadcast filtered, targeted |
| Audit Logs | 3 | List, filter by action, filter by entity type |
| Admin Users | 5 | List (SUPER_ADMIN only), role restriction, CRUD |
| Reports | 5 | Revenue, users, tasks, payments, growth |
| Export | 6 | CSV/XLSX/PDF for revenue, CSV for users, growth export, unsupported format |
| Permission Enforcement | 13 | All roles, sensitive ops, view-only access |
| Security Restrictions | 6 | Empty/missing/invalid tokens, field validation |

### Running Tests

```bash
# All tests
cd backend && npm test

# Specific test suites
cd backend && npx jest --testPathPattern='admin\.test'
cd backend && npx jest --testPathPattern='analytics\.test'
cd backend && npx jest --testPathPattern='middleware\.test'

# TypeScript check
cd backend && npm run build
cd admin && npm run build

# Lint
cd backend && npm run lint
```
