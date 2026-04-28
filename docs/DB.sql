-- --------------------------------------------------------
-- Host:                         194.59.164.96
-- Server version:               11.8.6-MariaDB-log - MariaDB Server
-- Server OS:                    Linux
-- HeidiSQL Version:             12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for u839013241_bestudio_v2
CREATE DATABASE IF NOT EXISTS `u839013241_bestudio_v2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `u839013241_bestudio_v2`;

-- Dumping structure for table u839013241_bestudio_v2.admin_list
CREATE TABLE IF NOT EXISTS `admin_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `level` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_admin_user` (`user_id`),
  CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `user_list` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.card_types
CREATE TABLE IF NOT EXISTS `card_types` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `allow_multi_booking` tinyint(1) DEFAULT 0,
  `expiry_affect_balance` tinyint(1) DEFAULT 0,
  `price` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.coach_list
CREATE TABLE IF NOT EXISTS `coach_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `join_date` date DEFAULT curdate(),
  PRIMARY KEY (`id`),
  KEY `fk_coach_user` (`user_id`),
  CONSTRAINT `fk_coach_user` FOREIGN KEY (`user_id`) REFERENCES `user_list` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.course_booking
CREATE TABLE IF NOT EXISTS `course_booking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `booking_time` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('booked','cancelled','paid','completed','absent') DEFAULT 'booked',
  `head_count` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `course_booking_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_list` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_booking_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course_session` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.course_session
CREATE TABLE IF NOT EXISTS `course_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `price_m` decimal(10,2) DEFAULT 0.00,
  `min_book` int(11) DEFAULT NULL,
  `coach_id` int(11) DEFAULT NULL,
  `location` varchar(20) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT 0,
  `course_pic` varchar(255) DEFAULT NULL,
  `state` tinyint(4) DEFAULT 0,
  `created_date` date DEFAULT curdate(),
  `type_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_course_coach_id` (`coach_id`),
  CONSTRAINT `fk_course_coach` FOREIGN KEY (`coach_id`) REFERENCES `coach_list` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=772 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.course_type
CREATE TABLE IF NOT EXISTS `course_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `price_m` decimal(10,2) DEFAULT 0.00,
  `rating` int(11) DEFAULT 1,
  `min_book` int(11) DEFAULT NULL,
  `coach_id` int(11) DEFAULT NULL,
  `location` varchar(20) DEFAULT NULL,
  `duration` int(11) DEFAULT 0,
  `state` tinyint(4) DEFAULT 0,
  `course_pic` varchar(255) DEFAULT NULL,
  `created_date` date DEFAULT curdate(),
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_course_coach_id` (`coach_id`) USING BTREE,
  CONSTRAINT `course_type_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `coach_list` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.student_list
CREATE TABLE IF NOT EXISTS `student_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `point` decimal(10,2) DEFAULT 0.00,
  `birthday` date DEFAULT NULL,
  `is_member` tinyint(4) DEFAULT 0,
  `join_date` date DEFAULT curdate(),
  `profile_pic` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_student_user` (`user_id`),
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `user_list` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.transaction_list
CREATE TABLE IF NOT EXISTS `transaction_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT '0',
  `payment` decimal(10,2) DEFAULT 0.00,
  `amount` decimal(10,2) DEFAULT 0.00,
  `point` decimal(10,2) DEFAULT 0.00,
  `head_count` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `time` timestamp NULL DEFAULT current_timestamp(),
  `state` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4542 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.user_cards
CREATE TABLE IF NOT EXISTS `user_cards` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `card_type_id` bigint(20) NOT NULL DEFAULT 1,
  `balance` decimal(10,2) DEFAULT 0.00,
  `frozen_balance` decimal(10,2) DEFAULT 0.00,
  `expired_balance` decimal(10,2) DEFAULT 0.00,
  `status` tinyint(4) DEFAULT 1,
  `valid_balance_to` date DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `card_type_id` (`card_type_id`),
  KEY `fk_user_cards_student` (`student_id`),
  CONSTRAINT `fk_user_cards_student` FOREIGN KEY (`student_id`) REFERENCES `student_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_cards_ibfk_1` FOREIGN KEY (`card_type_id`) REFERENCES `card_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table u839013241_bestudio_v2.user_list
CREATE TABLE IF NOT EXISTS `user_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `state` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
