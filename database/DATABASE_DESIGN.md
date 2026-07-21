# Taska — PostgreSQL Database Design

> **Version:** 1.0
> **Engine:** PostgreSQL 16+
> **Status:** Implemented — Prisma schema and migrations live in [`backend/prisma`](../backend/prisma)

---

## 1. Entity Relationship Diagram (ERD)

The following ASCII ERD shows all tables, their primary keys, foreign-key
relationships, and cardinality.  `*` = mandatory (NOT NULL), `o` = optional.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
│  PK user_id (UUID)                                                       │
│  ├─ phone            * UNIQUE                     ─── user_id ──────────┤
│  ├─ email            o UNIQUE                                            │
│  ├─ full_name        *                                                  │
│  ├─ avatar_url       o                                                  │
│  ├─ role             * ENUM('customer','tasker','both')                  │
│  ├─ is_verified      * BOOLEAN default false                            │
│  ├─ is_banned        * BOOLEAN default false                            │
│  └─ ... timestamps + soft-delete                                        │
└──────────────────────────────────────────────────────────────────────────┘
            │ 1                              1 │
            │                                  │
            │                                  │
            ▼ 0..1                            ▼ 0..1
┌──────────────────────────────┐  ┌──────────────────────────────┐
│        TASKERS               │  │    ADMIN_USERS               │
│  PK tasker_id (UUID)         │  │  PK admin_id (UUID)          │
│  ├─ FK user_id     * UNIQUE  │  │  ├─ FK user_id     * UNIQUE  │
│  ├─ is_approved    *         │  │  ├─ role           * ENUM    │
│  ├─ is_online      *         │  │  └─ ... timestamps           │
│  ├─ latitude/longitude       │  └──────────────────────────────┘
│  ├─ hourly_rate    o         │
│  ├─ bio            o         │
│  ├─ completed_tasks * INT   │
│  ├─ avg_rating     * DECIMAL│
│  └─ ... timestamps          │
└──────────────────────────────┘
            │ 1
            │
            ▼ 0..*
┌──────────────────────────────┐
│        VEHICLES              │
│  PK vehicle_id (UUID)        │
│  ├─ FK tasker_id   *         │
│  ├─ type           * ENUM    │
│  ├─ make/model/year *        │
│  ├─ color          o         │
│  ├─ plate_number   *         │
│  ├─ is_verified    * BOOLEAN │
│  └─ ... timestamps           │
└──────────────────────────────┘

┌──────────────────────────────┐
│        CATEGORIES            │
│  PK category_id (UUID)       │
│  ├─ name           * UNIQUE  │
│  ├─ slug           * UNIQUE  │
│  ├─ description    o         │
│  ├─ icon_url       o         │
│  ├─ parent_id      FK(self)  │
│  └─ ... timestamps           │
└──────────────────────────────┘
            │ 1
            │
            ▼ 0..*
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TASKS                                                       │
│  PK task_id (UUID)                                                                       │
│  ├─ FK customer_id           (→ users.user_id)                            *              │
│  ├─ FK tasker_id             (→ taskers.tasker_id)                       o (nullable)    │
│  ├─ FK category_id           (→ categories.category_id)                  *              │
│  ├─ title                    * VARCHAR(255)                                               │
│  ├─ description              * TEXT                                                      │
│  ├─ status                   * ENUM('pending','open','assigned','in_progress',            │
│  │                                    'completed','cancelled')                            │
│  ├─ pickup_address           * TEXT                                                      │
│  ├─ pickup_latitude          * DECIMAL(10,7)                                             │
│  ├─ pickup_longitude         * DECIMAL(10,7)                                             │
│  ├─ dropoff_address          o TEXT (nullable for non-delivery tasks)                    │
│  ├─ dropoff_latitude         o DECIMAL(10,7)                                             │
│  ├─ dropoff_longitude        o DECIMAL(10,7)                                             │
│  ├─ estimated_price          * DECIMAL(10,2) CHECK >= 0                                │
│  ├─ final_price              o DECIMAL(10,2) CHECK >= 0 (set on completion)              │
│  ├─ scheduled_at             o TIMESTAMPTZ                                               │
│  ├─ started_at               o TIMESTAMPTZ                                               │
│  ├─ completed_at             o TIMESTAMPTZ                                               │
│  ├─ cancelled_at             o TIMESTAMPTZ                                               │
│  ├─ cancellation_reason      o TEXT                                                      │
│  ├─ cancelled_by             o ENUM('customer','tasker','system','admin')                │
│  │  [3 cols are NULL together or all set — CHECK constraint]                              │
│  └─ ... timestamps + soft-delete                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────┘
            │ 1                          1 │                     1 │
            │                              │                      │
            ▼ 0..*                         ▼ 0..*                 ▼ 0..*
