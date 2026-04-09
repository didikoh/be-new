CREATE DATABASE IF NOT EXISTS be_studio DEFAULT CHARACTER
SET
    utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;

USE be_studio;

-- =========================================
-- 1. users
-- =========================================
CREATE TABLE
    users (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_code VARCHAR(50) NOT NULL UNIQUE,
        user_role ENUM ('student', 'coach', 'admin', 'guest') NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        display_name VARCHAR(150) NULL,
        phone VARCHAR(30) NULL UNIQUE,
        email VARCHAR(150) NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        avatar_url VARCHAR(255) NULL,
        gender VARCHAR(20) NULL,
        date_of_birth DATE NULL,
        language_preference ENUM ('en', 'zh-CN') NOT NULL DEFAULT 'en',
        is_active TINYINT (1) NOT NULL DEFAULT 1,
        last_login_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
    );

-- =========================================
-- 2. guest_profiles
-- walk-in / guest detail records
-- =========================================
CREATE TABLE
    guest_profiles (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL UNIQUE,
        guest_name VARCHAR(150) NOT NULL,
        guest_phone VARCHAR(30) NULL,
        notes TEXT NULL,
        created_by_admin_id BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_guest_profiles_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_guest_profiles_admin FOREIGN KEY (created_by_admin_id) REFERENCES users (id)
    );

