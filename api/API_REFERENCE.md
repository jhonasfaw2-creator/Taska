# Taska API Reference

REST API for the Taska platform.

- **Base URL (local):** `http://localhost:5000`
- **API prefix:** `/api/v1`
- **Auth:** JWT bearer token — send `Authorization: Bearer <accessToken>` on protected routes.
- **Content type:** `application/json`

All error responses use the shape:

```json
{ "success": false, "error": "Human-readable message" }
```

---

## Health

### `GET /api/v1/health`
Public. Returns service status.

```json
{ "status": "ok", "timestamp": "2026-07-21T10:00:00.000Z" }
```

---

## Authentication

Phone-number OTP flow. In development (`DEV_MODE=true`), `send-otp` returns the
generated `otp` in the response to ease local testing.

### `POST /api/v1/auth/send-otp`
Public.

Request:
```json
{ "phoneNumber": "+251911223344" }
```
Response:
```json
{ "message": "OTP sent", "otp": "123456" }
```
> `otp` is only included in development mode.

### `POST /api/v1/auth/verify-otp`
Public. Verifies the code, creating the user on first login.

Request:
```json
{ "phoneNumber": "+251911223344", "code": "123456" }
```
Response:
```json
{
  "user": { "phoneNumber": "+251911223344" },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```
- `accessToken` — short-lived; attach to protected requests.
- `refreshToken` — long-lived; use with `refresh-token` to obtain a new access token.

### `POST /api/v1/auth/refresh-token`
Public. Exchanges a refresh token for a fresh access token. The new token
reflects the user's **current** role, so call this after a role change (e.g.
applying to become a tasker).

Request:
```json
{ "refreshToken": "<jwt>" }
```
Response:
```json
{ "accessToken": "<jwt>" }
```

---

## Users
All routes require authentication.

### `GET /api/v1/users/profile`
Returns the current user's profile.
```json
{
  "id": "uuid", "firstName": "User", "lastName": "",
  "phoneNumber": "+251911223344", "email": null,
  "profileImage": null, "role": "CUSTOMER", "isVerified": true
}
```

### `PATCH /api/v1/users/profile`
Updates editable profile fields.
```json
{ "firstName": "Abebe", "lastName": "Kebede", "email": "a@example.com" }
```

### `PATCH /api/v1/users/role`
Updates the user's role (`CUSTOMER` | `TASKER`).
```json
{ "role": "TASKER" }
```

---

## Categories

### `GET /api/v1/categories`
Requires authentication. Returns active task categories.
```json
[ { "id": "uuid", "name": "Delivery", "slug": "delivery", "iconUrl": null } ]
```

---

## Tasks
All routes require authentication.

### `GET /api/v1/tasks`
Returns recent tasks.

### `POST /api/v1/tasks`
Creates a task.
```json
{
  "categoryId": "uuid",
  "title": "Deliver documents",
  "description": "Pick up an envelope and drop it off.",
  "pickupAddress": "Bole, Addis Ababa",
  "pickupLatitude": 9.01, "pickupLongitude": 38.76,
  "dropoffAddress": "Piassa, Addis Ababa",
  "dropoffLatitude": 9.03, "dropoffLongitude": 38.75,
  "vehicleType": "MOTORCYCLE",
  "estimatedPrice": 150,
  "specialInstructions": "Call on arrival"
}
```
`vehicleType` is one of `WALKING`, `MOTORCYCLE`, `CAR`, `VAN`, `TRUCK`.

### `GET /api/v1/tasks/my-tasks`
Returns tasks created by the current user.

### `GET /api/v1/tasks/:taskId`
Returns a single task by id.

### `POST /api/v1/tasks/:taskId/accept`
Accepts a task (tasker action).

### `PATCH /api/v1/tasks/:taskId/status`
Transitions a task's status. Allowed transitions:

| From         | To            | Allowed role |
|--------------|---------------|--------------|
| `PENDING`    | `SEARCHING`   | CUSTOMER     |
| `PENDING`    | `CANCELLED`   | CUSTOMER     |
| `SEARCHING`  | `CANCELLED`   | CUSTOMER     |
| `ACCEPTED`   | `PICKED_UP`   | TASKER       |
| `PICKED_UP`  | `IN_PROGRESS` | TASKER       |
| `IN_PROGRESS`| `COMPLETED`   | TASKER       |

```json
{ "status": "SEARCHING" }
```

### `GET /api/v1/tasks/:taskId/status-history`
Returns the ordered status-change history for a task.

---

## Taskers
All routes require authentication.

### `POST /api/v1/taskers/apply`
Creates a tasker profile and promotes the user's role to `TASKER`.
```json
{ "vehicleType": "MOTORCYCLE", "experience": 3, "bio": "Fast and reliable" }
```
> After applying, call `POST /auth/refresh-token` to obtain a token carrying the
> new `TASKER` role before calling tasker-only routes.

### `GET /api/v1/taskers/profile`
Returns the current user's tasker profile.

### `PATCH /api/v1/taskers/status`
Sets online/offline availability.
```json
{ "isOnline": true }
```

### `GET /api/v1/taskers/tasks`
**Requires `TASKER` role.** Returns available tasks the tasker can accept.

---

## Notifications
All routes require authentication.

### `POST /api/v1/notifications/register-device`
Registers a push token for the device.
```json
{ "pushToken": "ExponentPushToken[...]", "platform": "ios" }
```

### `GET /api/v1/notifications`
Returns the current user's notifications.

### `PATCH /api/v1/notifications/:id/read`
Marks a notification as read.

---

## Realtime (Socket.IO)

The WebSocket server is attached to the same HTTP server (`ws://<host>:5000`).
Authenticate by passing the access token in the connection `auth`:

```js
io(url, { auth: { token: accessToken } });
```

Client → server events: `join:task`, `leave:task`.
Server → client events: `task_created`, `task_matched`, `task_accepted`,
`task_status_changed`, `task_cancelled`, `new_message`, `notification_created`.