┌─────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────┐
│   TASK_IMAGES       │  │  TASK_STATUS_HISTORY     │  │   TASK_OFFERS       │
│  PK image_id (UUID) │  │  PK history_id (UUID)    │  │  PK offer_id (UUID) │
│  ├─ FK task_id   *  │  │  ├─ FK task_id        *  │  │  ├─ FK task_id    * │
│  ├─ image_url    *  │  │  ├─ from_status      o  │  │  ├─ FK tasker_id  * │
│  ├─ is_primary   *  │  │  ├─ to_status        *  │  │  ├─ price        * │
│  ├─ sort_order   *  │  │  ├─ changed_by       *  │  │  ├─ message      o │
│  └─ ... timestamps  │  │  ├─ reason           o  │  │  ├─ status       *  │
└─────────────────────┘  │  └─ ... timestamps      │  └─ ... timestamps   │
                         └─────────────────────────┘  └─────────────────────┘

            │ 1 (task)                       1 (task)
            │                                  │
            ▼ 0..*                             ▼ 0..*
┌──────────────────────────────┐  ┌──────────────────────────────┐
│        REVIEWS               │  │        MESSAGES              │
│  PK review_id (UUID)         │  │  PK message_id (UUID)        │
│  ├─ FK task_id     *         │  │  ├─ FK task_id     *         │
│  │  UNIQUE (t_id,revwr) │  │  ├─ FK sender_id   * (→users)│
│  ├─ FK reviewer_id * (→users)│  │  ├─ content        * TEXT    │
│  ├─ FK target_id   * (→users)│  │  ├─ content        * TEXT    │
│  ├─ rating         * INT(1-5)│  │  ├─ read_at        o         │
│  ├─ comment        o TEXT     │  │  └─ ... timestamps          │
│  └─ ... timestamps           │  └──────────────────────────────┘
└──────────────────────────────┘

