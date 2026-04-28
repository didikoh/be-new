# AI_CONTEXT

> **Purpose**: This file is a structured context document for external AI assistants (ChatGPT, Copilot, Claude, etc.) to quickly and accurately understand this project without scanning the full codebase. Derived from actual source code only.

---

## 1. Project Overview

- **What it does**: A fitness studio booking and management web app for "Be Studio" — a dance/fitness studio in Batu Pahat, Johor, Malaysia.
- **Production URL**: `https://bestudiobp.com`
- **Backend API base**: `https://bestudiobp.com/be-api/`
- **Three user roles**: `student`, `coach`, `admin` — each has a completely different UI/navigation
- **Tech stack**:
  - **Frontend**: React 19, TypeScript, Vite 6, Zustand 5, Axios 1, React Router v7, i18next (EN/ZH), react-icons, dayjs, date-fns, react-datepicker, react-phone-number-input, clsx
  - **Backend (current)**: PHP 8.1, Slim 4, PHP-DI 7, Eloquent ORM (illuminate/database 10), TCPDF, PhpSpreadsheet, vlucas/phpdotenv
  - **Backend (legacy)**: Raw PHP files in `backend-legacy/` — deprecated, kept for reference only
  - **Database**: MySQL (inferred from Eloquent + config)
- **Architecture style**: SPA (React) + REST API (PHP Slim 4). Session-based auth (PHP `$_SESSION` + cookies). No JWT.

---

## 2. Folder Structure (Important Only)

```
/
├── frontend/               React SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── api/            Axios client, endpoint constants, typed service modules, TS types
│   │   ├── components/     Shared reusable components (incl. admin sub-components)
│   │   ├── contexts/       EMPTY — was previously used, fully replaced by Zustand stores
│   │   ├── layouts/        GlobalWrapper (auth + toast), DefaultLayout (main layout with BottomNavBar)
│   │   ├── locales/        i18n translation JSONs — en/ and zh/ subdirectories
│   │   ├── mocks/          Static mock data (event.ts — used during dev)
│   │   ├── pages/          Page components grouped by role (auth/, admin/, coach/, root)
│   │   ├── routes/         React Router v7 router definition (index.tsx)
│   │   ├── stores/         Zustand global state stores
│   │   └── ultis/          Utility functions (timeCheck.ts — date helpers)
│   ├── public/             Static assets served by Vite
│   ├── .env                VITE_API_BASE_URL (points to production)
│   └── vite.config.ts      Vite config with @/ path alias
│
├── backend/                PHP Slim 4 REST API (active/new backend)
│   ├── app/
│   │   ├── Controllers/    Thin request handlers — delegate to Services
│   │   ├── Services/       All business logic lives here
│   │   ├── Models/         Eloquent ORM models
│   │   ├── Middleware/     AuthMiddleware, CorsMiddleware, SessionMiddleware
│   │   ├── Routes/api.php  Single file with all API routes grouped under /api
│   │   └── Support/        ResponseHelper, UploadHelper, JsonErrorHandler, helpers.php
│   ├── bootstrap/app.php   App bootstrap: DI container, DB, session, CORS, error handling
│   ├── config/             Database connection config
│   ├── public/             Web root (index.php entry point + uploads/)
│   └── uploads/            Uploaded files (profile pics, etc.)
│
├── backend-legacy/         ⚠️ Legacy raw PHP files — DEPRECATED, do not modify
├── docs/                   Project documentation & SQL schema
│   ├── AI_CONTEXT.md       This file
│   ├── CREATE_DB.sql       Planned/future database schema (differs from current models)
│   └── *.md                Development plan, requirements, review notes
└── start-dev.bat           Launches both servers: frontend (npm run dev) + backend (php -S localhost:8000)
```

---

## 3. Core Modules / Systems

### Auth System
- **Responsibility**: Login, register, session check, logout
- **Backend**: `AuthController.php` → `AuthService.php` → Eloquent `User`, `Student`, `Coach`, `Admin` models
- **Frontend**: `useAuthStore` (Zustand) — holds `user` object, exposes `checkAuth()`, `logout()`
- **Mechanism**: PHP `$_SESSION` with cookie. Login stores `user_id` + `role` + `login_time` in session. `checkAuth()` loads profile from DB on every page load.
- **Key files**:
  - `backend/app/Controllers/AuthController.php`
  - `backend/app/Services/AuthService.php`
  - `frontend/src/stores/useAuthStore.ts`
  - `frontend/src/api/services/authService.ts`
  - `frontend/src/api/types/auth.ts`
- **Registration**: Creates both a `user_list` record and a `student_list` record in a DB transaction. Optionally accepts a profile picture (multipart/form-data).
- **Auth guard**: `GlobalWrapper` calls `checkAuth()` on mount and redirects based on role. No dedicated route-level guards in the router config.

