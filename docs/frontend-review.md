# Frontend Review — Be Studio Web App

> Prepared as a pre-refactor reference. Covers architecture, pages, components, state, API usage, styling, risks, and recommendations.

---

## 1. Project Structure

### Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | ~5.7 | Type safety |
| Vite | 6 | Build tool |
| React Router DOM | 7 | Routing |
| Axios | 1.9 | HTTP client |
| Zustand | 5 | State (installed, **not used**) |
| i18next | 25 | Internationalisation (EN/ZH) |
| clsx | 2 | Conditional classnames |
| dayjs + date-fns | — | Date utilities (both present, redundant) |
| react-datepicker | 8 | Date picker UI |
| react-phone-number-input | 3 | Phone field with validation |
| react-icons | 5 | Icon library |

### Main Folders

```
src/
├── main.tsx              # Entry point — mounts App into DOM
├── App.tsx               # Root: wraps providers + RouterProvider
├── index.css             # Global styles + CSS custom properties
├── i18n.ts               # i18next setup (EN/ZH namespaces)
├── assets/               # Static files: course images, rules text
├── components/           # Shared UI components
│   └── admin/            # Admin-only modal components
├── contexts/             # React Context: AppContext, UserContext
├── layouts/              # DefaultLayout (with nav), GlobalWrapper (auth guard)
├── locales/              # i18n JSON files (en/, zh/)
│   ├── en/               # login, home, schedule, account, nav, detail, courseCard
│   └── zh/
├── mocks/                # Mock data (event.ts only)
├── pages/                # Page components
│   ├── admin/            # Admin-only pages
│   ├── auth/             # Login, Register, ForgetPassword
│   └── coach/            # Coach-only pages
├── routes/               # index.tsx — single router definition
└── ultis/                # Utility functions (note: typo, should be "utils")
    └── timeCheck.ts      # Date/time helpers (Malaysia timezone)
```

### Entry Points

- **HTML:** `index.html` → loads `main.tsx`
- **App root:** `main.tsx` → renders `<App />` inside `StrictMode`, imports `i18n.ts`
- **Router:** `App.tsx` → wraps `AppProvider` → `UserProvider` → `RouterProvider`

### Routing Structure

Defined in `src/routes/index.tsx` using `createBrowserRouter`.

```
GlobalWrapper                    ← auth guard, loading overlay, popup
├── /construction                ← placeholder page (buggy)
├── /coursedetail                ← student: book a course
├── /coach_coursedetail          ← coach/admin: view course bookings & actions
├── /eventdetail                 ← event detail (broken, navigates to /event which is commented out)
├── /login
├── /register
├── /forget_password
└── DefaultLayout                ← adds BottomNavBar
    ├── / and /home              ← student home
    ├── /schedule                ← student 7-day schedule
    ├── /account                 ← student account
    ├── /coach_schedule          ← coach upcoming classes
    ├── /coach_account           ← coach profile & class history
    ├── /admin_home              ← admin dashboard stats
    ├── /admin_member            ← admin user/coach management
    ├── /admin_transaction       ← admin transaction log
    ├── /admin_course            ← admin course scheduling
    └── /admin_account           ← admin profile
```

**Commented-out routes (dead code):**
- `/event` — Events list page
- `/coach_site` — Coach venue booking
- `/admin_site` — Admin venue approval

### Layout Structure

| Layout | Purpose |
|---|---|
| `GlobalWrapper` | Wraps all routes. Handles auth check redirect by role, shows `Loading` spinner and `PopupMessage` overlay |
| `DefaultLayout` | Wraps main app pages (student/coach/admin). Renders `<Outlet />` and `<BottomNavBar />` |

---

## 2. Pages and Features

### Student Pages

| Page | Path | Description |
|---|---|---|
| `Home` | `/home` | Studio info card (logo, address, social links), static timetable image, user's upcoming bookings (7-day), today's recommended courses |
| `Schedule` | `/schedule` | 7-day date strip, courses filtered by selected day |
| `Account` | `/account` | User profile header, membership card(s), weekly exercise minutes, booking history filtered by status (booked/paid/cancelled/completed), rules modal, settings modal |
| `CourseDetail` | `/coursedetail` | Course banner, instructor info, booking count selector, booking confirmation popup; handles balance check and member check |

### Coach Pages