┌────────────────────────────────────────────────┐
│              PAYMENTS                           │
│  PK payment_id (UUID)                           │
│  ├─ FK task_id           * UNIQUE               │
│  ├─ FK customer_id       * (→ users)            │
│  ├─ FK tasker_id         * (→ taskers)          │
│  ├─ amount               * DECIMAL(10,2)        │
│  ├─ platform_fee         * DECIMAL(10,2)        │
│  ├─ tasker_payout        * DECIMAL(10,2)        │
│  ├─ status               * ENUM(                │
│  │    'pending','held','released',              │
│  │    'refunded','failed')                      │
│  ├─ payment_method       * VARCHAR(50)          │
│  ├─ stripe_payment_id    o VARCHAR(255)         │
│  ├─ released_at          o TIMESTAMPTZ          │
│  └─ ... timestamps                              │
└────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         WALLET_TRANSACTIONS             │
│  PK transaction_id (UUID)               │
│  ├─ FK user_id            *             │
│  ├─ type                 * ENUM(        │
│  │   'deposit','withdrawal',            │
│  │   'payment','refund',               │
│  │   'fee','payout')                   │
│  ├─ amount               * DECIMAL(10,2)│
│  ├─ balance_before       * DECIMAL(10,2)│
│  ├─ balance_after        * DECIMAL(10,2)│
│  ├─ reference_type       * VARCHAR(50)  │
│  ├─ reference_id         * UUID         │
│  ├─ description          o TEXT         │
│  └─ ... timestamps                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         NOTIFICATIONS                   │
│  PK notification_id (UUID)              │
│  ├─ FK user_id            *             │
│  ├─ type                 * ENUM         │
│  ├─ title                * VARCHAR(255) │
│  ├─ body                 * TEXT         │
│  ├─ data                 o JSONB        │
│  ├─ read_at              o TIMESTAMPTZ  │
│  ├─ sent_at              o TIMESTAMPTZ  │
│  └─ ... timestamps                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         OTP_VERIFICATIONS               │
│  PK otp_id (UUID)                       │
│  ├─ phone                * VARCHAR(20)  │
│  ├─ otp_code             * VARCHAR(6)   │
│  ├─ purpose              * ENUM(        │
│  │   'registration','login',            │
│  │   'password_reset')                  │
│  ├─ attempts             * INT default 0│
│  ├─ max_attempts         * INT default 5│
│  ├─ verified_at          o TIMESTAMPTZ  │
│  ├─ expires_at           * TIMESTAMPTZ  │
│  └─ ... timestamps                      │
└─────────────────────────────────────────┘
```

---

## 2. Table Definitions

### 2.1 `users`

Central identity table. Every person on the platform is a user; roles
(customer / tasker / admin) are derived via the `role` column and/or
lookup in related tables.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | Primary key |
| `phone` | `VARCHAR(20)` | `NOT NULL UNIQUE` | Phone number (primary auth) |
| `email` | `VARCHAR(255)` | `UNIQUE` | Email address (optional) |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | Display / legal name |
| `avatar_url` | `TEXT` | | Profile picture URL |
| `role` | `user_role` | `NOT NULL DEFAULT 'customer'` | `ENUM: customer, tasker, both` |
| `is_verified` | `BOOLEAN` | `NOT NULL DEFAULT false` | Phone/email verified |
| `is_banned` | `BOOLEAN` | `NOT NULL DEFAULT false` | Platform ban flag |
| `ban_reason` | `TEXT` | | Why the user was banned |
| `last_active_at` | `TIMESTAMPTZ` | | Last request timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | – auto-updated via trigger |
| `deleted_at` | `TIMESTAMPTZ` | | Soft-delete timestamp |

**Indexes:**
- `idx_users_phone` on `phone` (unique index covers the UNIQUE constraint)
- `idx_users_email` on `email` (partial, `WHERE email IS NOT NULL`)
- `idx_users_role` on `role`
- `idx_users_created_at` on `created_at`

---

### 2.2 `taskers`

Tasker profile. A `users` record must exist first. One user → one tasker
profile maximum, enforced by the UNIQUE on `user_id`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `tasker_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `user_id` | `UUID` | `NOT NULL UNIQUE → users(user_id)` | FK to user |
| `is_approved` | `BOOLEAN` | `NOT NULL DEFAULT false` | Admin approval status |
| `is_online` | `BOOLEAN` | `NOT NULL DEFAULT false` | Accepting tasks flag |
| `latitude` | `DECIMAL(10,7)` | | Current location (live tracking) |
| `longitude` | `DECIMAL(10,7)` | | |
| `hourly_rate` | `DECIMAL(10,2)` | | Base hourly rate in KSh (or local currency) |
| `bio` | `TEXT` | | Short bio / description |
| `completed_tasks` | `INTEGER` | `NOT NULL DEFAULT 0` | Denormalized counter |
| `cancelled_tasks` | `INTEGER` | `NOT NULL DEFAULT 0` | Denormalized counter |
| `avg_rating` | `DECIMAL(3,2)` | `NOT NULL DEFAULT 0.00` | Denormalized average rating |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT true` | Manual availability toggle |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `deleted_at` | `TIMESTAMPTZ` | | Soft-delete |

**Indexes:**
- `idx_taskers_location` on `latitude, longitude` (GiST index for proximity search)
- `idx_taskers_online` on `(is_online, is_approved, is_available)` WHERE active
- `idx_taskers_rating` on `avg_rating DESC`
- `idx_taskers_completed` on `completed_tasks DESC`

---

### 2.3 `vehicles`

Each tasker can register multiple vehicles (e.g., bicycle, car, truck).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `vehicle_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `tasker_id` | `UUID` | `NOT NULL → taskers(tasker_id)` | FK to tasker |
| `type` | `vehicle_type` | `NOT NULL` | `ENUM: bicycle, motorcycle, car, van, truck, other` |
| `make` | `VARCHAR(100)` | `NOT NULL` | Manufacturer |
| `model` | `VARCHAR(100)` | `NOT NULL` | Model name |
| `year` | `SMALLINT` | | Model year |
| `color` | `VARCHAR(50)` | | |
| `plate_number` | `VARCHAR(20)` | `NOT NULL` | License plate |
| `is_verified` | `BOOLEAN` | `NOT NULL DEFAULT false` | Documents verified by admin |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | Currently in use |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `deleted_at` | `TIMESTAMPTZ` | | Soft-delete |