-- =========================================
-- 3. coaches
-- extra coach-related info
-- =========================================
CREATE TABLE
    coach_profiles (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL UNIQUE,
        bio TEXT NULL,
        emergency_contact_name VARCHAR(150) NULL,
        emergency_contact_phone VARCHAR(30) NULL,
        hire_date DATE NULL,
        is_available TINYINT (1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_coach_profiles_user FOREIGN KEY (user_id) REFERENCES users (id)
    );

-- =========================================
-- 4. studio_locations
-- =========================================
CREATE TABLE
    studio_locations (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(150) NOT NULL,
        address_line1 VARCHAR(255) NULL,
        address_line2 VARCHAR(255) NULL,
        city VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        postcode VARCHAR(20) NULL,
        country VARCHAR(100) NULL,
        capacity INT NULL,
        notes TEXT NULL,
        is_active TINYINT (1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- =========================================
-- 5. membership_plans
-- define plan rules
-- =========================================
CREATE TABLE
    membership_plans (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        plan_name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        validity_days INT NOT NULL,
        default_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        is_active TINYINT (1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- =========================================
-- 6. member_cards
-- member card / balance wallet
-- =========================================
CREATE TABLE
    member_cards (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        card_code VARCHAR(50) NOT NULL UNIQUE,
        user_id BIGINT UNSIGNED NOT NULL,
        membership_plan_id BIGINT UNSIGNED NULL,
        status ENUM ('active', 'inactive', 'expired', 'cancelled') NOT NULL DEFAULT 'inactive',
        is_primary TINYINT (1) NOT NULL DEFAULT 0,
        valid_from DATETIME NULL,
        valid_until DATETIME NULL,
        balance_expiry_at DATETIME NULL,
        current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        frozen_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        expired_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        point_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        activated_at DATETIME NULL,
        deactivated_at DATETIME NULL,
        remarks TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_member_cards_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_member_cards_plan FOREIGN KEY (membership_plan_id) REFERENCES membership_plans (id),
        INDEX idx_member_cards_user (user_id),
        INDEX idx_member_cards_status (status),
        INDEX idx_member_cards_valid_until (valid_until)
    );

-- =========================================
-- 7. courses
-- course master
-- =========================================
CREATE TABLE
    courses (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(50) NOT NULL UNIQUE,
        title_en VARCHAR(150) NOT NULL,
        title_zh_cn VARCHAR(150) NULL,
        short_description_en VARCHAR(255) NULL,
        short_description_zh_cn VARCHAR(255) NULL,
        description_en TEXT NULL,
        description_zh_cn TEXT NULL,
        banner_url VARCHAR(255) NULL,
        thumbnail_url VARCHAR(255) NULL,
        duration_minutes INT NOT NULL,
        min_booking_count INT NOT NULL DEFAULT 1,
        max_capacity INT NOT NULL DEFAULT 1,
        member_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        non_member_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        default_location_id BIGINT UNSIGNED NULL,
        default_coach_id BIGINT UNSIGNED NULL,
        is_active TINYINT (1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_courses_location FOREIGN KEY (default_location_id) REFERENCES studio_locations (id),
        CONSTRAINT fk_courses_coach FOREIGN KEY (default_coach_id) REFERENCES users (id)
    );

-- =========================================
-- 8. course_sessions
-- actual scheduled class
-- =========================================
CREATE TABLE
    course_sessions (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        session_code VARCHAR(50) NOT NULL UNIQUE,
        course_id BIGINT UNSIGNED NOT NULL,
        coach_id BIGINT UNSIGNED NULL,
        location_id BIGINT UNSIGNED NULL,
        session_date DATE NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        min_booking_count INT NOT NULL,
        max_capacity INT NOT NULL,
        member_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        non_member_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        status ENUM ('scheduled', 'started', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
        started_at DATETIME NULL,
        completed_at DATETIME NULL,
        cancelled_at DATETIME NULL,
        total_booked_head_count INT NOT NULL DEFAULT 0,
        notes TEXT NULL,
        created_by BIGINT UNSIGNED NULL,
        updated_by BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_course_sessions_course FOREIGN KEY (course_id) REFERENCES courses (id),
        CONSTRAINT fk_course_sessions_coach FOREIGN KEY (coach_id) REFERENCES users (id),
        CONSTRAINT fk_course_sessions_location FOREIGN KEY (location_id) REFERENCES studio_locations (id),
        CONSTRAINT fk_course_sessions_created_by FOREIGN KEY (created_by) REFERENCES users (id),
        CONSTRAINT fk_course_sessions_updated_by FOREIGN KEY (updated_by) REFERENCES users (id),
        INDEX idx_course_sessions_date (session_date),
        INDEX idx_course_sessions_status (status),
        INDEX idx_course_sessions_course (course_id),
        INDEX idx_course_sessions_coach (coach_id)
    );

-- =========================================
-- 9. bookings
-- booking record
-- =========================================
CREATE TABLE
    bookings (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        booking_code VARCHAR(50) NOT NULL UNIQUE,
        session_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        member_card_id BIGINT UNSIGNED NULL,
        booking_source ENUM ('member_portal', 'admin_manual', 'walk_in') NOT NULL DEFAULT 'member_portal',
        participant_type ENUM ('member', 'guest', 'non_member') NOT NULL DEFAULT 'member',
        head_count INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        pricing_type ENUM ('member_price', 'non_member_price') NOT NULL DEFAULT 'member_price',
        frozen_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        charged_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        refunded_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        status ENUM ('booked', 'paid', 'cancelled', 'completed') NOT NULL DEFAULT 'booked',
        booked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME NULL,
        cancelled_at DATETIME NULL,
        completed_at DATETIME NULL,
        cancelled_by BIGINT UNSIGNED NULL,
        cancel_reason VARCHAR(255) NULL,
        admin_remark TEXT NULL,
        created_by BIGINT UNSIGNED NULL,
        updated_by BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_bookings_session FOREIGN KEY (session_id) REFERENCES course_sessions (id),
        CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_bookings_member_card FOREIGN KEY (member_card_id) REFERENCES member_cards (id),
        CONSTRAINT fk_bookings_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES users (id),
        CONSTRAINT fk_bookings_created_by FOREIGN KEY (created_by) REFERENCES users (id),
        CONSTRAINT fk_bookings_updated_by FOREIGN KEY (updated_by) REFERENCES users (id),
        INDEX idx_bookings_session (session_id),
        INDEX idx_bookings_user (user_id),
        INDEX idx_bookings_status (status),
        INDEX idx_bookings_booked_at (booked_at)
    );

-- =========================================
-- 10. booking_participants
-- optional detail for multi-headcount booking
-- =========================================
CREATE TABLE
    booking_participants (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        booking_id BIGINT UNSIGNED NOT NULL,
        participant_name VARCHAR(150) NOT NULL,
        participant_phone VARCHAR(30) NULL,
        notes VARCHAR(255) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_booking_participants_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
        INDEX idx_booking_participants_booking (booking_id)
    );

-- =========================================
-- 11. transactions
-- all money movements
-- =========================================
CREATE TABLE
    transactions (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        transaction_code VARCHAR(50) NOT NULL UNIQUE,
        user_id BIGINT UNSIGNED NOT NULL,
        member_card_id BIGINT UNSIGNED NULL,
        booking_id BIGINT UNSIGNED NULL,
        session_id BIGINT UNSIGNED NULL,
        product_order_id BIGINT UNSIGNED NULL,
        transaction_type ENUM (
            'topup',
            'membership_activation',
            'booking_freeze',
            'booking_charge',
            'booking_refund',
            'product_purchase',
            'point_conversion_credit',
            'manual_adjustment',
            'expense',
            'income'
        ) NOT NULL,
        direction ENUM ('credit', 'debit') NOT NULL,
        amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        balance_before DECIMAL(12, 2) NULL,
        balance_after DECIMAL(12, 2) NULL,
        frozen_before DECIMAL(12, 2) NULL,
        frozen_after DECIMAL(12, 2) NULL,
        expired_before DECIMAL(12, 2) NULL,
        expired_after DECIMAL(12, 2) NULL,
        payment_method ENUM (
            'cash',
            'bank_transfer',
            'card',
            'ewallet',
            'internal',
            'other'
        ) NULL,
        reference_no VARCHAR(100) NULL,
        description VARCHAR(255) NULL,
        remark TEXT NULL,
        created_by BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_transactions_member_card FOREIGN KEY (member_card_id) REFERENCES member_cards (id),
        CONSTRAINT fk_transactions_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
        CONSTRAINT fk_transactions_session FOREIGN KEY (session_id) REFERENCES course_sessions (id),
        CONSTRAINT fk_transactions_created_by FOREIGN KEY (created_by) REFERENCES users (id),
        CONSTRAINT fk_transactions_product_order FOREIGN KEY (product_order_id) REFERENCES product_orders (id),
        INDEX idx_transactions_user (user_id),
        INDEX idx_transactions_type (transaction_type),
        INDEX idx_transactions_created_at (created_at),
        INDEX idx_transactions_booking (booking_id)
    );

-- =========================================
-- 12. invoices
-- =========================================
CREATE TABLE
    invoices (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        invoice_no VARCHAR(50) NOT NULL UNIQUE,
        user_id BIGINT UNSIGNED NOT NULL,
        transaction_id BIGINT UNSIGNED NULL,
        booking_id BIGINT UNSIGNED NULL,
        invoice_type ENUM ('invoice', 'receipt') NOT NULL DEFAULT 'invoice',
        subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        issued_by BIGINT UNSIGNED NULL,
        notes TEXT NULL,
        CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_invoices_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id),
        CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
        CONSTRAINT fk_invoices_issued_by FOREIGN KEY (issued_by) REFERENCES users (id),
        INDEX idx_invoices_user (user_id),
        INDEX idx_invoices_issued_at (issued_at)
    );

-- =========================================
-- 13. invoice_items
-- =========================================
CREATE TABLE
    invoice_items (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        invoice_id BIGINT UNSIGNED NOT NULL,
        item_name VARCHAR(150) NOT NULL,
        description VARCHAR(255) NULL,
        qty INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        line_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    );

-- =========================================
-- 14. login_audit_logs
-- optional for expiry check audit
-- =========================================
CREATE TABLE
    login_audit_logs (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        login_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        login_ip VARCHAR(45) NULL,
        expiry_check_executed TINYINT (1) NOT NULL DEFAULT 0,
        notes VARCHAR(255) NULL,
        CONSTRAINT fk_login_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id),
        INDEX idx_login_audit_logs_user (user_id),
        INDEX idx_login_audit_logs_login_at (login_at)
    );

-- =========================================
-- 15. products
-- =========================================
CREATE TABLE
    products (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        product_code VARCHAR(50) NOT NULL UNIQUE,
        name_en VARCHAR(150) NOT NULL,
        name_zh_cn VARCHAR(150) NULL,
        description_en VARCHAR(255) NULL,
        description_zh_cn VARCHAR(255) NULL,
        category VARCHAR(100) NULL,
        image_url VARCHAR(255) NULL,
        selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        cost_price DECIMAL(12, 2) NULL DEFAULT 0.00,
        stock_qty INT NOT NULL DEFAULT 0,
        is_active TINYINT (1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- =========================================
-- 16. product_orders & product_order_items
-- =========================================
CREATE TABLE
    product_orders (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        order_code VARCHAR(50) NOT NULL UNIQUE,
        user_id BIGINT UNSIGNED NOT NULL,
        member_card_id BIGINT UNSIGNED NULL,
        order_source ENUM ('admin_manual', 'walk_in') NOT NULL DEFAULT 'admin_manual',
        status ENUM ('completed', 'cancelled') NOT NULL DEFAULT 'completed',
        subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        payment_method ENUM (
            'balance',
            'cash',
            'bank_transfer',
            'card',
            'ewallet',
            'mixed',
            'other'
        ) NOT NULL DEFAULT 'balance',
        remark TEXT NULL,
        created_by BIGINT UNSIGNED NULL,
        cancelled_by BIGINT UNSIGNED NULL,
        cancelled_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_orders_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_product_orders_member_card FOREIGN KEY (member_card_id) REFERENCES member_cards (id),
        CONSTRAINT fk_product_orders_created_by FOREIGN KEY (created_by) REFERENCES users (id),
        CONSTRAINT fk_product_orders_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES users (id),
        INDEX idx_product_orders_user (user_id),
        INDEX idx_product_orders_created_at (created_at),
        INDEX idx_product_orders_status (status)
    );

-- ===========================================
-- 17. product_order_items
-- ===========================================
CREATE TABLE
    product_order_items (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        product_order_id BIGINT UNSIGNED NOT NULL,
        product_id BIGINT UNSIGNED NOT NULL,
        product_name_snapshot VARCHAR(150) NOT NULL,
        unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        qty INT NOT NULL DEFAULT 1,
        line_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_order_items_order FOREIGN KEY (product_order_id) REFERENCES product_orders (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_order_items_product FOREIGN KEY (product_id) REFERENCES products (id),
        INDEX idx_product_order_items_order (product_order_id),
        INDEX idx_product_order_items_product (product_id)
    );

-- =========================================
-- 18. point_ledgers
-- track point earning/redeeming/adjustment
-- =========================================
CREATE TABLE
    point_ledgers (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        point_txn_code VARCHAR(50) NOT NULL UNIQUE,
        user_id BIGINT UNSIGNED NOT NULL,
        member_card_id BIGINT UNSIGNED NULL,
        booking_id BIGINT UNSIGNED NULL,
        transaction_id BIGINT UNSIGNED NULL,
        point_type ENUM ('earn', 'redeem', 'adjust') NOT NULL,
        point_source ENUM (
            'course_spending',
            'admin_conversion',
            'manual_adjustment'
        ) NOT NULL,
        points DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        balance_before DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        balance_after DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        remark VARCHAR(255) NULL,
        created_by BIGINT UNSIGNED NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_point_ledgers_user FOREIGN KEY (user_id) REFERENCES users (id),
        CONSTRAINT fk_point_ledgers_member_card FOREIGN KEY (member_card_id) REFERENCES member_cards (id),
        CONSTRAINT fk_point_ledgers_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
        CONSTRAINT fk_point_ledgers_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id),
        CONSTRAINT fk_point_ledgers_created_by FOREIGN KEY (created_by) REFERENCES users (id),
        INDEX idx_point_ledgers_user (user_id),
        INDEX idx_point_ledgers_created_at (created_at),
        INDEX idx_point_ledgers_type (point_type)
    );