| Page | Path | Description |
|---|---|---|
| `CoachSchedule` | `/coach_schedule` | Lists coach's own courses for the next 7 days |
| `CoachAccount` | `/coach_account` | Profile, this-month class count + student count, all assigned courses filtered by state |
| `CoachCourseDetail` | `/coach_coursedetail` | Course info + booked students list; coach can cancel bookings; admin can start or cancel the course. Shared between coach and admin roles |

### Admin Pages

| Page | Path | Description |
|---|---|---|
| `AdminHome` | `/admin_home` | KPI cards: user count, member count, today's bookings, today's revenue |
| `AdminMember` | `/admin_member` | Toggle between Students/Coaches table; search/filter; add/edit users; charge membership; view coach monthly courses |
| `AdminCourse` | `/admin_course` | Two tabs: dynamic courses (upcoming, with CRUD) and static recurring schedule; walk-in booking; filter by date/coach |
| `AdminTransaction` | `/admin_transaction` | Three tabs: income, expense (course purchases), and general purchases; edit payment amount; generate invoice |
| `AdminAccount` | `/admin_account` | Admin name, phone, permission level, logout |

### Auth Pages

| Page | Path | Description |
|---|---|---|
| `Login` | `/login` | Phone + password form; MY phone validation |
| `Register` | `/register` | Name, phone, birthday, password, optional avatar upload |
| `ForgetPassword` | `/forget_password` | Single button: opens WhatsApp to contact admin for password reset (no self-service flow) |

### Inactive / Broken Pages

| Page | Status | Notes |
|---|---|---|
| `Events` | Commented out | Uses `mockEvents` only; no API integration; route removed |
| `EventDetail` | Registered in router but broken | Navigates back to `/event` which does not exist; contains hardcoded Chinese placeholder text |
| `Construction` | Registered but crashes | Reads `userRole` from `useAppContext()` — this property does not exist; should be `user?.role` |
| `CoachSite` | Commented out | All mock data; no API; unfinished UI |
| `AdminSite` | Commented out | All mock data; no API |
| `ChangePasswordAdmin` | Dead code | Exists in `components/admin/` but is not imported or used anywhere; title says "账号注册" (registration) instead of change password |

---

## 3. Components

### Shared UI Components (`src/components/`)

| Component | Description |
|---|---|
| `CourseCard` | Card showing course info (image, time, coach, location, price, count) with a book/view button. Used in 5+ pages. Only shared component with a proper TypeScript interface |
| `BottomNavBar` | Role-aware navigation bar. Shows different tabs for student/coach/admin. Reads `user.role` and `selectedPage` from `AppContext` |
| `Loading` | Full-screen spinner overlay. Shown globally via `GlobalWrapper` |
| `PopupMessage` | Overlay message popup. **Has a bug**: `onClick={setPromptMessage("")}` executes immediately instead of on click (missing arrow function wrapper) |
| `AccountSetting` | Slide-up overlay for editing profile (name, birthday, avatar) and changing password. Shared between `Account` and `CoachAccount` |

### Admin-Only Components (`src/components/admin/`)

| Component | Description |
|---|---|
| `EditingUser` | Modal to add/edit/delete a student or coach. Also handles password change for users. Styles reused by several other admin modals |
| `ChargeMember` | Modal to top-up a student's balance and activate/extend membership |
| `Purchase` | Modal to record a general item purchase deducted from a student's balance |
| `WalkIn` | Modal to add a walk-in booking (Guest or registered Member) for a given course |
| `ChangePasswordAdmin` | **Dead component** — not wired up, logic is incomplete |

### Reusable Sections / Patterns

- **Rule modal**: Both `Account` and `CoachAccount` implement the same full-screen rule overlay separately (same CSS class names, same open/close state). Should be extracted.
- **"Not logged in" block**: Both `Account` and `CoachAccount` duplicate the same JSX and styles for the unauthenticated state.
- **Footer text**: Identical legal footer (copyright + privacy/T&C links) duplicated in `Account` and `CoachAccount`.
- **Popup overlay structure**: Admin modals all share `EditingUser.module.css` classes (`popup-overlay`, `popup-card`, `popup-actions`) but are separate components — the popup shell itself is never extracted.
- **Booking count computation**: The `allBookings.filter(...).reduce(...)` pattern for computing a course's total head count is copy-pasted across `Home`, `Schedule`, `CoachSchedule`, and `CoachAccount`.

---

## 4. State and Data Flow

### Global State — `AppContext`

Stored in `src/contexts/AppContext.tsx`. Provides:

| State | Type | Purpose |
|---|---|---|
| `user` | `any` | Logged-in user profile (from session). Null when unauthenticated |
| `loading` | `boolean` | Global spinner flag |
| `selectedPage` | `string` | Active nav item identifier (mirrors URL but tracked separately) |
| `prevPage` | `string` | Previous route string for back navigation |
| `selectedCourseId` | `number \| null` | Passed between list and detail pages via context instead of URL params |
| `selectedEvent` | `any` | Same pattern as above for event detail |
| `promptMessage` | `string` | Global popup message text |
| `refreshKey` | `number` | Increment triggers re-fetch in `AppContext.useEffect` |

On mount, `AppContext` calls `auth-check.php` to restore session. `GlobalWrapper` redirects the user to their role-appropriate home page based on `user.role`.

### User Data — `UserContext`

Stored in `src/contexts/userContext.tsx`. Fetches on `user` change:

| State | Fetched when | Purpose |
|---|---|---|
| `courses` | Always (unless admin) | Full course list |
| `allBookings` | Non-admin roles | All bookings (for computing status/count on client) |
| `cards` | `student` role only | Student membership card(s) |

### Local State

Every page uses `useState` heavily for UI state: filters, modals, form inputs, derived data arrays. No page-level state is shared via URL or lifted to a shared store.

### Props Drilling

- Minimal — most data comes from context hooks directly.
- Admin modals receive `setRefresh`, `setEditingUser`, etc. as props from parent pages.

### Data Flow Summary

```
auth-check.php ──► AppContext.user
                        │
                        ▼
               UserContext fetches courses/bookings/cards
                        │
                        ▼
         Pages filter/map data locally in useEffect
                        │
                        ▼
              CourseCard rendered with enriched objects
```

Pages pass `course_id` to `AppContext.selectedCourseId`, then navigate imperatively. The detail page reads the ID from context. **Refreshing the detail page loses the course ID.**

---

## 5. API / Mock / Service Layer

### Configuration

- Base URL from env var: `VITE_API_BASE_URL` (e.g., `http://localhost/be-api/`)
- All requests use `axios` directly inside components — no service abstraction layer.
- Session auth via cookies (`withCredentials: true` on login/auth-check/edit calls).

### API Endpoints

| Endpoint | Method | Used by |
|---|---|---|
| `auth-check.php` | GET | AppContext (session restore) |
| `auth-login.php` | POST | Login |
| `auth-logout.php` | GET | AppContext.logout |
| `auth-register.php` | POST | Register |
| `edit-profile.php` | POST (multipart) | AccountSetting, EditingUser |
| `get-all-course.php` | GET | UserContext |
| `get-all-booking.php` | GET | UserContext |
| `get-student-card.php` | POST | UserContext |
| `get-course-detail.php` | POST | CourseDetail |
| `book2.php` | POST | CourseDetail (student booking) |
| `coach/coach-course-detail.php` | POST | CoachCourseDetail |
| `coach/coach-get-course.php` | POST | CoachAccount |
| `admin/home-data.php` | GET | AdminHome |
| `admin/get-student.php` | GET | AdminMember |
| `admin/get-coach.php` | GET | AdminMember, AdminCourse |
| `admin/edit-user.php` | POST | EditingUser |
| `admin/delete-user.php` | POST | EditingUser |
| `admin/topup.php` | POST | ChargeMember |
| `admin/get-transaction.php` | POST | AdminTransaction |
| `admin/edit-transaction.php` | POST | AdminTransaction |
| `admin/generate-invoice.php` | GET (window.open) | AdminTransaction |
| `admin/get-coach-courses.php` | GET | AdminMember (coach detail popup) |
| `admin/static-course.php` | POST | AdminCourse |
| `admin/start-course.php` | POST | CoachCourseDetail |
| `admin/cancel-booking.php` | POST | CoachCourseDetail |
| `admin/remove-course.php` | POST | CoachCourseDetail |
| `admin/walk-in.php` | POST | WalkIn |
| `admin/book2.php` | POST | WalkIn (member walk-in) |
| `admin/purchase-item.php` | POST | Purchase |
| `admin/get-student-name.php` | POST | Purchase, WalkIn |

### Mock Data

- `src/mocks/event.ts` — `mockEvents` array used only by the commented-out `Events` page. Placeholder lorem ipsum content.

### Utility

- `src/ultis/timeCheck.ts` — Malaysia timezone date helpers:
  - `isTodayMY`, `isSevenDaysMY`, `isThisWeekMY`, `isThisMonthMY` — filter course dates
  - `toLocalYMD` — convert a `Date` to `YYYY-MM-DD` string