### Admin System
- **Responsibility**: Full studio management — courses, members, transactions, bookings, user accounts
- **Backend**: `AdminController.php` → `AdminService.php`
- **Frontend pages**: `AdminHome`, `AdminCourse`, `AdminMember`, `AdminTransaction`, `AdminAccount`
- **Admin-specific components**: `ChargeMember`, `EditingUser`, `Purchase`, `WalkIn`, `ChangePasswordAdmin`
- **PDF invoices**: `AdminService.php` uses TCPDF to generate PDF invoices (served via `/api/admin/invoices/{id}`)
- **Key files**:
  - `backend/app/Controllers/AdminController.php`
  - `backend/app/Services/AdminService.php`
  - `frontend/src/api/services/adminService.ts`
  - `frontend/src/api/types/admin.ts`

### Booking System
- **Responsibility**: Students book/cancel course sessions; admin manages bookings
- **Backend**: `BookingController.php` → `BookingService.php`
- **Types**: Regular booking (`/api/bookings`) and frozen booking (`/api/bookings/frozen`)
- **Admin bookings**: `bookByPhone`, `walkIn`, `cancelBooking` via `AdminController`
- **Key files**:
  - `backend/app/Controllers/BookingController.php`
  - `backend/app/Services/BookingService.php`
  - `frontend/src/api/services/bookingService.ts`
  - `frontend/src/api/types/booking.ts`

### Course System
- **Responsibility**: Course listing, detail, creation, start/cancel/delete (admin)
- **Backend**: `CourseController.php` → `CourseService.php` (public); `AdminController.php` → `AdminService.php` (admin CRUD)
- **Key files**:
  - `backend/app/Controllers/CourseController.php`
  - `backend/app/Services/CourseService.php`
  - `frontend/src/api/services/courseService.ts`
  - `frontend/src/api/types/course.ts`

### Coach System
- **Responsibility**: Coach's schedule overview and course detail
- **Backend**: `CoachController.php` → `CoachService.php`
- **Key files**:
  - `backend/app/Controllers/CoachController.php`
  - `backend/app/Services/CoachService.php`
  - `frontend/src/api/services/coachService.ts`
  - `frontend/src/pages/coach/`

### Profile System
- **Responsibility**: Update profile info, change password (self + admin override)
- **Backend**: `ProfileController.php` → `ProfileService.php`
- **Key files**:
  - `backend/app/Controllers/ProfileController.php`
  - `backend/app/Services/ProfileService.php`
  - `frontend/src/api/services/profileService.ts`

### i18n System
- **Languages**: English (`en`) and Chinese Simplified (`zh`)
- **Namespaces**: `login`, `home`, `schedule`, `account`, `nav`, `detail`, `courseCard`
- **Detection order**: localStorage → navigator → htmlTag
- **Language toggle**: Implemented in `GlobalWrapper` but the button is `display: none` (hidden)
- **Key files**:
  - `frontend/src/i18n.ts`
  - `frontend/src/locales/en/*.json`
  - `frontend/src/locales/zh/*.json`

---

## 4. State Management

- **Library**: Zustand v5 (replaces React Context entirely — `contexts/` folder is empty)
- **Stores** (all in `frontend/src/stores/`):

| Store | State | Purpose |
|-------|-------|---------|
| `useAuthStore` | `user` (typed as `any`) | Auth user object, `checkAuth()`, `logout()` |
| `useDataStore` | `courses`, `allBookings`, `cards` | Role-aware data fetching (excludes admin) |
| `useUIStore` | `loading`, `promptMessage`, `selectedPage` | Global loading spinner, toast messages, active nav tab |
| `useNavigationStore` | `selectedCourseId`, `selectedEvent`, `prevPage` | Cross-page navigation state |

- **Global providers**: None (no React `<Provider>` needed — Zustand is module-level)
- **Data loading flow**: `GlobalWrapper` triggers `fetchUserData(user)` whenever `user` changes. Admin users skip data fetching.

---

## 5. API Layer

- **HTTP client**: Axios (`frontend/src/api/client.ts`)
  - Base URL from `import.meta.env.VITE_API_BASE_URL` (trailing slash stripped)
  - `withCredentials: true` — required for PHP session cookie
  - Default `Content-Type: application/json`
  - Response interceptor: extracts `error.response?.data?.message` or `error.message` and rejects with a plain `Error`
- **Endpoint constants**: `frontend/src/api/endpoints.ts` — single source of truth for all API paths, grouped by domain (`AUTH`, `COURSES`, `BOOKINGS`, `PROFILE`, `STUDENTS`, `ADMIN`, `COACH`)
- **Service modules** (in `frontend/src/api/services/`):
  - `authService.ts` — login, register (supports FormData for file upload), check, logout
  - `bookingService.ts` — getAll, create, createFrozen
  - `courseService.ts` — getAll, getDetail
  - `adminService.ts` — full admin operations (courses, students, transactions, bookings, users, invoices)
  - `coachService.ts` — overview, courseDetail
  - `profileService.ts` — update, changePassword, adminChangePassword
  - `studentService.ts` — getCards
- **Backend response format** (always):
  ```json
  { "success": true|false, "message": "...", "data": { ... } }
  ```
