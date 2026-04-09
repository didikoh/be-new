# Be Studio Membership & Class Booking Platform - Development Plan

## 1. Development Goal

This project will be developed as a new studio membership and class management platform. The goal is to deliver a usable core business workflow first, then progressively expand into enhanced operational features.

## 2. Project Scope

### Phase 1 Scope (MVP)

The first delivery phase should prioritize the following modules.

#### Member Portal

- Login
- Registration
- Home
- Class list / schedule browsing
- Class details
- Booking flow
- Account center
- Membership card display
- Booking history
- English / Simplified Chinese language switching

#### Admin Portal

- Dashboard
- Member management
- Class management
- Class execution management
- Transaction records
- Basic invoice / receipt output
- Product sales / counter consumption
- Points management

#### Coach Portal

- My schedule
- Class details
- Student list
- My account page

## 3. Project Phases

### Phase 1: Requirements and Structure Definition

**Deliverables**

- Product requirements document
- Page map
- Business rules document
- Data model draft / alignment note
- API contract draft
- Design direction note

### Phase 2: Frontend Foundation

**Content**

- New project initialization
- Routing system
- Role-based layouts
- i18n foundation
- Global state strategy
- UI base components
- Mock data / service layer

### Phase 3: Member Portal Development

**Content**

- Home
- Schedule / class browsing
- Class detail
- Booking flow
- Account
- Membership card
- Booking history
- Expiry handling at login experience

### Phase 4: Admin Portal Development

**Content**

- Dashboard
- Member management
- Top-up / membership activation
- Product management
- Product order / counter sales
- Walk-in / guest handling
- Class table / add-edit modal
- Start / force-start / cancel class flow
- Transactions
- Invoice / receipt
- Points conversion and point ledger viewing

### Phase 5: Coach Portal Development

**Content**

- Coach schedule
- Coach class detail
- Student list
- Coach account / stats

### Phase 6: Optimization and Formal Integration

**Content**

- API integration
- Permission control
- Error handling and notifications
- Pagination and filtering optimization
- Dynamic timetable
- Full forgot password flow
- Testing and deployment

## 4. Recommended Development Sequence

### Sprint 1

- Set up project structure
- Set up routes
- Set up role-based layouts
- Build UI primitives
- Build i18n structure

### Sprint 2

- Complete student home / schedule / course card / date strip
- Complete class detail
- Complete booking popup and head count flow

### Sprint 3

- Complete account page
- Complete membership card display
- Complete booking history
- Complete edit profile / change password
- Add login-time expiry handling

### Sprint 4

- Complete admin dashboard
- Complete member list
- Complete charge / top-up modal
- Complete class table / add-edit modal / walk-in
- Complete guest account recording flow

### Sprint 5

- Complete class execution flow
- Implement booking freeze, charge, and cancellation release rules
- Complete transaction tabs
- Complete invoice / receipt

### Sprint 6

- Complete product module
- Complete product sales / counter consumption flow
- Complete balance deduction for product purchase
- Complete point earning, conversion, and point ledger flow

### Sprint 7

- Complete coach portal
- Complete polish work, empty states, error states, responsiveness, and translation completion

## 5. Technical Recommendations

### Frontend

- React + Vite + TypeScript
- React Router
- i18n
- Modular folder structure
- Unified service layer
- Unified form and modal components

### Backend

A RESTful API approach can be adopted to serve the following core resources:

- users
- guest_profiles
- coach_profiles
- studio_locations
- membership_plans
- member_cards
- courses
- course_sessions
- bookings
- booking_participants
- transactions
- invoices
- products
- product_orders
- point_ledgers

### Data / State Concepts

The system should clearly separate the following concepts:

- Course session status
- Booking status
- Current balance
- Frozen balance
- Expired balance
- Membership validity
- Point balance
- Walk-in / guest records
- Product sales records

## 6. Key Deliverables

During development, the project should gradually produce:

- Product requirements document
- Page map
- Business rules document
- Data model document
- API documentation
- Frontend component guideline
- UI style guideline
- Testing checklist
- Deployment guide

## 7. Additional Functional Scope Added

### 7.1 Product Sales / Counter Consumption

The system should include:

- Product list management
- Product create / edit / disable
- Admin-created retail purchase for a specified user
- Balance deduction from a user's account for product purchase
- Walk-in / guest retail purchase using a guest account
- Product order, order item, and transaction record preservation

### 7.2 Points System

The system should include:

- Point earning after actual class consumption
- Point calculation based only on actual charged course amount
- Admin conversion of points into monetary value and recharge back to user balance
- Complete point ledger records

## 8. Critical Business Rules to Implement

### 8.1 Booking Charge Rule

A booking should only freeze the amount at booking time. The actual deduction happens only when the admin starts the class.

### 8.2 Booking Cancellation Rule

If a booking is cancelled before final charge, the frozen amount should be returned to available balance.

### 8.3 Login-time Expiry Check

When a user logs in, the system should check both balance expiry and membership card expiry.

#### 8.3.1 Balance Expiry

Expired usable balance should be converted into expired balance as a record-only amount that can no longer be used.

#### 8.3.2 Membership Card Expiry

When a membership card expires, the card should become non-active for pricing eligibility. Historical card data and booking-related data should remain preserved.

### 8.4 Walk-in Handling

For walk-in customers without an online account, the admin should use a guest account to create and preserve operational records.

## 9. Risks and Control Points

### 9.1 Unclear Business Rules

The following must be clearly defined before implementation:

- Booking deduction timing
- Whether cancellation releases frozen amount
- Expiry logic
- Guest / member differences
- Point earning and point conversion rules
- Product purchase payment rules

### 9.2 Unclear Role Boundaries

Student / Coach / Admin pages and permissions must be separated clearly from the beginning.

### 9.3 Premature Scope Expansion

Core business loops should be completed first before extending into advanced features.

### 9.4 Unclear Data Model

Relationships among classes, bookings, transactions, member cards, product orders, and point ledgers must be confirmed early to avoid rework.

### 9.5 Database Consistency Risk

Implementation should stay aligned with `CREATE_DB.sql`, especially around:

- `member_cards`
- `bookings`
- `transactions`
- `products`
- `product_orders`
- `point_ledgers`

## 10. Success Criteria

The first major phase of the project should be considered successful when:

- Members can browse and book classes smoothly
- Coaches can view teaching schedules and student lists
- Admins can manage members, classes, transactions, product sales, and points
- The system supports bilingual usage
- Core status transitions are correct
- Booking freeze / charge / cancellation release logic works correctly
- Product purchase and point conversion flows are properly recorded
- Page structure and module separation are clear
- The project can later integrate smoothly with formal APIs and expanded features
