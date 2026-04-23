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
- **Current live database schema**: The actual table structure in production is not fully documented. `CREATE_DB.sql` is a future-state schema. The Eloquent models reference `user_list`, `student_list`, etc. but the full schema has not been verified in this codebase.
- **`frontend/.env.development`**: File exists but contents were not read — likely overrides `VITE_API_BASE_URL` for local development.
- **Events feature**: `Events.tsx`, `EventDetail.tsx`, and `mocks/event.ts` exist. Routes and nav links are commented out. It is unclear if this feature is planned, in-progress, or abandoned.
- **`CoachSite` and `AdminSite`**: Pages exist in `pages/` but are commented out of routing. Status unknown.
- **Session storage mechanism**: Whether sessions are stored in files, DB, or memory on the production server is unknown.
- **`UserCard` model / student cards**: `UserCard.php` model exists and `studentService.getCards()` is implemented, but the exact card system (membership cards, class packs, etc.) business logic has not been fully read.
- **`frozen_balance` field on `User`**: The `User` type has `frozen_balance` but its specific business meaning (reserved balance for frozen members?) is inferred, not confirmed.
- **`Transaction` model / payment types**: The transaction system references `type: 'payment'` in `AdminService.php` but the full list of transaction types is unknown without reading `Transaction.php` fully.