- **Backend env**: `APP_BASE_PATH` for sub-path deployment (e.g. `/be-api`)
- **CORS**: Configured via `CorsMiddleware` — allowed origins from `CORS_ALLOWED_ORIGINS` env var

---

## 6. UI / Component Patterns

- **Styling**: CSS Modules (`.module.css` co-located with component file) for most components; plain `.css` files for a few older components (e.g. `BottomNavBar.css`, `AdminHome.css`)
- **Path alias**: `@/` maps to `frontend/src/` (Vite config)
- **Component structure**: Functional components, hooks only (no class components)
- **Reusable components** (`frontend/src/components/`):

| Component | Purpose |
|-----------|---------|
| `PopupMessage` | Auto-dismissing toast notification (success/error/warning/info). Duration 3s default. Driven by `useUIStore.promptMessage`. |
| `CourseCard` | Course listing card with booking status, member price, coach name, location, image. |
| `BottomNavBar` | Role-based bottom navigation. Renders only nav items matching `user.role`. |
| `Loading` | Full-screen loading overlay. Shown when `useUIStore.loading === true`. |
| `ConfirmationPopUp` | Confirmation dialog with Yes/No. |
| `AccountSetting` | Reusable profile settings form. |

- **Admin sub-components** (`frontend/src/components/admin/`):

| Component | Purpose |
|-----------|---------|
| `ChargeMember` | Top-up member balance |
| `EditingUser` | Edit user info |
| `Purchase` | Purchase flow for admin |
| `WalkIn` | Register walk-in student for a course |
| `ChangePasswordAdmin` | Admin changing another user's password |

- **Layout**:
  - `GlobalWrapper`: Outermost layout — handles initial auth check, role-based redirect, loading overlay, global toast
  - `DefaultLayout`: Main app shell with `<Outlet>` + `<BottomNavBar>` footer

---

## 7. Key Features (ONLY from code)

- **Student**:
  - Browse today's courses on Home page
  - View upcoming booked courses (next 7 days) on Home page
  - Schedule view
  - Book / view course detail
  - View and manage account (profile, cards, balance)

- **Coach**:
  - Monthly schedule overview (courses assigned to coach)
  - Course detail view with student list
  - Account management

- **Admin**:
  - Dashboard stats: user count, member count, today's booking count, today's payment total
  - Course management: create, edit (saveCourse), delete, start, cancel, course types
  - Member management: list students, look up by phone, top-up balance, purchase packages, walk-in booking, book by phone, cancel booking
  - Transaction management: query by type, update payment status
  - User management: create, update, delete (student/coach/admin)
  - PDF invoice generation (TCPDF)
  - Admin change of other users' passwords

- **Cross-cutting**:
  - Bilingual UI (EN/ZH) via i18next — auto-detects language, caches to localStorage
  - Profile picture upload (multipart/form-data)
  - Session-based auth with PHP cookies (`withCredentials`)
  - Role-based routing and navigation (student/coach/admin each see different pages and nav items)

---

## 8. Environment / Config

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=https://bestudiobp.com/be-api/
```
- Also `frontend/.env.development` (assumed to have local dev values)
- All env vars accessed via `import.meta.env.VITE_*`

### Backend (`backend/.env.example`)
```
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE=Asia/Shanghai
APP_BASE_PATH=             # sub-path for deployment (e.g. /be-api)

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_TIMEZONE=+08:00

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://bestudiobp.com
CORS_ALLOW_CREDENTIALS=true

SESSION_LIFETIME=2592000   # 30 days in seconds
SESSION_COOKIE_LIFETIME=2592000

