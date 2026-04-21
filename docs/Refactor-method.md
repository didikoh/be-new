# Be Studio Refactor Plan (Updated Based on Actual Progress)

## Current Progress (From Git History)

### ✅ Completed

#### 1. API Layer Refactor

* Centralized Axios client with interceptor
* Unified error handling strategy
* Introduced typed API services and endpoints
* Replaced inline axios calls across pages/components
* Improved backend CORS handling (error responses included)
* Optimized backend query (`booking_count` via subquery)

#### 2. Popup / Toast System Refactor

* Refactored `PopupMessage` component
* Added toast types (success, error, warning, info)
* Improved styling and animations
* Replaced most `alert()` usage

### 🔄 In Progress

* Replacing all `window.confirm()` with `ConfirmationPopUp`

---

## Refactor Strategy

Instead of rewriting everything, this plan continues refactoring in structured phases based on your current foundation.

---

## Phase 1 — Network & UI Feedback Foundation (DONE)

### Objective

Standardize API communication and user feedback handling.

### Scope

* Centralized API client
* Typed service modules
* Global error handling via interceptor
* Popup/toast notification system
* Replace `alert()` usage

### Status

✅ Completed

---

## Phase 2 — Confirmation Flow Standardization (CURRENT)

### Objective

Replace all native confirmation dialogs with a consistent UI component.

### Scope

* Create reusable `ConfirmationPopUp`
* Replace all `window.confirm()` usage
* Ensure async-safe handling (no state update during render)
* Align UI/UX with popup/toast system

### Deliverables

* Fully reusable confirmation component
* Consistent confirm/cancel UX across app

### Status

🔄 In Progress

---

## Phase 3 — Shared Component Standardization

### Objective

Eliminate duplicated UI patterns and improve consistency.

### Scope

* Extract reusable `CourseCard`
* Standardize tab components (filters, status tabs)
* Create shared modal/popup layout
* Standardize buttons, inputs, forms
* Add consistent loading and empty states

### Deliverables

* `components/common`
* `components/forms`
* `components/popup`

### Benefit

Reduces duplication and makes UI easier to maintain/change.

---

## Phase 4 — Project Structure Refactor

### Objective

Make the codebase scalable and easier to navigate.

### Scope

* Reorganize folders by feature/domain
* Standardize naming conventions
* Separate concerns clearly

### Suggested Structure

```
features/
  student/
  coach/
  admin/
components/
  common/
  forms/
  popup/
services/
hooks/
types/
utils/
locales/
```

### Deliverables

* Clean and scalable folder structure

---

## Phase 5 — State Management Cleanup

### Objective

Reduce fragile global state and improve maintainability.

### Scope

* Refactor oversized global context
* Remove `prevPage` pattern
* Use router-based navigation
* Move local UI state closer to components
* Keep only necessary global state (auth, user)

### Deliverables

* Cleaner state boundaries
* Reduced cross-page coupling

---

## Phase 6 — Core Business Flow Refactor

### Objective

Stabilize critical features before scaling further.

### Priority Flows

1. Student booking flow
2. Admin course lifecycle (start/force/cancel)
3. Top-up and transaction flow
4. Walk-in registration

### Scope

* Improve validation
* Standardize popup usage
* Clarify business logic
* Reduce duplicated logic

### Deliverables

* Stable and maintainable core flows

---

## Phase 7 — Authentication & Account Cleanup

### Objective

Improve UX and structure of user account system.

### Scope

* Refactor login/register forms
* Improve validation and feedback
* Clean profile edit and password flow
* Improve redirect behavior after login

### Deliverables

* Cleaner and more user-friendly auth system

---

## Phase 8 — Admin Scalability Improvements

### Objective

Prepare admin system for larger datasets.

### Scope

* Add pagination to tables
* Improve filtering/search
* Optimize rendering performance
* Normalize table actions

### Deliverables

* Scalable admin interface

---

## Phase 9 — i18n & Content Standardization

### Objective

Make bilingual support maintainable.

### Scope

* Move all UI text to locale files
* Standardize translation keys
* Use English for codebase

### Deliverables

* Clean i18n structure

---

## Phase 10 — Final Cleanup & Rebuild Preparation

### Objective

Prepare system for long-term scaling or full rebuild.

### Scope

* Remove dead code and disabled pages
* Clean commented-out legacy code
* Document business rules
* Identify reusable modules

### Deliverables

* Clean, documented codebase

---

## Milestone View

### Milestone A — Foundation (DONE / CURRENT)

* Phase 1 (API + Popup)
* Phase 2 (Confirmation)

### Milestone B — Structure & Maintainability

* Phase 3
* Phase 4
* Phase 5

### Milestone C — Core Business Stability

* Phase 6
* Phase 7
* Phase 8

### Milestone D — Long-Term Readiness

* Phase 9
* Phase 10

---

## Notes

This plan reflects actual implementation progress from Git history, not just theoretical refactor stages.

You are already ahead of a typical refactor start because:

* API layer is centralized
* Error handling is standardized
* UI feedback system is unified

Next critical step is completing confirmation flow and moving into component + structure refactor.
