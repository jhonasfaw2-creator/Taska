# End-to-End Test Results — 2026-07-25

## Summary

| Flow | Status | Notes |
|------|--------|-------|
| Customer: Onboarding → Register → Login | ✅ | send-otp + verify-otp flow works |
| Customer: Update profile & set role | ✅ | PATCH /users/profile, PATCH /users/role |
| Customer: Create task | ✅ | POST /tasks -> PENDING status (correct) |
| Customer: PENDING → SEARCHING | ✅ | PATCH /tasks/:id/status |
| Customer: Track task | ✅ | GET /tasks/:id, GET /tasks/my-tasks |
| Customer: Review tasker | ❌ | No API endpoint exists |
| Tasker: Register → Login | ✅ | send-otp + verify-otp + refresh-token |
| Tasker: Apply | ✅ | POST /taskers/apply |
| Tasker: Update location & go online | ✅ | POST /taskers/location, PATCH /taskers/status |
| Tasker: View nearby tasks | ✅ | GET /taskers/nearby-tasks |
| Tasker: Accept task | ⚠️ | Requires TaskOffer (no API for it) |
| Tasker: PICKED_UP → IN_PROGRESS → COMPLETED | ✅ | All transitions work |
| Tasker: View wallet/earnings | ✅ | Wallet created automatically |

---

## Issues Found

### 1. No Review API endpoint
**Severity:** High
**File:** N/A (missing endpoint)
**Description:** The `Review` model exists in `prisma/schema.prisma` with full relations to `Task` and `User`, but there is no API route to create or read reviews. Customers cannot rate taskers after task completion.

### 2. No TaskOffer creation API
**Severity:** High
**File:** N/A (missing endpoint)
**Description:** The `TaskOffer` model is required for taskers to accept tasks (`taskerTasks.service.ts:212-238` - `acceptTask` requires a PENDING `TaskOffer`). There is no API endpoint to create offers. Taskers can view **nearby tasks** but cannot submit an offer, so they can never complete the acceptance flow. The only way to create an offer is via direct DB insert.

### 3. JWT tokens stale after role change
**Severity:** Medium
**File:** `backend/src/modules/auth/auth.service.ts:69-73`
**Description:** When a user's role changes (via `POST /taskers/apply` at `tasker.service.ts:76` or `PATCH /users/role`), JWT tokens already issued still carry the old role claim. The `requireAuth` middleware uses `req.user.role` from the JWT. Users must manually call `POST /auth/refresh-token` to get a new token with the updated role. Without this, all role-guarded endpoints return 403.

### 4. Response envelope inconsistency
**Severity:** Medium
**File:** Multiple controllers
**Description:** Different endpoints use different response shapes:
| Endpoint | Shape |
|---|---|
| `POST /taskers/apply` | `{ message, taskerProfile }` |
| `POST /taskers/location` | `{ success, data }` |
| `PATCH /taskers/status` | Raw object |
| `POST /tasks/:taskId/accept` | `{ message, task }` |
| `GET /categories` | Bare array |
| `GET /tasks/:taskId/status-history` | Bare array |
| `PATCH /tasks/:taskId/status` | `{ id, status, previousStatus, message }` |
| `GET /wallet/*` | `{ success, data }` |

No consistent envelope (`{ success, data }` or similar) is used across the API.

### 5. Wallet not credited on task completion
**Severity:** Medium
**File:** `backend/src/modules/tasks/taskStatus.service.ts:128-135`
**Description:** When a task transitions to `COMPLETED`, only `completedAt` is set on the task. No wallet transaction is created and `totalEarned` remains 0. The wallet is initialized when the tasker profile is created, but funds never flow into it through the task lifecycle.

### 6. `changedBy` inconsistency in status history
**Severity:** Low
**File:** `backend/src/modules/taskers/taskerTasks.service.ts:264` vs `backend/src/modules/tasks/taskStatus.service.ts:141`
**Description:** When a task is accepted via `taskerTasks.service.acceptTask`, `changedBy` is set to `taskerProfileId`. But all subsequent status updates via `taskStatus.service.updateTaskStatus` use `userId`. This creates an inconsistent data pattern in `TaskStatusHistory`.

### 7. `verify-otp` response omits user id
**Severity:** Low
**File:** `backend/src/modules/auth/auth.controller.ts:33-34`
**Description:** The verify-otp response only returns `{ user: { phoneNumber } }` without `user.id`. Clients must decode the JWT to get the user ID. This adds friction for client-side onboarding flows.

### 8. TaskOffer `updated_at` NOT NULL constraint
**Severity:** Low
**File:** `backend/prisma/schema.prisma` (`@updatedAt` on TaskOffer)
**Description:** The `@updatedAt` Prisma attribute creates a NOT NULL constraint on `updated_at`. Direct SQL operations (seed scripts, manual inserts) must explicitly provide this column, making them error-prone.

---

## Verified Working

| Endpoint | Method | Status |
|---|---|---|
| `POST /api/v1/auth/send-otp` | ✅ | Returns OTP in dev, 200 |
| `POST /api/v1/auth/verify-otp` | ✅ | Returns user + tokens, 200 |
| `POST /api/v1/auth/refresh-token` | ✅ | Returns new accessToken with fresh role |
| `PATCH /api/v1/users/profile` | ✅ | Updates firstName/lastName/email |
| `PATCH /api/v1/users/role` | ✅ | Changes role in DB |
| `GET /api/v1/categories` | ✅ | Returns array of 9 categories |
| `POST /api/v1/tasks` | ✅ | Creates task in PENDING, 201 |
| `GET /api/v1/tasks/my-tasks` | ✅ | Array of customer's tasks |
| `GET /api/v1/tasks/:id` | ✅ | Single task with status |
| `PATCH /api/v1/tasks/:id/status` | ✅ | All valid transitions work |
| `GET /api/v1/tasks/:id/status-history` | ✅ | Full ordered history |
| `POST /api/v1/taskers/apply` | ✅ | Creates profile + role change |
| `GET /api/v1/taskers/profile` | ✅ | Returns profile with verificationStatus |
| `POST /api/v1/taskers/location` | ✅ | Updates lat/lng + sets online |
| `PATCH /api/v1/taskers/status` | ✅ | Toggles isOnline |
| `GET /api/v1/taskers/nearby-tasks` | ✅ | Returns nearby SEARCHING tasks |
| `POST /api/v1/taskers/:taskId/accept` | ✅ | Accepts task (requires TaskOffer) |
| `GET /api/v1/wallet` | ✅ | Returns wallet with zero balance |
| `GET /api/v1/wallet/balance` | ✅ | Balance summary |
| `GET /api/v1/wallet/transactions` | ✅ | Empty transactions array |

## Valid Status Transitions

```
PENDING → SEARCHING (Customer)
PENDING → CANCELLED (Customer)
SEARCHING → CANCELLED (Customer)
ACCEPTED → PICKED_UP (Tasker)
PICKED_UP → IN_PROGRESS (Tasker)
IN_PROGRESS → COMPLETED (Tasker)
```
