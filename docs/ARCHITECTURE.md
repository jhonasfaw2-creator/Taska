# Taska — Admin Panel Architecture

> **Last updated:** July 25, 2026

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

backend/src/modules/admin/
├── admin.service.ts            # Business logic (all admin operations)
├── admin.controller.ts         # HTTP request handlers
├── admin.routes.ts             # Express router with RBAC middleware
├── admin.validation.ts         # Zod validation schemas
├── audit.service.ts            # Audit log service
└── permissions.ts              # RBAC roles & permission mappings
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

### Middleware Chain

```
Route Request
  │
  ▼
requireAuth          ← JWT verification (auth.middleware.ts)
  │
  ▼
requireAdmin         ← Role check: must be ADMIN or SUPER_ADMIN (admin.middleware.ts)
  │
  ▼
requirePermission()  ← Fine-grained RBAC check (permission.middleware.ts)
  │
  ▼
Controller           ← Request handler (admin.controller.ts)
  │
  ▼
Service              ← Business logic (admin.service.ts)
```

### Error Handling Chain

```
Controller throws AppError
  │
  ▼
securityErrorHandler  ← Logs 401/403 events to audit log (security.middleware.ts)
  │
  ▼
globalErrorHandler    ← Returns JSON error response (error.middleware.ts)
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

## 8. Testing

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
