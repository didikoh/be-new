# Legacy System Review — Be Studio Web App

> **Purpose:** Preserve product and feature knowledge from the current codebase to inform a clean rebuild.  
> **Scope:** Frontend only — pages, features, layout structure, UI patterns.  
> **Not covered:** Code quality, architecture, or technical implementation details.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Existing Pages / Screens](#2-existing-pages--screens)
3. [Existing Features](#3-existing-features)
4. [Layout and UI Structure](#4-layout-and-ui-structure)
5. [Reusable Design Patterns](#5-reusable-design-patterns)
6. [Things Worth Preserving](#6-things-worth-preserving)
7. [Things That Should NOT Be Preserved](#7-things-that-should-not-be-preserved)

---

## 1. System Overview

**Be Studio** is a fitness studio booking web app (mobile-first) based in Batu Pahat, Johor, Malaysia.

### User Roles

The app has three distinct roles, each with a completely different set of pages and a separate navigation menu:

| Role | Description |
|---|---|
| `student` | General member who can browse and book classes |
| `coach` | Instructor who can view their own schedule and enrolled students |
| `admin` | Studio operator with full management access |

Users who are not logged in behave as a read-only `student` (they can browse but cannot book).

### Language Support

The app supports two languages: **English (en)** and **Chinese Simplified (zh)**. The language toggle applies to all user-facing text via i18next.

---

## 2. Existing Pages / Screens

### Student Pages (3 main, with bottom nav)

#### `/home` — Student Home
The main landing screen for students. Shows studio info, a timetable image, the user's upcoming booked courses, and today's available courses.

#### `/schedule` — Class Schedule
A 7-day browsable schedule. Students swipe through the next 7 days using a date strip and see courses available on each selected day.

#### `/account` — Student Account
The student's personal dashboard. Shows their profile, membership card(s), balance, weekly training time, and a filtered history of all their bookings.

---

### Standalone Pages (no bottom nav)

#### `/coursedetail` — Course Detail (Student View)
A full-screen detail page for a specific course. Shows the banner image, coach info, location, timing, member price, and a booking button. Accessed by tapping a course card from Home or Schedule.

#### `/login` — Login
Phone number + password login form. Has links to Register and Forget Password.

#### `/register` — Register
New user sign-up form. Collects name, phone, birthday, password (with confirmation), and an optional profile photo.

#### `/forget_password` — Forgot Password
A minimal page that redirects the user to WhatsApp to contact admin for a password reset. No self-service reset flow exists.

---

### Coach Pages (2 main, with bottom nav)

#### `/coach_schedule` — Coach Schedule
Shows the coach's own upcoming classes over the next 7 days in a list format. Tapping a course goes to the coach's course detail view.

#### `/coach_account` — Coach Account
Coach personal dashboard. Shows this month's class count and student count, plus a filterable list of all their courses (scheduled / started / completed / cancelled).

#### `/coach_coursedetail` — Coach Course Detail (shared with admin)
Shows full course info plus a list of enrolled students with their head count. A coach sees a "Return to Schedule" button. An admin sees course management actions (start course, cancel course, force-start if below minimum).

---

### Admin Pages (5 main, with bottom nav)

#### `/admin_home` — Admin Dashboard
Simple stats summary: total users, total members, today's bookings, today's revenue.

#### `/admin_member` — Member Management
Tabbed between **Students** and **Coaches**.  
- Student view: searchable/filterable table with edit and top-up (charge) actions.  
- Coach view: table showing monthly class and student counts, with a popup to see a coach's course history by month.

#### `/admin_transaction` — Transaction Records
Tabbed between three transaction types:  
- **Income** (top-ups / membership charges): editable payment amount, invoice generation.  
- **Expense** (course bookings / payments deducted from balance).  
- **Purchase** (merchandise or services sold to members in-person).

#### `/admin_course` — Course Management
Main course scheduling table. Filterable by date and coach/course name. Actions per row: Edit, View (goes to coach detail view), and Walk-In registration. The Add New button opens an edit popup prefilled from a "static course" template.

#### `/admin_account` — Admin Account
Simple profile card showing name, phone, and permission level (highest or standard). Only action is logout.

---

### Disabled / Commented-Out Pages

These pages exist in the codebase but are not reachable:

| Route | File | Note |
|---|---|---|
| `/event` | `Events.tsx` | News and events list — disabled |
| `/eventdetail` | `EventDetail.tsx` | Event detail — accessible but event list is disabled |
| `/coach_site` | `CoachSite.tsx` | Court/venue management for coaches — disabled |
| `/admin_site` | `AdminSite.tsx` | Court/venue management for admin — disabled |
| `/construction` | `Construction.tsx` | Generic placeholder for pages under construction |

---

## 3. Existing Features

### Student-Facing Features

| Feature | Description |
|---|---|
| Studio info card | Shows studio name, admin contact, address, phone, and social media buttons (WhatsApp, Instagram, Facebook) |
| Weekly timetable image | A static image showing the weekly class schedule |
| My upcoming bookings | Lists the student's own booked courses for the next 7 days on the home screen |
| Today's recommended courses | Shows all courses scheduled for today on the home screen |
| 7-day schedule browser | Date strip on Schedule page; tap a day to see that day's courses |
| Course card | Visual card with course image, name, coach, location, time, booking count, member price, min bookings, and a book/view button |
| Course detail page | Full detail view of a course; includes head-count picker (±1) and booking confirmation popup |
| Balance check before booking | Prevents booking if card balance is insufficient |
| Member check before booking | Non-members are redirected to WhatsApp to join instead of booking |
| Booking confirmation popup | Summary popup (course name, time, people count, unit price, total) before confirming a booking |
| Account dashboard | Profile photo, name, phone, edit/logout buttons |
| Membership card display | Shows card type, current balance (minus frozen), and validity date |
| Join membership CTA | If no membership card exists, shows a "Join Us" button that opens WhatsApp |
| Weekly training time | Calculates and displays total completed training minutes for the current week |
| Booking history filter | Tabs: Booked / Paid / Cancelled / Completed — shows corresponding course cards |
| View studio rules | Full-screen overlay showing studio rules in selected language |
| Edit profile | Slide-up overlay form to update name, birthday, profile photo |
| Change password | Toggle inside the edit profile overlay; requires old password |
| Forget password | Redirects to WhatsApp — no self-service reset |
| Privacy Policy / T&C links | Footer links opening external HTML pages |
| Language support | English / Chinese Simplified toggle via i18next |

---

### Coach-Facing Features

| Feature | Description |
|---|---|
| Upcoming schedule | Lists own courses in the next 7 days |
| Course detail with student list | Shows all enrolled students (name, phone, head count) for a given course |
| Cancel student booking | Coach can cancel a specific student's booking from the detail page |
| Monthly stats | This month's total classes taught and total students served |
| Course history with filters | All courses filtered by state: Scheduled / Started / Completed / Cancelled |
| View coach rules | Overlay showing coach-specific rules |
| Edit profile / change password | Same component as student account settings |

---

### Admin-Facing Features

| Feature | Description |
|---|---|
| Stats dashboard | User count, member count, today's bookings, today's revenue |
| Student list | Searchable by name/phone/points/balance/birthday; shows membership, balance, validity, frozen balance |
| Edit student profile | Popup form to update a student's name, phone, birthday, role, password |
| Top-up / charge member | Popup to add balance, set validity date, and activate membership; records a transaction |
| Coach list | Shows monthly class and student count per coach |
| Coach course history | Month/year picker popup showing all courses taught by a coach with student counts |
| Course table | All scheduled courses with: name, price, min/booking count, coach, date, time, status |
| Filter courses | Filter by date (date picker) and by coach or course name (text search) |
| Add / edit course | Popup form with course template selector, coach dropdown, datetime picker, location, price, etc. |
| Delete / cancel course | Remove a course and all its bookings |
| Course status tracking | States: Scheduled (0), Started (1), Completed (2), Cancelled (-1) — color coded |
| Start course | Admin confirms course start; triggers balance deduction from all booked students |
| Force-start course | Start a course even if below the minimum booking count |
| Walk-in registration | Admin popup to add a Guest (no account) or Member booking directly to a course |
| Transaction records | View income, expense, and purchase transactions in separate tabs |
| Edit transaction payment | Modify the collected payment amount on income transactions |
| Generate invoice/receipt | Opens a generated invoice PDF/page for a transaction |
| Add purchase record | Admin records an in-person purchase by a member (phone lookup + amount + description) |
| Admin account info | Shows admin name, phone, and permission level |

---

## 4. Layout and UI Structure

### Overall App Shell

- **Mobile-first** single column layout with a fixed bottom navigation bar.
- The layout has two modes:
  - **DefaultLayout**: main content area + fixed `BottomNavBar` at the bottom.
  - **Fullscreen pages** (login, register, course detail, etc.): no nav bar, fill the viewport.
- A global loading overlay sits at the root level (via context).

---

### Bottom Navigation Bar (Role-Based)

The nav bar renders different items based on the logged-in user's role:

| Role | Nav Items |
|---|---|
| Student | Home · Schedule · Account |
| Coach | My Schedule · My Account |
| Admin | Home · Members · Transactions · Courses · Account |

Active item is highlighted. Tapping an item navigates and updates the active state.

---

### Student Home Page

```
┌─────────────────────────────────┐
│  Studio Info Card               │
│  [Logo] Studio name + contact   │
│  Address block                  │
│  [WhatsApp] [Instagram] [FB]    │
├─────────────────────────────────┤
│  Weekly Timetable Image Card    │
├─────────────────────────────────┤
│  My Upcoming Bookings           │
│  [Course Card]                  │
│  [Course Card]                  │
├─────────────────────────────────┤
│  Today's Courses                │
│  [Course Card]                  │
│  [Course Card]                  │
└─────────────────────────────────┘
         [Bottom Nav]
```

---

### Schedule Page

```
┌─────────────────────────────────┐
│  Date Strip (7 days)            │
│  [Mon 14] [Tue 15] [Wed 16]...  │
├─────────────────────────────────┤
│  Course list for selected day   │
│  [Course Card]                  │
│  [Course Card]                  │
└─────────────────────────────────┘
         [Bottom Nav]
```

---

### Course Detail Page (Student)

```
┌─────────────────────────────────┐
│ [← Back]   Course Detail        │
├─────────────────────────────────┤
│  Banner Image                   │
├─────────────────────────────────┤
│  Card: Title + Duration + Min   │
├─────────────────────────────────┤
│  Card: Coach avatar + name      │
│        Location                 │
├─────────────────────────────────┤
│  Card: Time · Member Price      │
│        Head Count Picker (±1)   │
│        (if already booked: shows head count) │
├─────────────────────────────────┤
│  [Book Now] / [Already Booked]  │
└─────────────────────────────────┘
         ↓ (tapping Book Now)
┌─────────────────────────────────┐
│  Confirmation Popup             │
│  Course · Time · Count · Price  │
│  [Confirm]  [Cancel]            │
└─────────────────────────────────┘
```

---

### Student Account Page

```
┌─────────────────────────────────┐
│  [Avatar] Name / Phone          │
│                      [Edit][Out]│
├─────────────────────────────────┤
│  Membership Card(s)             │
│  Card type · Balance · Valid to │
│  (or "Not a member — Join Us")  │
├─────────────────────────────────┤
│  This Week's Training Time      │
├─────────────────────────────────┤
│  [View Studio Rules]            │
├─────────────────────────────────┤
│  Booking History                │
│  [Booked][Paid][Cancelled][Done]│
│  ─────────────────────────      │
│  [Course Card] [Course Card]    │
├─────────────────────────────────┤
│  Footer: Copyright + Links      │
└─────────────────────────────────┘
         [Bottom Nav]
```

---

### Coach Course Detail Page

Same banner/card structure as student detail, but:
- Shows **enrolled student list** (name, phone, head count) instead of booking controls.
- Each student has a **Cancel Booking** button (coach/admin only).
- Footer shows **Start Course** (admin) or **Return to Schedule** (coach).
- On start: confirmation popup → admin confirms → balance deducted from all students.
- If below min booking: popup offers **Force Start** or **Cancel Course**.

---

### Admin Member Page

```
┌─────────────────────────────────┐
│  Members     [Students][Coaches]│
├─────────────────────────────────┤
│  [FilterBy ▼] [Search____] [Add]│
├─────────────────────────────────┤
│  Table (Students):              │
│  Name|Phone|Pts|Balance|Member  │
│  Birthday|Valid To|ExpDate|     │
│  [Edit][Charge]                 │
│  ─────────────────────────      │
│  Table (Coaches):               │
│  Name|Phone|Birthday|Students   │
│  Classes|Join Date|             │
│  [Edit][View Courses]           │
└─────────────────────────────────┘
```

**Popups:**
- **Edit user**: form with name, phone, birthday, role, password reset.
- **Charge/Top-up**: amount, validity date, activate membership toggle, payment received.
- **Coach course history**: year/month picker + table of courses with student count.

---

### Admin Course Page

```
┌─────────────────────────────────┐
│  Courses          [Add New]     │
├─────────────────────────────────┤
│  [Filter▼][Search][Date Picker] │
├─────────────────────────────────┤
│  Table:                         │
│  Name|Price|Min|Booked|Coach    │
│  Date|Time|Status               │
│  [Edit][View][Walk-In]          │
└─────────────────────────────────┘
```

Status colors: green = scheduled, yellow = started, grey = ended, red = cancelled.

**Popups:**
- **Edit/Add course**: template selector, coach, start time, location, price, duration, etc.
- **Walk-In**: user type (Guest/Member), phone lookup, head count → submit.

---

### Admin Transaction Page

```
┌─────────────────────────────────┐
│  Transactions  [Income][Expense]│
│                [Purchase]       │
├─────────────────────────────────┤
│  Table (Income):                │
│  ID|Member|Type|Payment|Amount  │
│  Points|Time|[Edit][Invoice]    │
│  ─────────────────────────      │
│  Table (Expense):               │
│  ID|Member|Type|Payment|Amount  │
│  Points|Count|Course|Time       │
│  ─────────────────────────      │
│  Table (Purchase):              │
│  ID|Member|Type|Payment|Amount  │
│  Points|Description|Time        │
│  + [Add New Purchase] button    │
└─────────────────────────────────┘
```

---

### Login / Register / Forget Password

Fullscreen centered overlay (dark semi-transparent bg on register/forget, solid on login):
- **Login**: phone input (country code), password, [Join Us] link, [Forgot Password] link, submit.
- **Register**: name, phone, birthday picker, password + confirm, optional photo upload, submit.
- **Forgot Password**: single button → opens WhatsApp with pre-filled message.

---

### Account Setting (Edit Profile Overlay)

Slides in as a fullscreen overlay from the Account page:
- Toggle between **Edit Profile** (name, birthday, avatar upload) and **Change Password** (old + new + confirm).

---

## 5. Reusable Design Patterns

### Course Card
The most used component. Used on Home, Schedule, Account (student), Coach Schedule, and Coach Account. Consistent visual format:
- Background image with dark overlay
- Time displayed at top of card
- Course name, coach name, location
- Booking count + member price + minimum booking count
- CTA button: "Book Now" / "Already Booked" / "View"

### Date Strip (7-Day Selector)
Horizontal row of 7 day tiles (date number + weekday abbreviation). Active day is highlighted. Used on the student Schedule page. This is a key UX pattern worth preserving.

### Filter Tab Strip
Horizontal row of toggle buttons above a list. The active tab is highlighted. Used on:
- Student Account (Booked / Paid / Cancelled / Completed)
- Coach Account (Scheduled / Started / Completed / Cancelled)
- Admin Member (Students / Coaches)
- Admin Transaction (Income / Expense / Purchase)

### Modal Popup
A centred card over a dark overlay used for all admin/account forms: editing users, charging members, adding courses, walk-in registration, confirming course start, etc. Structure: title, form rows (label + input), action buttons (Confirm / Cancel).

### Stats Section
A two-column stat block with a label and a value. Used on:
- Student Account (weekly training time, join us CTA)
- Coach Account (classes this month, students this month)

### Dashboard Stat Cards (Admin)
Row of icon + label + number cards. Used only on Admin Home. Simple and clear.

### Role-Based Navigation Rendering
The same nav bar component renders different items based on `user.role`. Clean separation of student / coach / admin nav. Worth keeping as a pattern.

---

## 6. Things Worth Preserving

### Core User Flows
- **Student booking flow**: Browse → Course Card → Detail → Head Count → Confirm Popup → Done. This is the primary value of the app and the flow is well thought out.
- **Admin course start flow**: Manage courses → View course → See enrolled students → Confirm start → Balance deducted. This operational flow is essential.
- **Admin walk-in**: Quick popup from the course list to manually register a guest or member on the spot. Practical and important for real-world studio operations.
- **Top-up / charge member**: Admin popup for adding balance, setting validity date, and activating membership in one step. The concept is solid.

### UI Patterns to Keep
- **7-day date strip** on the Schedule page — clear, touch-friendly, and effective.
- **Course card** component — the image + overlay + info + CTA button layout works well.
- **Filter tab strip** — consistent and reusable across multiple pages.
- **Modal popups** for admin operations — appropriate for a management interface.
- **Role-based bottom nav** — clean way to separate the three experiences in one app.

### Features to Keep
- Membership card display with balance and validity date.
- Weekly training time tracker on student account.
- Booking history with status filtering.
- Studio info / social contact buttons on home.
- Coach course history with month/year picker (admin view).
- Invoice/receipt generation for income transactions.
- Language toggle (EN/ZH) — important for local Malaysian users.
- Studio rules overlay — accessible from both student and coach accounts.

### Product Logic Worth Preserving
- **Course states**: Scheduled → Started → Completed (with Cancelled as an exception). This 4-state model is correct and should be kept.
- **Booking statuses**: booked → paid → completed / cancelled. Separate from course state.
- **Frozen balance**: balance is not deducted until course starts — the concept of a frozen/reserved amount is a real business requirement.
- **Minimum booking count**: Courses have a minimum to proceed; admin can force-start below the threshold. Important operational feature.
- **Head count**: A single user can book for multiple people (family/group). This needs to be preserved.
- **Member vs. non-member pricing**: Two prices per course (`price` and `price_m`) — non-members pay the higher rate.
- **Guest walk-in**: Allows on-site registration without an account. Keep this.

---

## 7. Things That Should NOT Be Preserved

### Disabled / Dead Pages
- **Events / EventDetail** (`/event`, `/eventdetail`): These pages are disabled, unfinished (contain placeholder text in Chinese), and rely on mock data. The concept of an events/news section may still be valuable, but the current implementation is not.
- **CoachSite / AdminSite**: Court/venue management pages that were commented out and never finished. Do not carry forward the current approach; if rebuilt, design from scratch.
- **Construction page**: A generic placeholder that isn't useful to users. Replace with a proper 404 or redirect.

### Architectural / Organizational Issues
- **Mixed languages in source code**: Variable names, comments, and UI strings are inconsistently mixed between English and Chinese. The rebuild should standardize on English for all code, with translations managed cleanly through i18n files.
- **`userContext` filename casing**: `userContext.tsx` vs `AppContext.tsx` — inconsistent file naming conventions throughout.
- **State management via global context with no structure**: All global state (user, selectedCourseId, prevPage, selectedEvent, etc.) lives in a single untyped context. This becomes hard to maintain. Rebuild with typed stores.
- **`prevPage` navigation state**: Using a global `prevPage` string to know where to navigate back from detail pages is fragile. Use router-native navigation history instead.
- **Page-level API calls with no caching or separation**: Each page fetches its own data on mount with no loading state standardization and no caching layer.
- **Alert-based error handling**: Almost all errors are surfaced via `alert()`. This should be replaced with proper toast/notification UI.

### UX Issues
- **Forget Password flow**: Redirecting users to WhatsApp for a password reset is not a scalable solution. Rebuild with SMS/email OTP or a proper self-service reset.
- **No pagination on admin tables**: The member and transaction tables load all data at once with no pagination, which will degrade at scale.
- **Booking confirmation uses `window.confirm()`** in some places (force-start flow): This is not a custom UI element and looks out of place.
- **Static timetable image**: The home page shows a hardcoded `time_table.jpg` image instead of a dynamically generated schedule. This will go stale and is not ideal UX.
- **No feedback on login redirect**: If a guest tries to book and gets redirected to login, there is no return-to-course flow after logging in.

### Commented-Out Code
Several features are commented out inline (balance stats, course tags, share buttons, course intro text, "remember me" checkbox). These fragments add noise. None of them should be carried forward as-is — decide intentionally whether each feature belongs in the rebuild.