**Indexes:**
- `idx_vehicles_tasker` on `tasker_id`
- `idx_vehicles_plate` on `plate_number`

---

### 2.4 `categories`

Hierarchical task categories (e.g., Cleaning → Home Cleaning → Deep Cleaning).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `category_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `name` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Display name |
| `slug` | `VARCHAR(100)` | `NOT NULL UNIQUE` | URL-friendly identifier |
| `description` | `TEXT` | | |
| `icon_url` | `TEXT` | | Icon/image |
| `parent_id` | `UUID` | `→ categories(category_id)` | Self-referencing FK for hierarchy |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` | Display ordering |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_categories_slug` on `slug` (unique)
- `idx_categories_parent` on `parent_id`
- `idx_categories_sort` on `sort_order`

---

### 2.5 `tasks`

The core entity — a task posted by a customer.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `task_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `customer_id` | `UUID` | `NOT NULL → users(user_id)` | FK — who posted the task |
| `tasker_id` | `UUID` | `→ taskers(tasker_id)` | FK — assigned tasker (nullable until assigned) |
| `category_id` | `UUID` | `NOT NULL → categories(category_id)` | |
| `title` | `VARCHAR(255)` | `NOT NULL` | Short summary |
| `description` | `TEXT` | `NOT NULL` | Detailed instructions |
| `status` | `task_status` | `NOT NULL DEFAULT 'pending'` | `ENUM: pending, open, assigned, in_progress, completed, cancelled` |
| `pickup_address` | `TEXT` | `NOT NULL` | |
| `pickup_latitude` | `DECIMAL(10,7)` | `NOT NULL` | Geospatial for matching |
| `pickup_longitude` | `DECIMAL(10,7)` | `NOT NULL` | |
| `dropoff_address` | `TEXT` | | Nullable for non-delivery tasks |
| `dropoff_latitude` | `DECIMAL(10,7)` | | |
| `dropoff_longitude` | `DECIMAL(10,7)` | | |
| `estimated_price` | `DECIMAL(10,2)` | `NOT NULL CHECK (estimated_price >= 0)` | Quote at posting |
| `final_price` | `DECIMAL(10,2)` | `CHECK (final_price >= 0)` | Adjusted after completion |
| `scheduled_at` | `TIMESTAMPTZ` | | Optional future scheduling |
| `started_at` | `TIMESTAMPTZ` | | When tasker started work |
| `completed_at` | `TIMESTAMPTZ` | | When task was completed |
| `cancelled_at` | `TIMESTAMPTZ` | `CHECK (
  (cancelled_at IS NULL) = (cancelled_by IS NULL)
  AND (cancelled_at IS NULL) = (cancellation_reason IS NULL)
)` | All three are NULL or all set together |
| `cancellation_reason` | `TEXT` | | Free-text reason |
| `cancelled_by` | `cancel_actor` | | `ENUM: customer, tasker, system, admin` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `deleted_at` | `TIMESTAMPTZ` | | Soft-delete |

**Indexes:**
- `idx_tasks_customer` on `customer_id`
- `idx_tasks_tasker` on `tasker_id` (partial `WHERE tasker_id IS NOT NULL`)
- `idx_tasks_status` on `status`
- `idx_tasks_pickup_location` GiST on `pickup_latitude, pickup_longitude`
- `idx_tasks_created_at` on `created_at DESC`
- `idx_tasks_scheduled` on `scheduled_at` (partial `WHERE scheduled_at IS NOT NULL`)
- Composite: `idx_tasks_status_created` on `(status, created_at DESC)`
- Composite: `idx_tasks_customer_status` on `(customer_id, status)`

---

### 2.6 `task_images`

Multiple images per task, uploaded during creation or completion as proof.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `image_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `task_id` | `UUID` | `NOT NULL → tasks(task_id) ON DELETE CASCADE` | |
| `image_url` | `TEXT` | `NOT NULL` | Signed S3 URL / path |
| `is_primary` | `BOOLEAN` | `NOT NULL DEFAULT false` | Cover image |
| `sort_order` | `INTEGER` | `NOT NULL DEFAULT 0` | Display order |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_task_images_task` on `task_id`
- `idx_task_images_primary` on `(task_id, is_primary)` WHERE `is_primary = true`