### Data Transformation

All transformation (enriching courses with `booking_count` and `booking_status`) is done in `useEffect` hooks inside each page. The same enrichment logic is repeated in `Home`, `Schedule`, `CoachSchedule`, and `CoachAccount`.

---

## 6. Styling System

### How Styles Are Written

| Method | Usage |
|---|---|
| **CSS Modules** (`.module.css`) | Most components and pages use this — scoped, collision-free |
| **Global CSS** (`.css`) | `AdminHome`, `BottomNavBar`, `Events`, `EventDetail`, `CoachSite`, `AdminSite` — unscoped |
| **CSS Custom Properties** | Defined once in `index.css` under `#root`. Used sporadically via `var(--primary-color)` etc. |
| **Inline styles** | Sprinkled throughout (e.g., `style={{ display: "flex" }}`, `style={{ color: "red" }}`) |

### Design System (index.css variables)

```css
--primary-color:    #a89f91   /* warm grey – main */
--secondary-color:  #dcd6cf   /* warm pale grey – secondary bg */
--tertiary-color:   #f5f3ef   /* lightest – page bg */
--text-color:       #4b463e   /* deep brown */
--text-muted:       #7f786e
--border-color:     #c5beb3
--accent-color:     #b07d62   /* wood-tone button/highlight */
--success-color:    #809974   /* matcha green */
--warning-color:    #d8a363   /* amber */
--error-color:      #b66b60   /* brick red */
```

### Common Patterns

- Cards with soft shadow and rounded corners
- Full-screen modal overlays with a centred card
- Horizontally scrolling date/filter strips
- Image banner with dark gradient overlay and text on top (CourseCard)
- Fixed bottom navigation bar

### Inconsistencies / Maintenance Issues

- **Mixed CSS approach**: Some pages use CSS Modules, some use global CSS. Global CSS risks class name clashes as the project grows.
- **`AdminTransaction` imports styles from `AdminMember.module.css`** — page-level styles shared across pages via direct import.
- **Inline styles**: Used for ad-hoc adjustments, bypassing the CSS variable system.
- **Variables defined but underused**: The `index.css` palette is well thought out but many hardcoded hex values appear in component stylesheets (e.g., `#f33`, `#fe9`, `#fbecfb`).
- **`DefaultLayout.css`**: Effectively empty — the file exists but contains only empty nested selectors.

---

## 7. Refactor Risks

### Bugs (Fix Immediately)

| Location | Bug |
|---|---|
| `Construction.tsx` | Reads `userRole` from `useAppContext()` — property does not exist. Crashes at runtime. |
| `PopupMessage.tsx` | `onClick={setPromptMessage("")}` — executes immediately on render instead of on click. |
| `CoachCourseDetail.tsx` (line 51) | API URL has double slash: `${VITE_API_BASE_URL}/coach/coach-course-detail.php` |

### Tightly Coupled Parts

- `CoachCourseDetail` serves both coach and admin roles with branching `user.role` logic. Admin-specific actions (start course, remove course) live inside a "coach" page.
- `AdminTransaction` borrows layout CSS directly from `AdminMember.module.css`, coupling two unrelated pages at the stylesheet level.
- Navigation state (`selectedPage`) duplicates the URL in global context. Both must be kept in sync manually on every navigate call.

### Fragile Areas

- **Context-based navigation data** (`selectedCourseId`, `selectedEvent`): State is lost on page refresh. Deep linking to a course detail is impossible.
- **`refreshKey` pattern**: Incrementing a key to trigger a re-fetch in `AppContext.useEffect` is non-obvious. Any refresh in any page triggers a full auth-check re-fetch.
- **No error boundaries**: Axios failures result in silent `console.error` or browser `alert()` calls. No unified error handling.
- **`setLoading` called synchronously before async completes** in some `useEffect` hooks (e.g., `CoachAccount`) — loading spinner may disappear before data is ready.

### Duplicated Logic

- Booking count enrichment: repeated in 4 pages (`Home`, `Schedule`, `CoachSchedule`, `CoachAccount`).
- "Not logged in" UI block: duplicated in `Account` and `CoachAccount`.
- Rules overlay: duplicated in `Account` and `CoachAccount`.
- Footer (copyright + links): duplicated in `Account` and `CoachAccount`.
- Phone number lookup (check student then confirm): duplicated in `Purchase` and `WalkIn`.