UPLOAD_DIR=public/uploads
UPLOAD_PUBLIC_PATH=uploads
```

### Dev startup
```bat
start-dev.bat
# Starts:
#   frontend → npm run dev (Vite, default http://localhost:5173)
#   backend  → php -S localhost:8000 -t ./public
```

---

## 9. Known Issues / Technical Debt

1. **`user: any` in `useAuthStore`** — the `user` object is typed as `any`, losing type safety across all components that consume it. Should use the `User` interface from `api/types/auth.ts`.

2. **Mixed-language logging** — `useDataStore` has `console.error("获取课程失败", ...)` (Chinese). Inconsistent with the rest of the codebase.

3. **Hardcoded Chinese strings in admin pages** — `AdminHome.tsx` uses `"欢迎回来，{user?.name}！"` and `"今天是 {today}"` without going through i18n. Admin pages are largely not internationalized.

4. **No route-level auth guards** — all access control relies on `GlobalWrapper` redirecting based on `user` state. If `GlobalWrapper` re-renders before `checkAuth` completes, pages might briefly flash. No `<PrivateRoute>` wrapper.

5. **Empty `contexts/` folder** — was previously used for React Context; fully replaced by Zustand but the folder remains. Can be cleaned up.

6. **`backend-legacy/` still present** — contains old raw PHP files. It is deprecated but still in the repository. Risk of confusion about which is the active backend.

7. **`CREATE_DB.sql` schema mismatch** — `docs/CREATE_DB.sql` contains a planned future schema (normalized, with `users`, `coach_profiles`, `studio_locations`, etc.) that does **not** match the current Eloquent models (`user_list`, `student_list` table names in `User.php`). The current live schema is different from the docs schema.

8. **`AdminController.saveCourse` dual-use** — `createCourse()` and `updateCourse()` both delegate to `saveCourse()` in the service, relying on the presence/absence of `id` in the payload to differentiate create vs update. This is implicit and fragile.

9. **Commented-out features** — `Events` page, `CoachSite` page, and `AdminSite` page are all commented out in `routes/index.tsx` and `BottomNavBar.tsx`. Their implementation status is Unknown.

10. **Language switcher hidden** — the language toggle button in `GlobalWrapper` has `display: none` inline style, making i18n manually accessible only via localStorage.

11. **`fetchUserData` in `useDataStore`** — the function has a redundant double-check: `if (user && user.role !== "admin")` is checked inside an outer `if (user?.role === "admin") return`. The inner `user.role !== "admin"` check for bookings is therefore always true when reached.

12. **PDF invoice served as redirect** — `getInvoiceUrl()` in `adminService.ts` constructs a direct URL string (not an API call) for PDF viewing. This relies on the browser opening it directly (no auth header — relies on session cookie).

13. **`AuthMiddleware` is defined but not applied to any routes** — `backend/app/Middleware/AuthMiddleware.php` checks `$_SESSION['user']` and role, but it is **not attached to any route or route group** in `api.php` or `bootstrap/app.php`. All API routes including `/api/admin/*` are unprotected at the HTTP middleware layer.

14. **Walk-in `student_id = 1` is a magic constant** — `AdminService::walkIn()` hardcodes `$studentId = 1` with no comment. This is assumed to be a placeholder for anonymous cash-paying walk-in attendees.

15. **`deleteCourse` bypasses booking safety check** — `DELETE /api/admin/courses/{id}` calls `AdminService::deleteCourse()` which soft-deletes without checking for active bookings. Unlike `cancelCourse`, which calls `removeCourse()` and blocks if active bookings exist, `deleteCourse` does no such check.

---

## 10. Conventions

### Naming
- **Components/Pages**: `PascalCase.tsx` + co-located `PascalCase.module.css`
- **Stores**: `useXxxStore.ts` (e.g. `useAuthStore.ts`)
- **Services (frontend)**: `xxxService.ts` (e.g. `adminService.ts`)
- **Types (frontend)**: `frontend/src/api/types/xxx.ts` — one file per domain
- **Backend Controllers**: `XxxController.php` (thin, delegates to service)
- **Backend Services**: `XxxService.php` (all business logic)
- **Backend Models**: `Xxx.php` (Eloquent, singular — e.g. `User.php`, `Student.php`)

### File Organization
- All API endpoints in one centralized `endpoints.ts` — no magic strings in service files
- Zustand stores are independent modules (not nested providers)
- Layouts are in `layouts/` — `GlobalWrapper` wraps everything, `DefaultLayout` adds nav bar
- Admin-specific UI components live in `components/admin/`

### Backend Patterns
- All controllers extend `Controller` base class → use `$this->respond($response, $result)`
- All services return plain associative arrays: `['success' => bool, 'message' => string, 'data' => ..., 'status' => int]`
- `ResponseHelper` handles actual JSON serialization
- `array_trim()` helper is applied to all request bodies (strips whitespace — defined in `app/Support/helpers.php`)
- DI container is PHP-DI — constructor injection used for all Controllers and Services

### Styling
- CSS Modules preferred for components
- Some older pages use plain `.css` files (no scoping)
- No Tailwind or CSS-in-JS — plain CSS only

---

## 11. Unknown / Needs Clarification

- **`backend-legacy/` status**: Whether `backend-legacy/` is fully retired or still used in production is unclear. `connect.php` and `connect-dev.php` files suggest it may still be active for some endpoints.
- **Current live database schema**: The actual table structure in production is not fully documented. `CREATE_DB.sql` is a future-state schema. The Eloquent models reference `user_list`, `student_list`, etc. See section 13 for confirmed table names.
- **`frontend/.env.development`**: File exists but contents were not read — likely overrides `VITE_API_BASE_URL` for local development.
- **Events feature**: `Events.tsx`, `EventDetail.tsx`, and `mocks/event.ts` exist. Routes and nav links are commented out. It is unclear if this feature is planned, in-progress, or abandoned.
- **`CoachSite` and `AdminSite`**: Pages exist in `pages/` but are commented out of routing. Status unknown.
- **Session storage mechanism**: PHP default file-based session storage is used (no custom handler). Behavior on the production server is unknown.
- **`UserCard` model / student cards**: ✅ Clarified — `user_cards` table, `card_type_id = 1` is the only type used in business logic. Fields include `balance`, `frozen_balance`, `expired_balance`, `valid_balance_to`, `valid_from`, `valid_to`. Students can only have one active card used for balance operations.
- **`frozen_balance` field**: ✅ Clarified — funds reserved for pending (not-yet-started) bookings. `usable = balance - frozen_balance`. Released when course starts (both `frozen_balance` and `balance` decremented). Released on cancellation (`frozen_balance` only decremented — see section 14 for edge case).
- **`Transaction` model / payment types**: ✅ Clarified — three known types: `'payment'` (course booking), `'Top Up Package'` (admin top-up), `'purchase'` (admin manual deduction). Frontend filter maps: `'income'` → `'Top Up Package'`, `'expense'` → `'payment'`, else → `'purchase'`.

---

## 12. Admin Pagination (Added)

Server-side pagination was added to all large admin list endpoints. Data is no longer loaded all at once; the backend paginates and returns a standardized response shape.

### Paginated response shape

All affected admin list endpoints now return:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 100,
      "total_pages": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Backend endpoints changed

| Endpoint | Method | New query params |
|----------|--------|------------------|
| `GET /api/admin/courses` | GET | `page`, `per_page`, `search` (name + coach name), `date` (YYYY-MM-DD) |
| `GET /api/admin/students` | GET | `page`, `per_page`, `search`, `search_by` (name/phone/both) |
| `GET /api/admin/transactions` | GET | `page`, `per_page`, `search` (student name/phone), `type`, `from_date`, `to_date` |

- `page` defaults to 1; `per_page` defaults to 10; clamped to max 100.
- `AdminService.php` has two private helpers: `parsePaginationParams(array $params)` and `buildPagination(int $total, int $page, int $perPage)`.
- The POST endpoint `POST /api/admin/transactions/query` is no longer used by the frontend for listing. The GET endpoint is used instead.

### Frontend changes

**New shared types** (`frontend/src/api/types/admin.ts`):
- `PaginationMeta` — pagination metadata shape
- `PaginatedResponse<T>` — typed wrapper `{ items: T[]; pagination: PaginationMeta }`
- `AdminListParams` — common query params for list methods

**New component** (`frontend/src/components/Pagination/Pagination.tsx`):
- Reusable presentation-only component
- Props: `pagination`, `onPageChange`, `onPerPageChange`, `disabled?`
- Per-page options: 10, 20, 50, 100
- Styled with `Pagination.module.css`

**Frontend pages refactored**:
- `AdminMember.tsx` — students list is paginated + server-side search (300ms debounce); coach list remains client-side (small dataset)
- `AdminTransaction.tsx` — paginated + server-side search; replaced `window.location.reload()` with targeted `fetchTransactions()`
- `AdminCourse.tsx` — paginated + server-side search/date filter; removed broken `filterType` dropdown

### Known limitations / TODOs

- Coach list in `AdminMember` is not paginated (coaches are few in practice)
- `AdminAccount.tsx` has no table — no pagination needed
- The `POST /api/admin/transactions/query` endpoint still exists in routes but is unused by the frontend

---

## 13. Backend Business Logic Details

### DB Table Names (Confirmed from Models and Queries)

| Eloquent Model | PHP Class | Actual Table |
|---|---|---|
| `User` | `App\Models\User` | `user_list` |
| `Student` | `App\Models\Student` | `student_list` |
| `Coach` | `App\Models\Coach` | `coach_list` |
| `Admin` | `App\Models\Admin` | `admin_list` |
| `CourseSession` | `App\Models\CourseSession` | `course_session` |
| `CourseBooking` | `App\Models\CourseBooking` | `course_booking` |
| `Transaction` | `App\Models\Transaction` | `transaction_list` |
| `UserCard` | `App\Models\UserCard` | `user_cards` |
| — (raw query only) | — | `card_types` |
| — (raw query only) | — | `course_type` |

All Eloquent models have `public $timestamps = false` — no automatic `created_at`/`updated_at`.

---

### State / Status Enum Values

**`course_session.state`**:
- `0` — upcoming / not started (default)
- `1` — started / completed
- `-1` — soft-deleted (cancelled or deleted)

**`user_list.state`**:
- `0` or any value `!= -1` — active
- `-1` — soft-deleted (cannot log in, excluded from lookups)

**`course_booking.status`**:
- `null` / not set — booked, pending payment
- `'paid'` — payment completed (set when course starts or when booked after course started)
- `'cancelled'` — cancelled
- `'absent'` — absent (excluded from student counts but not deleted)

**`user_cards.card_type_id`**:
- `1` — the only card type referenced in business logic (member balance card)

**`user_cards.status`**:
- `1` — active (used in `purchase` to find card)

---

### Complete Route Reference

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register              multipart/form-data — profile_pic optional
GET    /api/auth/check

GET    /api/courses                    ?  (last 30 days to +7 days)
GET    /api/courses/{id}               ?student_id= (adds is_booked to response)

GET    /api/bookings                   all bookings -30d to +7d
POST   /api/bookings                   student self-booking
POST   /api/bookings/frozen            booking with explicit frozen_price

POST   /api/profile                    multipart/form-data — update name/birthday/profile_pic
PUT    /api/profile/password           self password change (old + new)
PUT    /api/profile/password/admin     admin override password change (no old needed)

GET    /api/students/{id}/cards

GET    /api/admin/home
GET    /api/admin/courses              ?page, per_page, search, date (YYYY-MM-DD)
POST   /api/admin/courses              create course (saveCourse, no id in body)
POST   /api/admin/courses/save         create OR update OR delete (id + delete='true' in body)
PUT    /api/admin/courses/{id}         update course (saveCourse, id from URL)
DELETE /api/admin/courses/{id}         soft delete — NO booking check
POST   /api/admin/courses/{id}/start   start course + process all bookings
POST   /api/admin/courses/{id}/cancel  cancel course — blocks if active bookings
GET    /api/admin/course-types

GET    /api/admin/coaches
GET    /api/admin/coaches/{id}/courses ?year, month

GET    /api/admin/students             ?page, per_page, search, search_by (name/phone/both)
POST   /api/admin/students/lookup      {phone} → {name}

GET    /api/admin/transactions         ?page, per_page, search, type (income/expense/purchase)
POST   /api/admin/transactions/query   alias of GET handler (legacy, unused by frontend)
PUT    /api/admin/transactions/{id}/payment  update payment field only

POST   /api/admin/topup
POST   /api/admin/purchase

POST   /api/admin/bookings/by-phone
POST   /api/admin/bookings/walk-in
POST   /api/admin/bookings/{id}/cancel

POST   /api/admin/users/save           upsert — id in body (empty → create)
POST   /api/admin/users                create
PUT    /api/admin/users/{id}           update
DELETE /api/admin/users/{id}           ?role=student|coach|admin — soft delete

GET    /api/admin/invoices/{id}        returns PDF (Content-Type: application/pdf), not JSON

GET    /api/coach/{id}/overview
GET    /api/coach/courses/{id}
```

---

### Auth / Session Behavior

**File**: `backend/app/Services/AuthService.php`, `backend/app/Middleware/AuthMiddleware.php`

- `SessionMiddleware` starts/resumes session on every request (no dedicated session check for route groups)
- Session lifetime: `SESSION_LIFETIME` env var (default 2,592,000 = 30 days)
- `login()`: fetches `User` where `phone` matches and `state != -1`; verifies bcrypt password; stores `user_id`, `role`, `login_time` in `$_SESSION['user']`
- **No membership, card, or `valid_to` check at login**
- `check()`: reads `$_SESSION['user']`, reloads profile from DB; returns role-specific profile merged with `role`
- `logout()`: clears session array, calls `session_destroy()`, expires cookie
- `register()`: only allowed role is `'student'`; creates `user_list` + `student_list` in a DB transaction
- **`AuthMiddleware` exists but is NOT applied to any route** — see Section 14

---

### Booking Logic (`backend/app/Services/BookingService.php`)

**`create()` — self-booking `POST /api/bookings`**:
1. Validates `student_id > 0`, `course_id > 0`, `head_count > 0`
2. Loads `CourseSession` — fails 404 if not found
3. Loads `UserCard` where `student_id` + `card_type_id = 1` — fails 404 if not found
4. **Checks `valid_balance_to >= today`** — fails 400 if card balance expired
5. Computes `usable = balance - frozen_balance`; fails 400 if insufficient
6. Checks for existing non-cancelled booking for same student+course:
   - **Existing + course started (`state = 1`)**: deduct `balance`, increment booking `head_count` + set status `'paid'`, create Transaction (type `'payment'`)
   - **Existing + course pending (`state = 0`)**: increment `frozen_balance` only, increment `head_count`
7. If no existing booking:
   - **Course started**: deduct `balance`, create booking (status=`'paid'`), create Transaction
   - **Course pending**: increment `frozen_balance`, create booking (no status set)

**`createWithFrozenPrice()` — frozen booking `POST /api/bookings/frozen`**:
- Requires `student_id`, `course_id`, `frozen_price` (explicit freeze amount)
- Blocks duplicate bookings (returns 409)
- Same `valid_balance_to` check
- If course started: uses `price_m` (ignores provided `frozen_price`), deducts `balance`, creates Transaction
- If pending: uses provided `frozen_price` to increment `frozen_balance`

---

### Balance / Frozen Balance Logic

| Field | Meaning |
|---|---|
| `balance` | Total funds on card |
| `frozen_balance` | Funds reserved for pending (not-yet-started) bookings |
| `usable` | `balance - frozen_balance` — what can actually be spent |
| `valid_balance_to` | Expiry date for balance usage (checked only in booking, NOT in purchase) |
| `valid_to` | Card validity end date — set to +1 year on creation; **never checked in code** |
| `expired_balance` | Set on card; **never modified by any service** — purpose unknown |

**Balance flow**:
- Booking pending course: `frozen_balance += price_m × head_count` (balance unchanged)
- Course starts: `frozen_balance -= price_m × head_count` AND `balance -= price_m × head_count`
- Cancel booking (any state): `frozen_balance -= price_m × head_count` (no balance refund even if already paid)

---

### Transaction Creation

**Table**: `transaction_list`  
**Model**: `App\Models\Transaction`

| `type` | Trigger | Key fields set |
|---|---|---|
| `'payment'` | Booking paid / course started / walk-in | `amount`, `point` (per-head price), `head_count`, `course_id` |
| `'Top Up Package'` | Admin top-up | `amount`, `payment` (cash collected) |
| `'purchase'` | Admin manual deduction | `amount`, `payment`, `description` |

`updateTransactionPayment` updates only the `payment` field (cash actually collected), not `amount`.

Frontend `type` filter mapping in `listTransactions`: `'income'` → `'Top Up Package'`, `'expense'` → `'payment'`, otherwise → `'purchase'`.

---

### Course Start Logic (`AdminService::startCourse`)

1. Acquires row-level lock on course (`state = 0`) — fails if not found
2. Acquires row-level lock on all non-cancelled bookings for the course
3. For each booking:
   - **If `student_id != 1` (member)**: `frozen_balance -= price_m × head_count`, `balance -= price_m × head_count`, `point += price_m` on student, Transaction (type `'payment'`), booking status → `'paid'`
   - **If `student_id == 1` (walk-in)**: no balance deduction; uses `price` (normal price, not `price_m`); Transaction created, booking status → `'paid'`
4. Course `state` → `1`

---

### Course Cancel / Delete Logic

| Action | Endpoint | Service Method | Booking Check? | State Change |
|---|---|---|---|---|
| Cancel course | `POST /api/admin/courses/{id}/cancel` | `removeCourse()` | ✅ Blocks if non-cancelled bookings exist | `0` → `-1` |
| Delete course (HTTP DELETE) | `DELETE /api/admin/courses/{id}` | `deleteCourse()` | ❌ No check | any → `-1` |
| Delete via saveCourse | `POST /api/admin/courses/save` (delete=true) | `saveCourse()` | ❌ No check | any → `-1` |

---

### Admin Member Management

**Top-up (`POST /api/admin/topup`)** — `AdminService::topup()`:
- Required body: `id` (student_id), `amount`, `valid_balance_to`, `package`, `payment`
- Activates membership (`is_member = 1`) if `package = 1` and student is not yet a member
- Creates card (with `valid_from = today`, `valid_to = today + 1 year`) if none exists
- Otherwise: increments `balance` and updates `valid_balance_to` on existing card
- Creates Transaction (type `'Top Up Package'`)

**Purchase (`POST /api/admin/purchase`)** — `AdminService::purchase()`:
- Looks up student by `phone`, then active card (`status = 1`)
- Checks `usable = balance - frozen_balance` — **does NOT check `valid_balance_to`**
- Deducts `payment` from `balance` directly (no `frozen_balance` adjustment)
- Creates Transaction (type `'purchase'`)

**Book by Phone (`POST /api/admin/bookings/by-phone`)**:
- Resolves `phone` → `user_list` → `student_list` → calls `BookingService::create()`

**Walk-in (`POST /api/admin/bookings/walk-in`)**:
- Uses hardcoded `student_id = 1` (anonymous walk-in placeholder)
- Uses `price` (non-member price), no balance check
- Bypasses all card/balance validation

**Cancel Booking (`POST /api/admin/bookings/{id}/cancel`)** — `AdminService::cancelBooking()`:
- Marks booking as `'cancelled'`
- If `student_id != 1`: `frozen_balance -= price_m × head_count`
- **Does not check course state** — see Section 14 for edge case

---

### Admin User Management

**Default password for new users**: last 4 digits of phone + birth year (e.g. phone `0123456789`, birthday `1990-01-01` → seed `67891990` → bcrypt). Must be changed by user.

**`saveUser` / `createUser` / `updateUser`** — all call `upsertUser()`:
- If `id == -1`: creates new `user_list` row + `{role}_list` row (role determines table name via `$role . '_list'`)
- If `id != -1`: updates existing rows; checks for phone collision

**`deleteUser`** (`DELETE /api/admin/users/{id}?role=...`):
- For role `'student'`: checks for pending bookings (status `'booked'`) — blocks with 409 if found
- For other roles: no pre-check
- Soft-deletes by setting `user_list.state = -1`

---

### Profile Update & Avatar Upload

**`POST /api/profile`** (multipart/form-data):
- `user_id`: from request body or falls back to `$_SESSION['user']['user_id']`
- `role`: from request body or `$_SESSION['user']['role']`
- Validates `name` and `birthday` not empty
- Updates `coach_list` for `role = 'coach'`, `student_list` for all other roles
- Optional file upload: `profile_pic` field → `UploadHelper::store()` → stored as `public/uploads/{timestamp}_{sanitized_name}`

**`UploadHelper::store()`** (`backend/app/Support/UploadHelper.php`):
- Sanitizes filename to `[A-Za-z0-9_.-]` only
- Prefixes with `time()` to avoid collisions
- Upload directory from `UPLOAD_DIR` env var (default: `backend/public/uploads/`)
- Returns relative public path: `uploads/{filename}`

---

### Error Response Format

**Success:**
```json
{ "success": true, "message": "...", "data": { ... } }
```
HTTP 200 (default) or custom code from service `'status'` field.

**Failure:**
```json
{ "success": false, "message": "...", "errors": [ ... ] }
```
`errors` field only present if service returns it (most don't).

**Common HTTP status codes used:**
| Code | Meaning in this app |
|---|---|
| 200 | Success |
| 400 | Bad request / business rule violation |
| 401 | Not logged in (`AuthMiddleware` or `AuthService::check`) |
| 403 | Wrong role (`AuthMiddleware`) |
| 404 | Resource not found |
| 409 | Conflict (duplicate phone, active bookings, etc.) |
| 422 | Missing / invalid input |
| 500 | Server error (upload failure, etc.) |

---

### Middleware Stack (bootstrap order)

Outermost to innermost (Slim processes in reverse registration order):

1. **`CorsMiddleware`** — outermost; adds CORS headers to all responses including errors
2. **`SessionMiddleware`** — starts PHP session if not active
3. **`BodyParsingMiddleware`** (Slim built-in) — parses JSON and form-encoded bodies
4. Routes / Controllers

`AuthMiddleware` is defined but **not registered in the middleware stack** and **not applied to any route group**.

---

## 14. Backend Gaps / Needs Verification

1. **`valid_to` (card validity end) is never enforced**
   - `user_cards.valid_to` is set to `today + 1 year` when a new card is created by `topup()`.
   - It is **never read or checked** in `AuthService`, `BookingService`, `AdminService`, or any other service.
   - Only `valid_balance_to` is checked — and only in `BookingService::create()` and `createWithFrozenPrice()`.
   - Whether `valid_to` represents membership expiry or card expiry, and whether it should gate any operation, is **unknown and unenforced**.

2. **Login does not check card/membership expiry**
   - `AuthService::login()` only checks `state != -1`. No `is_member`, `valid_to`, `valid_balance_to`, or balance check at login.

3. **`AdminService::purchase()` does not check `valid_balance_to`**
   - An admin can deduct from a card whose balance has expired (`valid_balance_to < today`). The expiry check exists in `BookingService` but is absent from `purchase()`.

4. **`AuthMiddleware` is defined but not applied anywhere**
   - `backend/app/Middleware/AuthMiddleware.php` checks `$_SESSION['user']` and optionally a required role.
   - It is **not added** to any route or route group in `api.php`, and not registered in `bootstrap/app.php`.
   - All routes — including `/api/admin/*` — are unprotected at the HTTP middleware layer.
   - The only session-aware code path is `AuthService::check()` (called only by `GET /api/auth/check`). All other endpoints proceed regardless of session state.

5. **Cancel booking does not account for already-paid bookings**
   - `AdminService::cancelBooking()` always runs `frozen_balance -= price_m × head_count`.
   - If a booking was already `'paid'` (course had started and `startCourse` already reduced both `frozen_balance` and `balance`), cancelling it will reduce `frozen_balance` a second time, potentially making it negative.
   - No refund to `balance` occurs in any cancellation path. A paid booking, once charged, cannot be refunded through the current API.

6. **`deleteCourse` bypasses booking safety check**
   - `DELETE /api/admin/courses/{id}` → `AdminService::deleteCourse()` soft-deletes without checking for existing non-cancelled bookings.
   - `cancelCourse` (`POST .../cancel`) → `AdminService::removeCourse()` correctly blocks if active bookings exist.
   - These two delete paths have inconsistent safety guarantees.

7. **`expired_balance` field exists but is never written or used**
   - `user_cards.expired_balance` is selected in `AdminService::listStudents()` for display purposes.
   - No service method ever sets or modifies it. Its business meaning and whether it should trigger any logic is **unknown**.

8. **Walk-in `student_id = 1` is a hardcoded magic constant**
   - `AdminService::walkIn()` always uses `$studentId = 1`.
   - No comment, config entry, or named constant explains this.
   - If a real student is ever assigned ID 1, walk-in bookings and transactions will be attributed to that student.

9. **`from_date` / `to_date` transaction filter params are accepted but ignored**
   - `AdminController::transactions()` merges query params and body, and `listTransactions()` signature accepts them.
   - However, `AdminService::listTransactions()` does not apply any date-range filter — `from_date` and `to_date` are silently ignored.

10. **No centralized validation layer**
    - All input validation is inline in each service method (checking empty strings, numeric ranges, etc.).
    - There is no shared validation schema, rule set, or DTO layer. Validation logic may be inconsistent across services.

11. **`saveCourse` multi-purpose endpoint with undiscoverable behavior**
    - `POST /api/admin/courses/save` creates, updates, or soft-deletes depending on `id` and `delete` values in the request body.
    - This is not self-describing and requires reading the source to understand.

12. **Booking list (`GET /api/bookings`) is not scoped to the requesting user**
    - `BookingService::listRecent()` returns all bookings from all students in the last 30 days to +7 days.
    - There is no `student_id` filter applied — any authenticated (or even unauthenticated, given gap #4) caller gets all bookings.