---

### 2.7 `task_status_history`

Immutable audit log of every status transition.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `history_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `task_id` | `UUID` | `NOT NULL → tasks(task_id) ON DELETE CASCADE` | |
| `from_status` | `task_status` | | Previous status (null on creation) |
| `to_status` | `task_status` | `NOT NULL` | New status |
| `changed_by` | `VARCHAR(50)` | `NOT NULL` | Actor: system, customer_id, tasker_id, admin_id |
| `reason` | `TEXT` | | Optional note |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_status_history_task` on `task_id`
- `idx_status_history_created` on `created_at DESC`

**PostgreSQL feature:** Use an `AFTER INSERT` trigger on `tasks.status` to
auto-populate this table. Alternatively, handle it at the application layer
for more control.

---

### 2.8 `task_offers`

When a task is `open`, taskers submit offers with their price.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `offer_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `task_id` | `UUID` | `NOT NULL → tasks(task_id) ON DELETE CASCADE` | |
| `tasker_id` | `UUID` | `NOT NULL → taskers(tasker_id)` | |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | Offer amount |
| `message` | `TEXT` | | Optional cover note |
| `status` | `offer_status` | `NOT NULL DEFAULT 'pending'` | `ENUM: pending, accepted, rejected, withdrawn` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_offers_task` on `task_id`
- `idx_offers_tasker` on `tasker_id`
- `idx_offers_status` on `(task_id, status)`
- Unique constraint on `(task_id, tasker_id)` to prevent duplicate offers

---

### 2.9 `reviews`

Both parties can review each other after a completed task. One review per
user per task (enforced by UNIQUE on `(task_id, reviewer_id)`).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `review_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `task_id` | `UUID` | `NOT NULL → tasks(task_id)` | |
| `reviewer_id` | `UUID` | `NOT NULL → users(user_id)` | Who wrote it |
| `target_id` | `UUID` | `NOT NULL → users(user_id)` | Who is being reviewed |
| `rating` | `SMALLINT` | `NOT NULL CHECK (rating >= 1 AND rating <= 5)` | 1–5 stars |
| `comment` | `TEXT` | | Written feedback |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Unique Constraints:**
- `UNIQUE (task_id, reviewer_id)` — each user can review a given task at most once.
  This allows both the customer → tasker review AND the tasker → customer review
  for the same task (two rows).

**Indexes:**
- `idx_reviews_target` on `target_id`
- `idx_reviews_task` on `task_id`
- `idx_reviews_rating` on `(target_id, rating)`
- Composite: `idx_reviews_target_created` on `(target_id, created_at DESC)`
- (UNIQUE constraint `(task_id, reviewer_id)` automatically creates a unique index)

---

### 2.10 `messages`

In-task chat between customer and tasker.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `message_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `task_id` | `UUID` | `NOT NULL → tasks(task_id) ON DELETE CASCADE` | |
| `sender_id` | `UUID` | `NOT NULL → users(user_id)` | |
| `content` | `TEXT` | `NOT NULL` | Message body |
| `read_at` | `TIMESTAMPTZ` | | When recipient read it |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_messages_task` on `task_id`
- `idx_messages_sender` on `sender_id`
- `idx_messages_unread` on `(task_id, read_at)` — find unread counts
- `idx_messages_created` on `(task_id, created_at)` — chronological fetch

**Performance:** For production with high message volume, consider
partitioning this table by `created_at` (e.g., monthly partitions).

---

### 2.11 `notifications`

Push and in-app notifications.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `notification_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `user_id` | `UUID` | `NOT NULL → users(user_id)` | Recipient |
| `type` | `notification_type` | `NOT NULL` | `ENUM: task_assigned, task_update, new_offer, payment_received, review_received, promo, system` |
| `title` | `VARCHAR(255)` | `NOT NULL` | |
| `body` | `TEXT` | `NOT NULL` | |
| `data` | `JSONB` | | Arbitrary payload (task_id, URL, etc.) |
| `read_at` | `TIMESTAMPTZ` | | |
| `sent_at` | `TIMESTAMPTZ` | | When push was dispatched |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_notifications_user` on `user_id`
- `idx_notifications_unread` on `(user_id, read_at)` WHERE `read_at IS NULL`
- `idx_notifications_created` on `(user_id, created_at DESC)`

---

### 2.12 `user_devices`

Push notification tokens per device.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `device_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `user_id` | `UUID` | `NOT NULL → users(user_id) ON DELETE CASCADE` | |
| `platform` | `VARCHAR(20)` | `NOT NULL` | `ios`, `android`, `web` |
| `push_token` | `TEXT` | `NOT NULL` | Expo/APNs/FCM token |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | |
| `last_used_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_devices_user` on `user_id`
- `idx_devices_token` on `push_token` — for upsert