### Dead Code

- `ChangePasswordAdmin` component — never imported or used anywhere.
- `Events` / `EventDetail` / `CoachSite` / `AdminSite` pages — commented out of router but code remains.
- `zustand` dependency — installed, zero usage.
- `date-fns` and `dayjs` — both present; only `dayjs` is used in `Schedule.tsx`; `date-fns` used in admin components. One should be chosen and the other removed.
- `src/ultis/` — typo in folder name (`ultis` → `utils`). `@` path alias configured in Vite but never used; all imports use relative paths.

### Unclear Naming

- `userContext.tsx` — filename lowercase inconsistent with `AppContext.tsx`.
- `book2.php` called from two places (student and admin walk-in) — unclear if they are the same endpoint or different.
- `refreshKey` — non-descriptive; purpose is to re-trigger session fetch.
- `stateLabelMap` vs `stateLabelMap2` in `CoachCourseDetail` — nearly identical maps with no clear naming distinction.

### No TypeScript Types

All API response objects are typed as `any`. There are no shared interfaces for `User`, `Course`, `Booking`, or `Card`. The only typed interface in the codebase is `CourseCardProps`.

---

## 8. Refactor Recommendations

### Keep As-Is (Works Well)

- **`CourseCard`** — well-structured, typed props, i18n-aware. Reuse in refactor.
- **`AccountSetting`** — solid profile edit + password change flow. Minor cleanup needed.
- **`i18n` setup** — namespace structure is clean. EN/ZH separation is good. Admin pages need i18n added.
- **CSS variable palette** — the design token system in `index.css` is well-considered. Standardise all colour usage against these variables.
- **`timeCheck.ts`** utility — the Malaysia timezone helpers are accurate and useful.
- **`GlobalWrapper` auth redirect logic** — clean role-based routing approach. Worth preserving.

### Rebuild / Consolidate

| Area | Action |
|---|---|
| **Type system** | Define shared TypeScript interfaces: `User`, `Course`, `Booking`, `Card`, `Transaction`. Replace all `any` usages. |
| **Service layer** | Extract all `axios` calls into a `src/services/` folder (e.g., `authService.ts`, `courseService.ts`, `adminService.ts`). Add a shared Axios instance with base URL and interceptors. |
| **URL-based navigation** | Replace `selectedCourseId` and `selectedEvent` in context with React Router URL params (e.g., `/coursedetail/:id`). Enables deep linking and refresh safety. |
| **State management** | Remove redundant `selectedPage` context state; derive active nav item from the URL. Evaluate using `zustand` (already installed) for `courses`, `allBookings`, `cards` instead of UserContext to allow fine-grained subscriptions. |
| **Booking count utility** | Extract the head-count enrichment logic into a reusable function (or a custom hook) and call it from a single location. |
| **Shared UI** | Extract: rule overlay, "not logged in" block, footer, and popup shell into dedicated reusable components. |
| **Styling** | Unify on CSS Modules for all components. Remove all global `.css` files (except `index.css`). Replace inline styles and hardcoded hex values with CSS variables. |
| **Date libraries** | Pick one: prefer `dayjs` (already used in Schedule and well-suited for formatting). Remove `date-fns`. |
| **Admin section** | Add i18n to all admin pages. Split `CoachCourseDetail` into separate coach and admin views. |
| **Dead code** | Remove: `ChangePasswordAdmin`, `Events`, `EventDetail`, `CoachSite`, `AdminSite`, or move to a `_draft/` folder if they will be revisited. Remove `zustand` if not adopting it, or adopt it properly. |

### Suggested Module Structure (Next Version)

```
src/
├── assets/
├── components/
│   ├── common/           # CourseCard, Loading, PopupMessage, RulesModal, Footer, etc.
│   └── admin/            # Admin-specific components
├── contexts/             # Keep AppContext (auth only); move data to zustand stores
├── hooks/                # useBookingEnrichment, useCourseFilter, etc.
├── layouts/
├── locales/
├── pages/
│   ├── admin/
│   ├── auth/
│   ├── coach/
│   └── student/          # Rename current root-level student pages into subfolder
├── routes/
├── services/             # authService, courseService, adminService, coachService
├── stores/               # zustand: courseStore, bookingStore, userStore
├── types/                # User, Course, Booking, Card, Transaction interfaces
├── utils/                # timeCheck, formatters
├── i18n.ts
├── main.tsx
└── App.tsx
```
