# Be Studio Membership & Class Booking Platform - Requirements Document

## 1. Project Name

**Be Studio Membership & Class Booking Platform**

## 2. Project Objective

Be Studio requires a membership and class management platform for a fitness / dance studio environment. The platform is intended to support member class bookings, coach schedule viewing, and back-office operations for member, class, and transaction management.

The platform should prioritize a mobile-first experience for member-facing flows, while also supporting practical back-office usage scenarios. The system must support both **English** and **Simplified Chinese**.

## 3. User Roles

### 3.1 Student

A regular member user who can browse classes, make bookings, and view personal membership information and history.

### 3.2 Coach

A coach user who can view assigned teaching schedules, class details, and enrolled student lists.

### 3.3 Admin

A back-office administrator who can manage members, coaches, classes, bookings, transactions, product sales, points, and walk-in processes.

## 4. Core Business Requirements

### 4.1 Member Portal Requirements

#### 4.1.1 Home

The system should provide a member home page showing:

- Basic studio information
- Contact information and social media entry points
- Recommended classes for today
- Upcoming booked classes within the next 7 days
- Studio timetable information
- Quick access to class and account-related pages

#### 4.1.2 Class Browsing

The system should allow members to browse classes by date and present clear class cards that include:

- Class image
- Class name
- Coach
- Location
- Time
- Current booked headcount
- Minimum booking count
- Member price / non-member price
- Booking entry point

#### 4.1.3 Class Details

The system should provide a class detail page showing:

- Banner image
- Class title
- Duration
- Minimum booking count
- Coach information
- Location
- Time
- Price
- Booking participant selector (head count)
- Booking button / already booked status

#### 4.1.4 Class Booking

Members should be able to complete class bookings. The system must support:

- Login validation
- Membership eligibility validation
- Balance validation
- Head count selection
- Booking confirmation modal
- Already-booked status recognition
- Guidance for non-members to join the membership flow

#### 4.1.5 Account Center

Members should have a personal account center showing:

- Avatar, name, and phone number
- Membership card information
- Current balance
- Frozen balance
- Expired balance
- Points balance
- Validity period
- Training hours of the current week
- Booking history
- Studio rules entry point
- Edit profile
- Change password
- Logout

#### 4.1.6 Booking History

The system should provide booking history filtering with at least the following statuses:

- Booked
- Paid
- Cancelled
- Completed

### 4.2 Coach Portal Requirements

#### 4.2.1 My Schedule

A coach should be able to view their teaching schedule for the next 7 days.

#### 4.2.2 Class Details

A coach should be able to view the following for a class session:

- Class information
- Enrolled student list
- Student phone numbers
- Head count

#### 4.2.3 Student Management

A coach should be able to cancel an individual student's booking.

#### 4.2.4 Personal Center

A coach should have an account center showing:

- Number of classes taught this month
- Number of students served this month
- Class history status filtering
- Edit profile
- Change password
- Rules / guidelines

### 4.3 Admin Portal Requirements

#### 4.3.1 Dashboard

The admin dashboard should display key operational data:

- Total users
- Total members
- Total bookings today
- Total revenue today

#### 4.3.2 Member Management

The admin portal should provide member management features, including:

- Student list
- Coach list
- Search and filtering
- Edit user profile
- View membership status
- View balance, frozen balance, expired balance, point balance, and validity
- View coach monthly teaching count and student count

#### 4.3.3 Top-up / Membership Activation

The admin portal should support the following actions for members:

- Top-up
- Set validity period
- Activate membership status
- Record payment amount
- Automatically generate transaction records

#### 4.3.4 Class Management

The admin portal should support:

- Viewing timetable
- Filtering by date / name / coach
- Creating classes
- Editing classes
- Deleting / deactivating classes
- Viewing class details
- Walk-in registration

#### 4.3.5 Class Execution Management

The admin portal should support:

- Viewing booking status for each session
- Starting a class
- Force-starting a class
- Cancelling a class
- Processing booking charge logic when the class starts

#### 4.3.6 Transaction Records

The admin portal should support categorized transaction records, including:

- Income
- Expense
- Purchase
- Booking freeze
- Booking charge
- Booking refund
- Membership activation
- Top-up
- Product purchase
- Point conversion credit
- Manual adjustment

Each record should support viewing key information such as:

- User
- Type
- Amount
- Points
- Quantity
- Course / product / order reference
- Description
- Time

#### 4.3.7 Invoice / Receipt

The admin portal should support generating an invoice / receipt for a specified transaction.

### 4.4 Product Sales / Counter Consumption

The system must support product retail and over-the-counter consumption scenarios.