---

### 2.13 `payments`

One payment record per completed task. The platform holds funds in escrow
and releases to the tasker upon completion.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `payment_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `task_id` | `UUID` | `NOT NULL UNIQUE → tasks(task_id)` | One payment per task |
| `customer_id` | `UUID` | `NOT NULL → users(user_id)` | Payer |
| `tasker_id` | `UUID` | `NOT NULL → taskers(tasker_id)` | Payee |
| `amount` | `DECIMAL(10,2)` | `NOT NULL CHECK (amount > 0)` | Total charged to customer |
| `platform_fee` | `DECIMAL(10,2)` | `NOT NULL CHECK (platform_fee >= 0)` | Taska commission |
| `tasker_payout` | `DECIMAL(10,2)` | `NOT NULL CHECK (tasker_payout > 0)` | Amount tasker receives = amount - platform_fee |
| `status` | `payment_status` | `NOT NULL DEFAULT 'pending'` | `ENUM: pending, held, released, refunded, failed, cancelled` |
| `payment_method` | `VARCHAR(50)` | `NOT NULL` | `card`, `mobile_money`, `wallet` |
| `stripe_payment_intent_id` | `VARCHAR(255)` | | Stripe reference |
| `stripe_transfer_id` | `VARCHAR(255)` | | Stripe transfer reference |
| `paid_at` | `TIMESTAMPTZ` | | When customer was charged |
| `held_at` | `TIMESTAMPTZ` | | When funds entered escrow |
| `released_at` | `TIMESTAMPTZ` | | When tasker was paid out |
| `refunded_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_payments_task` on `task_id` (unique)
- `idx_payments_customer` on `customer_id`
- `idx_payments_tasker` on `tasker_id`
- `idx_payments_status` on `status`
- `idx_payments_stripe` on `stripe_payment_intent_id`

---

### 2.14 `wallet_transactions`

Immutable ledger tracking every wallet movement. Provides an audit trail
for all financial operations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `transaction_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `user_id` | `UUID` | `NOT NULL → users(user_id)` | |
| `type` | `wallet_tx_type` | `NOT NULL` | `ENUM: deposit, withdrawal, payment, refund, fee, payout, credit, debit` |
| `amount` | `DECIMAL(10,2)` | `NOT NULL CHECK (amount <> 0)` | Positive = credit, negative = debit |
| `balance_before` | `DECIMAL(10,2)` | `NOT NULL` | Snapshot before |
| `balance_after` | `DECIMAL(10,2)` | `NOT NULL` | Snapshot after |
| `reference_type` | `VARCHAR(50)` | `NOT NULL` | Entity type: `payment`, `task`, `withdrawal`, `refund` |
| `reference_id` | `UUID` | `NOT NULL` | FK to the referenced entity |
| `description` | `TEXT` | | Human-readable note |
| `metadata` | `JSONB` | | Extra data for reconciliation |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_wallet_user` on `user_id`
- `idx_wallet_created` on `(user_id, created_at DESC)`
- `idx_wallet_reference` on `(reference_type, reference_id)`

**Notes:**
- Never UPDATE or DELETE rows — this is an append-only ledger.
- Use `SERIALIZABLE` isolation or advisory locks when reading/updating
  wallet balances to prevent race conditions.

---

### 2.15 `admin_users`

Admin panel access.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `admin_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `user_id` | `UUID` | `NOT NULL UNIQUE → users(user_id)` | Link to user record |
| `role` | `admin_role` | `NOT NULL DEFAULT 'moderator'` | `ENUM: super_admin, admin, moderator, support` |
| `permissions` | `JSONB` | `NOT NULL DEFAULT '[]'` | Fine-grained permission array |
| `last_login_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |
| `deleted_at` | `TIMESTAMPTZ` | | Soft-delete |

**Indexes:**
- `idx_admin_user` on `user_id` (unique)
- `idx_admin_role` on `role`

---

### 2.16 `otp_verifications`

One-time passwords for phone-based authentication.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `otp_id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `phone` | `VARCHAR(20)` | `NOT NULL` | Phone number |
| `otp_code` | `VARCHAR(6)` | `NOT NULL` | 4–6 digit code |
| `purpose` | `otp_purpose` | `NOT NULL` | `ENUM: registration, login, password_reset, phone_change` |
| `attempts` | `SMALLINT` | `NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= max_attempts)` | Failed attempt counter |
| `max_attempts` | `SMALLINT` | `NOT NULL DEFAULT 5 CHECK (max_attempts > 0)` | Lockout threshold |
| `is_used` | `BOOLEAN` | `NOT NULL DEFAULT false` | Prevent replay |
| `verified_at` | `TIMESTAMPTZ` | | When successfully verified |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | TTL (typically 5–10 min) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_otp_phone_purpose` on `(phone, purpose, created_at DESC)` — find latest
- `idx_otp_expires` on `expires_at` — for cleanup jobs
- Partial index: `idx_otp_active` on `(phone, purpose)` WHERE `verified_at IS NULL AND expires_at > NOW()`

**Cleanup:** Schedule a periodic job (pg_cron or application-level) to
DELETE rows where `expires_at < NOW() - INTERVAL '24 hours'`.

---

### 2.17 `audit_logs`

Immutable record of admin actions for compliance and security.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `log_id` | `BIGSERIAL` | `PK` | Sequential ID (also useful for cursor pagination) |
| `admin_id` | `UUID` | `→ admin_users(admin_id)` | Who performed the action |
| `action` | `VARCHAR(100)` | `NOT NULL` | e.g., `user_banned`, `tasker_approved`, `task_cancelled` |
| `entity_type` | `VARCHAR(50)` | `NOT NULL` | Table name |
| `entity_id` | `UUID` | `NOT NULL` | Record PK |
| `changes` | `JSONB` | | Before/after diff |
| `ip_address` | `INET` | | |
| `user_agent` | `TEXT` | | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | |

**Indexes:**
- `idx_audit_entity` on `(entity_type, entity_id)`
- `idx_audit_admin` on `admin_id`
- `idx_audit_created` on `created_at DESC`
- `idx_audit_action` on `action`

---

## 3. ENUM Types

| Enum Name | Values |
|---|---|
| `user_role` | `'customer', 'tasker', 'both'` |
| `task_status` | `'pending', 'open', 'assigned', 'in_progress', 'completed', 'cancelled'` |
| `cancel_actor` | `'customer', 'tasker', 'system', 'admin'` |
| `offer_status` | `'pending', 'accepted', 'rejected', 'withdrawn'` |
| `vehicle_type` | `'bicycle', 'motorcycle', 'car', 'van', 'truck', 'other'` |
| `payment_status` | `'pending', 'held', 'released', 'refunded', 'failed', 'cancelled'` |
| `wallet_tx_type` | `'deposit', 'withdrawal', 'payment', 'refund', 'fee', 'payout', 'credit', 'debit'` |
| `notification_type` | `'task_assigned', 'task_update', 'new_offer', 'payment_received', 'review_received', 'promo', 'system'` |
| `admin_role` | `'super_admin', 'admin', 'moderator', 'support'` |
| `otp_purpose` | `'registration', 'login', 'password_reset', 'phone_change'` |

---

## 4. Relationship Summary

| # | Relationship | Type | Description |
|---|---|---|---|
| 1 | **users → taskers** | 1:0..1 | A user may optionally have one tasker profile. |
| 2 | **users → admin_users** | 1:0..1 | A user may optionally be an admin. |
| 3 | **users → tasks** (as customer) | 1:0..* | A customer can post many tasks. |
| 4 | **users → tasks** (as assigned tasker) | 1:0..* via taskers | A tasker (who is also a user) can be assigned many tasks. |
| 5 | **users → reviews** (as reviewer) | 1:0..* | A user can write many reviews. |
| 6 | **users → reviews** (as target) | 1:0..* | A user can be reviewed many times. |
| 7 | **users → messages** (as sender) | 1:0..* | A user can send many messages. |
| 8 | **users → notifications** | 1:0..* | A user can receive many notifications. |
| 9 | **users → wallet_transactions** | 1:0..* | A user has many wallet entries. |
| 10 | **taskers → vehicles** | 1:0..* | A tasker can register multiple vehicles. |
| 11 | **taskers → task_offers** | 1:0..* | A tasker can make many offers on open tasks. |
| 12 | **categories → categories** (self) | 1:0..* | A category can have many subcategories. |
| 13 | **categories → tasks** | 1:0..* | A category groups many tasks. |
| 14 | **tasks → task_images** | 1:0..* | A task can have multiple images. |
| 15 | **tasks → task_status_history** | 1:0..* | A task has many status transitions. |
| 16 | **tasks → task_offers** | 1:0..* | A task can receive many offers from taskers. |
| 17 | **tasks → reviews** | 1:0..2 | A task has up to two reviews (customer→tasker and tasker→customer). |
| 18 | **tasks → messages** | 1:0..* | A task has a conversation thread. |
| 19 | **tasks → payments** | 1:0..1 | A completed task has at most one payment. |
| 20 | **payments → wallet_transactions** | 1:0..* (reference) | A payment may generate wallet entries. |

---

## 5. Soft Delete Strategy

Tables with `deleted_at`:
- `users`, `taskers`, `vehicles`, `tasks`, `admin_users`

All queries MUST include `WHERE deleted_at IS NULL` in base queries.
Views or application-level query builders should enforce this
automatically.

**Why not all tables?**
- `task_status_history`, `messages`, `wallet_transactions`, `audit_logs`,
  `otp_verifications` are immutable/append-only and should never be
  deleted.
- `reviews`, `notifications`, `payments` are business-critical records
  that should only be hidden, not physically deleted — handled via
  related entity soft-delete cascading.

**PII Protection:**
- Phone numbers and emails in `users` should be hashed or encrypted at
  rest using PostgreSQL `pgcrypto` or application-level encryption for
  GDPR / data-protection compliance. OTP codes should never be stored in
  plaintext beyond their TTL window.

---

## 6. Performance & Scalability Considerations

| Concern | Strategy |
|---|---|
| **Location-based search** | GiST index on `(latitude, longitude)` pairs for KNN queries. |
| **Hot tables** | `messages` and `task_status_history` are append-heavy. Consider partitioning `messages` by month on `created_at`. |
| **Read replicas** | Offload reporting/analytics queries to replicas. |
| **Connection pooling** | Use PgBouncer in transaction mode. |
| **Caching** | Cache user profiles, category trees, and tasker search results in Redis. |
| **Pagination** | Use cursor-based (keyset) pagination on `created_at` with a UUID tiebreaker — avoid `OFFSET` on large tables. |
| **Denormalization** | `taskers.completed_tasks`, `.avg_rating`, `.cancelled_tasks` are maintained via application-layer or triggers to avoid COUNT queries. |
| **JSONB** | Used sparingly only where schema-flexible data is needed (`notifications.data`, `audit_logs.changes`, `admin_users.permissions`). |
| **Indexing discipline** | Every FK has an index. Query-specific composite indexes cover the most common WHERE / ORDER BY patterns. |

---

## 7. Data Lifecycle

```
Customer posts task  ──→  status: 'pending'
      │
      ▼
Admin/auto-approve   ──→  status: 'open'
      │
      ▼
Taskers submit offers ──→  task_offers.status: 'pending'
      │
      ▼
Customer accepts offer ──→  status: 'assigned'
                            task_offers.status: 'accepted'
                            other offers → 'rejected'
      │
      ▼
Tasker starts work    ──→  status: 'in_progress'
                            payment.status: 'held' (escrow)
      │
      ▼
Tasker completes      ──→  status: 'completed'
                            payment.status: 'released'
                            wallet_transaction: payout
      │
      ▼
Both parties review   ──→  reviews created
```

---

## 8. Next Steps

1. **Generate Prisma schema** from this design inside `backend/prisma/schema.prisma`
2. **Create the first migration** via `npx prisma migrate dev --name init`
3. **Seed the database** with categories and a test user
4. **Implement repository / service layer** in the backend

> This document is the source of truth for the database. Update it whenever
> the schema changes.
