CREATE TABLE `admin_list` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`user_id` INT(11) NULL DEFAULT NULL,
	`phone` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`level` TINYINT(4) NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `fk_admin_user` (`user_id`) USING BTREE,
	CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `user_list` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2
;

CREATE TABLE `card_types` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`allow_multi_booking` TINYINT(1) NULL DEFAULT '0',
	`expiry_affect_balance` TINYINT(1) NULL DEFAULT '0',
	`price` DECIMAL(10,2) NULL DEFAULT '0.00',
	`created_at` DATETIME NULL DEFAULT current_timestamp(),
	`updated_at` DATETIME NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3
;

CREATE TABLE `coach_list` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`user_id` INT(11) NULL DEFAULT NULL,
	`phone` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`birthday` DATE NULL DEFAULT NULL,
	`profile_pic` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`join_date` DATE NULL DEFAULT curdate(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `fk_coach_user` (`user_id`) USING BTREE,
	CONSTRAINT `fk_coach_user` FOREIGN KEY (`user_id`) REFERENCES `user_list` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=11
;

CREATE TABLE `course_booking` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`student_id` INT(11) NOT NULL,
	`course_id` INT(11) NOT NULL,
	`booking_time` DATETIME NOT NULL DEFAULT current_timestamp(),
	`status` ENUM('booked','cancelled','paid','completed','absent') NULL DEFAULT 'booked' COLLATE 'utf8mb4_unicode_ci',
	`head_count` INT(11) NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `student_id` (`student_id`) USING BTREE,
	INDEX `course_id` (`course_id`) USING BTREE,
	CONSTRAINT `course_booking_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_list` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
	CONSTRAINT `course_booking_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course_session` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
;

CREATE TABLE `course_session` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`price` DECIMAL(10,2) NULL DEFAULT '0.00',
	`price_m` DECIMAL(10,2) NULL DEFAULT '0.00',
	`min_book` INT(11) NULL DEFAULT NULL,
	`coach_id` INT(11) NULL DEFAULT NULL,
	`location` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`start_time` DATETIME NULL DEFAULT NULL,
	`duration` INT(11) NULL DEFAULT '0',
	`course_pic` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`state` TINYINT(4) NULL DEFAULT '0',
	`created_date` DATE NULL DEFAULT curdate(),
	`type_id` INT(11) NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_course_coach_id` (`coach_id`) USING BTREE,
	CONSTRAINT `fk_course_coach` FOREIGN KEY (`coach_id`) REFERENCES `coach_list` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
;

CREATE TABLE `course_type` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`price` DECIMAL(10,2) NULL DEFAULT '0.00',
	`price_m` DECIMAL(10,2) NULL DEFAULT '0.00',
	`rating` INT(11) NULL DEFAULT '1',
	`min_book` INT(11) NULL DEFAULT NULL,
	`coach_id` INT(11) NULL DEFAULT NULL,
	`location` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`duration` INT(11) NULL DEFAULT '0',
	`state` TINYINT(4) NULL DEFAULT '0',
	`course_pic` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`created_date` DATE NULL DEFAULT curdate(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_course_coach_id` (`coach_id`) USING BTREE,
	CONSTRAINT `course_type_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `coach_list` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
ROW_FORMAT=DYNAMIC
AUTO_INCREMENT=12
;

CREATE TABLE `student_list` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`user_id` INT(11) NULL DEFAULT NULL,
	`phone` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`name` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`point` DECIMAL(10,2) NULL DEFAULT '0.00',
	`birthday` DATE NULL DEFAULT NULL,
	`is_member` TINYINT(4) NULL DEFAULT '0',
	`join_date` DATE NULL DEFAULT curdate(),
	`profile_pic` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `fk_student_user` (`user_id`) USING BTREE,
	CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `user_list` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=122
;

CREATE TABLE `transaction_list` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`student_id` INT(11) NULL DEFAULT NULL,
	`type` VARCHAR(20) NOT NULL DEFAULT '0' COLLATE 'utf8mb4_unicode_ci',
	`payment` DECIMAL(10,2) NULL DEFAULT '0.00',
	`amount` DECIMAL(10,2) NULL DEFAULT '0.00',
	`point` DECIMAL(10,2) NULL DEFAULT '0.00',
	`head_count` INT(11) NULL DEFAULT NULL,
	`course_id` INT(11) NULL DEFAULT NULL,
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`time` TIMESTAMP NULL DEFAULT current_timestamp(),
	`state` TINYINT(4) NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
;

CREATE TABLE `user_cards` (
	`id` BIGINT(20) NOT NULL AUTO_INCREMENT,
	`student_id` INT(11) NULL DEFAULT NULL,
	`card_type_id` BIGINT(20) NOT NULL DEFAULT '1',
	`balance` DECIMAL(10,2) NULL DEFAULT '0.00',
	`frozen_balance` DECIMAL(10,2) NULL DEFAULT '0.00',
	`expired_balance` DECIMAL(10,2) NULL DEFAULT '0.00',
	`status` TINYINT(4) NULL DEFAULT '1',
	`valid_balance_to` DATE NULL DEFAULT NULL,
	`valid_from` DATE NULL DEFAULT NULL,
	`valid_to` DATE NULL DEFAULT NULL,
	`created_at` DATETIME NULL DEFAULT current_timestamp(),
	`updated_at` DATETIME NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `card_type_id` (`card_type_id`) USING BTREE,
	INDEX `fk_user_cards_student` (`student_id`) USING BTREE,
	CONSTRAINT `fk_user_cards_student` FOREIGN KEY (`student_id`) REFERENCES `student_list` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT `user_cards_ibfk_1` FOREIGN KEY (`card_type_id`) REFERENCES `card_types` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=115
;

CREATE TABLE `user_list` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`phone` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`password` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`role` VARCHAR(20) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`state` TINYINT(4) NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=133
;