#### 4.4.1 Product Management

The admin portal should support:

- Viewing product list
- Creating products
- Editing products
- Disabling products
- Maintaining selling price, cost price, stock quantity, category, image, and bilingual description

#### 4.4.2 Product Purchase by Admin

The admin should be able to create a product purchase on behalf of a specified user.

#### 4.4.3 Balance Deduction for Product Purchase

The system should allow product purchases to be deducted from the user's account balance.

#### 4.4.4 Walk-in / Guest Retail Purchase

The system should support walk-in / guest retail purchases. When the customer does not have an online account, the admin should record the purchase under a **guest account**.

#### 4.4.5 Product Sales Records

The system must preserve the following product-related records:

- Products
- Product orders
- Product order items
- Related transactions

### 4.5 Points System

The system must support a points mechanism tied to actual class spending.

#### 4.5.1 Point Earning

Users should earn points after class consumption is actually charged.

#### 4.5.2 Point Calculation Rule

Points should be calculated based only on the **actual charged course amount**. Frozen amounts or unpaid bookings must not generate points.

#### 4.5.3 Point Conversion by Admin

The admin should be able to convert points into monetary value and credit the converted amount back into the user's account balance.

#### 4.5.4 Point Ledger

The system must preserve a complete point ledger, including:

- Point earning
- Point redemption / conversion
- Point adjustment
- Source and related references

## 5. Core Business Rules

### 5.1 Course Session Status

Course sessions must support the following statuses:

- Scheduled
- Started
- Completed
- Cancelled

### 5.2 Booking Status

Bookings must maintain their own independent statuses:

- Booked
- Paid
- Cancelled
- Completed

### 5.3 Booking Freeze Mechanism

When a booking is created, the system should **freeze** the relevant amount instead of immediately performing the final deduction.

### 5.4 Charge Timing

The actual booking charge should only happen when the class is started from the admin side.

### 5.5 Cancellation Refund Rule

If a booking is cancelled before being charged, the frozen amount should be released back to the available balance.

### 5.6 Minimum Booking Count

A class session must support a minimum booking count. If the minimum requirement is not met, the admin should be able to:

- Force-start the class
- Cancel the class

### 5.7 Multi-person Booking

The system must support booking multiple participants under a single account by using **head count**.

### 5.8 Member and Non-member Pricing

Each class should support both:

- Member price
- Non-member price

### 5.9 Walk-in

The admin portal must support walk-in handling for:

- Guest
- Member

### 5.10 Login-time Expiry Check

When a user logs in, the system must perform expiry validation.

#### 5.10.1 Balance Expiry Handling

If the balance has expired, the current usable balance should be converted into **expired balance**. This is for record-keeping only and the expired amount can no longer be used.

#### 5.10.2 Membership Card Expiry Handling

If a membership card has expired, the card should be changed to **inactive / non-active status** for usage purposes, while preserving all historical card data and booking-related data. The member pricing benefit should no longer be available once the card is no longer active.

## 6. Product Experience Requirements

### 6.1 Mobile-first

The member-facing system should follow a mobile-first design approach.

### 6.2 Role-based Navigation Separation

Different roles must see their own independent navigation structure after entering the system.

### 6.3 Bilingual Support

The system must support:

- English
- Simplified Chinese

### 6.4 Unified Interaction Patterns

The system should keep interaction patterns as consistent as possible across:

- Course card display
- Tab switching
- Modal / popup forms
- Role-based layouts

## 7. Non-functional Requirements

### 7.1 Maintainability

The system should have clear module boundaries to support future extension and maintenance.

### 7.2 Scalability

The system should be able to support future enhancements such as:

- A more complete forgot password flow
- Dynamic timetable
- Pagination and larger-scale admin data handling
- Additional operational features

### 7.3 Consistency

Code naming, page structure, translation resources, and data flow should follow consistent standards.

## 8. Data Model Alignment

The requirements are aligned with the current data model defined in `CREATE_DB.sql`, including the following major entities:

- `users`
- `guest_profiles`
- `coach_profiles`
- `studio_locations`
- `membership_plans`
- `member_cards`
- `courses`
- `course_sessions`
- `bookings`
- `booking_participants`
- `transactions`
- `invoices`
- `invoice_items`
- `login_audit_logs`
- `products`
- `product_orders`
- `product_order_items`
- `point_ledgers`

## 9. Notes

- Booking should freeze funds first, and only deduct the actual amount when the class is started in the admin portal.
- Cancellation should release frozen funds when no final charge has been made yet.
- Walk-in users without an online account should be recorded through a guest account flow.
- Points should only be granted after actual class charging, not at booking time.
