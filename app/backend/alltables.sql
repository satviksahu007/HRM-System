-- =====================================================
-- HR ERP DATABASE - MySQL Version
-- =====================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `hr_erp` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `hr_erp`;

-- =====================================================
-- TABLE: profile_header_all (Parent table)
-- =====================================================
DROP TABLE IF EXISTS `profile_header_all`;
CREATE TABLE `profile_header_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` varchar(255) DEFAULT NULL COMMENT 'Unique profile identifier (e.g., PHA-00001)',
  `status` int DEFAULT NULL COMMENT '0-inactive/1-active',
  `profile_name` text COMMENT 'Profile/Role name (Director, HR, Employee)',
  `form_ids` longtext COMMENT 'Comma separated form IDs accessible to this profile',
  `process_ids` longtext COMMENT 'Comma separated process IDs accessible to this profile',
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profile_id` (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: employee_header_all (Child table)
-- =====================================================
DROP TABLE IF EXISTS `employee_header_all`;
CREATE TABLE `employee_header_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'Unique employee identifier (e.g., EHA-00001)',
  `first_name` text COMMENT 'Employee first name',
  `middle_name` varchar(100) DEFAULT NULL COMMENT 'Employee middle name',
  `last_name` text COMMENT 'Employee last name',
  `marital_status` text COMMENT 'Marital status of employee',
  `gender` text COMMENT 'Employee gender',
  `gender_other` varchar(100) DEFAULT NULL COMMENT 'Other gender specification if applicable',
  `dob` date DEFAULT NULL COMMENT 'Date of birth',
  `mob_no` varchar(20) DEFAULT NULL COMMENT 'Mobile number',
  `email` varchar(255) DEFAULT NULL COMMENT 'Email address',
  `type` varchar(255) DEFAULT NULL COMMENT 'References profile_id from profile_header_all',
  `status` int DEFAULT NULL COMMENT '0-inactive/1-active',
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `valid_till` datetime DEFAULT NULL COMMENT 'Validity end date',
  `present_address_line1` varchar(255) DEFAULT NULL,
  `present_address_line2` varchar(255) DEFAULT NULL,
  `present_city` varchar(100) DEFAULT NULL,
  `present_state` varchar(100) DEFAULT NULL,
  `present_pincode` varchar(10) DEFAULT NULL,
  `present_country` varchar(100) DEFAULT 'India',
  `permanent_address_line1` varchar(255) DEFAULT NULL,
  `permanent_address_line2` varchar(255) DEFAULT NULL,
  `permanent_city` varchar(100) DEFAULT NULL,
  `permanent_state` varchar(100) DEFAULT NULL,
  `permanent_pincode` varchar(10) DEFAULT NULL,
  `permanent_country` varchar(100) DEFAULT 'India',
  `aadhar` varchar(12) DEFAULT NULL,
  `pan` varchar(10) DEFAULT NULL,
  `aadhar_image_path` varchar(500) DEFAULT NULL,
  `pan_image_path` varchar(500) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_account_number` varchar(30) DEFAULT NULL,
  `bank_ifsc` varchar(11) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `expertise` varchar(255) DEFAULT NULL,
  `photo_path` varchar(500) DEFAULT NULL,
  `spouse_name` varchar(100) DEFAULT NULL,
  `spouse_mob` varchar(15) DEFAULT NULL,
  `spouse_email` varchar(255) DEFAULT NULL,
  `tenth_school` varchar(255) DEFAULT NULL,
  `tenth_board` varchar(255) DEFAULT NULL,
  `tenth_year` varchar(4) DEFAULT NULL,
  `tenth_marks` varchar(10) DEFAULT NULL,
  `tenth_marksheet_path` varchar(500) DEFAULT NULL,
  `twelfth_school` varchar(255) DEFAULT NULL,
  `twelfth_board` varchar(255) DEFAULT NULL,
  `twelfth_year` varchar(4) DEFAULT NULL,
  `twelfth_marks` varchar(10) DEFAULT NULL,
  `twelfth_marksheet_path` varchar(500) DEFAULT NULL,
  `ug_college` varchar(255) DEFAULT NULL,
  `ug_degree` varchar(255) DEFAULT NULL,
  `ug_year` varchar(4) DEFAULT NULL,
  `ug_marks` varchar(10) DEFAULT NULL,
  `ug_degree_image_path` varchar(500) DEFAULT NULL,
  `pg_college` varchar(255) DEFAULT NULL,
  `pg_degree` varchar(255) DEFAULT NULL,
  `pg_year` varchar(4) DEFAULT NULL,
  `pg_marks` varchar(10) DEFAULT NULL,
  `pg_degree_image_path` varchar(500) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `father_mobile` varchar(15) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `mother_mobile` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `eha_id` (`eha_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mob_no` (`mob_no`),
  UNIQUE KEY `aadhar` (`aadhar`),
  UNIQUE KEY `pan` (`pan`),
  KEY `fk_employee_profile` (`type`),
  CONSTRAINT `fk_employee_profile` FOREIGN KEY (`type`) REFERENCES `profile_header_all` (`profile_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: team_header_all
-- =====================================================
DROP TABLE IF EXISTS `team_header_all`;
CREATE TABLE `team_header_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'Unique team identifier (e.g., THA-00001)',
  `team_name` text COMMENT 'Name of the team',
  `team_members` varchar(1000) DEFAULT NULL COMMENT 'JSON array of employee IDs (eha_id)',
  `team_leader` varchar(255) DEFAULT NULL COMMENT 'JSON array of team leader IDs (eha_id)',
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` int DEFAULT NULL COMMENT '0-inactive/1-active',
  `valid_till` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tha_id` (`tha_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: team_emp_combination_all
-- =====================================================
DROP TABLE IF EXISTS `team_emp_combination_all`;
CREATE TABLE `team_emp_combination_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tec_id` varchar(255) DEFAULT NULL COMMENT 'Unique combination identifier',
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'References tha_id from team_header_all',
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'References eha_id from employee_header_all',
  `linked_on` datetime DEFAULT NULL COMMENT 'When employee was added to team',
  `unlinked_on` datetime DEFAULT NULL COMMENT 'When employee was removed from team',
  `link_type` int DEFAULT NULL COMMENT '1-member/2-leader',
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `valid_till` datetime DEFAULT NULL,
  `line_no` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tec_id` (`tec_id`),
  KEY `tec_tha_id` (`tha_id`),
  KEY `tec_eha_id` (`eha_id`),
  CONSTRAINT `fk_tec_tha_id` FOREIGN KEY (`tha_id`) REFERENCES `team_header_all` (`tha_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tec_eha_id` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: hr_general_settings_all
-- =====================================================
DROP TABLE IF EXISTS `hr_general_settings_all`;
CREATE TABLE `hr_general_settings_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hgs_id` varchar(255) DEFAULT NULL COMMENT 'Unique settings identifier',
  `daily_agenda` text COMMENT 'Time range for daily agenda (e.g., 09:45:00 - 10:15:00)',
  `daily_report` text COMMENT 'Time range for daily report (e.g., 18:15:00 - 18:45:00)',
  `submit_next_day` int DEFAULT NULL COMMENT 'Special approval: 0-No/1-Yes',
  `perform_submit` text COMMENT 'Date range for performance submit (e.g., 30 - 06)',
  `perform_verifcation` int DEFAULT NULL COMMENT 'Number of days for performance verification',
  PRIMARY KEY (`id`),
  UNIQUE KEY `hgs_id` (`hgs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: hr_qa_settings_all
-- =====================================================
DROP TABLE IF EXISTS `hr_qa_settings_all`;
CREATE TABLE `hr_qa_settings_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hqa_id` varchar(255) DEFAULT NULL COMMENT 'Unique question identifier',
  `question` text COMMENT 'Question text',
  `question_type` int DEFAULT NULL COMMENT '1-description/2-radio/3-selection',
  `length_of_desc` text COMMENT 'Max length for description answers',
  `radio_option` int DEFAULT NULL COMMENT 'For radio type: 0-no/1-yes/2-maybe',
  `selection_option` text COMMENT 'For selection type: comma separated options',
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `entered_by` int DEFAULT NULL COMMENT '2-hr/3-member/4-leader',
  `valid_from` datetime DEFAULT NULL,
  `valid_till` datetime DEFAULT NULL,
  `inserted_by` varchar(255) DEFAULT NULL,
  `viewable_by` int DEFAULT NULL COMMENT '2-hr/3-leader/4-director',
  PRIMARY KEY (`id`),
  UNIQUE KEY `hqa_id` (`hqa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: monthly_questions_details_all
-- =====================================================
DROP TABLE IF EXISTS `monthly_questions_details_all`;
CREATE TABLE `monthly_questions_details_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mqd_id` varchar(255) DEFAULT NULL COMMENT 'Unique monthly questions identifier',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year (e.g., 01-25 for January 2025)',
  `hqa_1` longtext COMMENT 'References hqa_id from hr_qa_settings_all - Question 1',
  `hqa_2` longtext,
  `hqa_3` longtext,
  `hqa_4` longtext,
  `hqa_5` longtext,
  `hqa_6` longtext,
  `hqa_7` longtext,
  `hqa_8` longtext,
  `hqa_9` longtext,
  `hqa_10` longtext,
  `hqa_11` longtext,
  `hqa_12` longtext,
  `hqa_13` longtext,
  `hqa_14` longtext,
  `hqa_15` longtext,
  `hqa_16` longtext,
  `hqa_17` longtext,
  `hqa_18` longtext,
  `hqa_19` longtext,
  `hqa_20` longtext,
  `hqa_21` longtext,
  `hqa_22` longtext,
  `hqa_23` longtext,
  `hqa_24` longtext,
  `hqa_25` longtext,
  `hqa_26` longtext,
  `hqa_27` longtext,
  `hqa_28` longtext,
  `hqa_29` longtext,
  `hqa_30` longtext,
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mqd_id` (`mqd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: performance_qa_details_all
-- =====================================================
DROP TABLE IF EXISTS `performance_qa_details_all`;
CREATE TABLE `performance_qa_details_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pqd_id` varchar(255) DEFAULT NULL COMMENT 'Unique performance QA identifier',
  `mqd_id` varchar(255) DEFAULT NULL COMMENT 'References mqd_id from monthly_questions_details_all',
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'References eha_id from employee_header_all',
  `mm_yy` varchar(45) DEFAULT NULL COMMENT 'Month-Year of performance',
  `hqa_1` longtext COMMENT 'Question 1 from hr_qa_settings_all',
  `ans_1` longtext COMMENT 'Employee answer to question 1',
  `hqa_2` longtext,
  `ans_2` longtext,
  `hqa_3` longtext,
  `ans_3` longtext,
  `hqa_4` longtext,
  `ans_4` longtext,
  `hqa_5` longtext,
  `ans_5` longtext,
  `hqa_6` longtext,
  `ans_6` longtext,
  `hqa_7` longtext,
  `ans_7` longtext,
  `hqa_8` longtext,
  `ans_8` longtext,
  `hqa_9` longtext,
  `ans_9` longtext,
  `hqa_10` longtext,
  `ans_10` longtext,
  `hqa_11` longtext,
  `ans_11` longtext,
  `hqa_12` longtext,
  `ans_12` longtext,
  `hqa_13` longtext,
  `ans_13` longtext,
  `hqa_14` longtext,
  `ans_14` longtext,
  `hqa_15` longtext,
  `ans_15` longtext,
  `hqa_16` longtext,
  `ans_16` longtext,
  `hqa_17` longtext,
  `ans_17` longtext,
  `hqa_18` longtext,
  `ans_18` longtext,
  `hqa_19` longtext,
  `ans_19` longtext,
  `hqa_20` longtext,
  `ans_20` longtext,
  `hqa_21` longtext,
  `ans_21` longtext,
  `hqa_22` longtext,
  `ans_22` longtext,
  `hqa_23` longtext,
  `ans_23` longtext,
  `hqa_24` longtext,
  `ans_24` longtext,
  `hqa_25` longtext,
  `ans_25` longtext,
  `hqa_26` longtext,
  `ans_26` longtext,
  `hqa_27` longtext,
  `ans_27` longtext,
  `hqa_28` longtext,
  `ans_28` longtext,
  `hqa_29` longtext,
  `ans_29` longtext,
  `hqa_30` longtext,
  `ans_30` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pqd_id` (`pqd_id`),
  KEY `fk_pqa_mqd_id` (`mqd_id`),
  KEY `fk_pqa_eha_id` (`eha_id`),
  CONSTRAINT `fk_pqa_mqd_id` FOREIGN KEY (`mqd_id`) REFERENCES `monthly_questions_details_all` (`mqd_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pqa_eha_id` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: performance_points_details_all
-- =====================================================
DROP TABLE IF EXISTS `performance_points_details_all`;
CREATE TABLE `performance_points_details_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ppd_id` varchar(255) DEFAULT NULL COMMENT 'Unique performance points identifier',
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'References eha_id from employee_header_all',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year of performance',
  `point_1` text COMMENT 'Performance point 1',
  `resp_1` text COMMENT 'Response as JSON: {"L": "EHA-xxxxx", "response": "response text"}',
  `point_2` text,
  `resp_2` text,
  `point_3` text,
  `resp_3` text,
  `point_4` text,
  `resp_4` text,
  `point_5` text,
  `resp_5` text,
  `point_6` text,
  `resp_6` text,
  `point_7` text,
  `resp_7` text,
  `point_8` text,
  `resp_8` text,
  `point_9` text,
  `resp_9` text,
  `point_10` text,
  `resp_10` text,
  `point_11` text,
  `resp_11` text,
  `point_12` text,
  `resp_12` text,
  `point_13` text,
  `resp_13` text,
  `point_14` text,
  `resp_14` text,
  `point_15` text,
  `resp_15` text,
  `point_16` text,
  `resp_16` text,
  `point_17` text,
  `resp_17` text,
  `point_18` text,
  `resp_18` text,
  `point_19` text,
  `resp_19` text,
  `point_20` text,
  `resp_20` text,
  `point_21` text,
  `resp_21` text,
  `point_22` text,
  `resp_22` text,
  `point_23` text,
  `resp_23` text,
  `point_24` text,
  `resp_24` text,
  `point_25` text,
  `resp_25` text,
  `point_26` text,
  `resp_26` text,
  `point_27` text,
  `resp_27` text,
  `point_28` text,
  `resp_28` text,
  `point_29` text,
  `resp_29` text,
  `point_30` text,
  `resp_30` text,
  `line_no` int DEFAULT NULL,
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ppd_id` (`ppd_id`),
  KEY `fk_ppd_eha_id` (`eha_id`),
  CONSTRAINT `fk_ppd_eha_id` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: member_daily_agenda_details_all
-- =====================================================
DROP TABLE IF EXISTS `member_daily_agenda_details_all`;
CREATE TABLE `member_daily_agenda_details_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mda_id` varchar(255) DEFAULT NULL COMMENT 'Unique member daily agenda identifier',
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'References tha_id from team_header_all',
  `tec_id` varchar(255) DEFAULT NULL COMMENT 'References tec_id from team_emp_combination_all',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year',
  `day_1` longtext COMMENT 'JSON: {"in_time": timestamp, "wa_id": "WAI-00001", "text": "agenda text"}',
  `day_2` longtext,
  `day_3` longtext,
  `day_4` longtext,
  `day_5` longtext,
  `day_6` longtext,
  `day_7` longtext,
  `day_8` longtext,
  `day_9` longtext,
  `day_10` longtext,
  `day_11` longtext,
  `day_12` longtext,
  `day_13` longtext,
  `day_14` longtext,
  `day_15` longtext,
  `day_16` longtext,
  `day_17` longtext,
  `day_18` longtext,
  `day_19` longtext,
  `day_20` longtext,
  `day_21` longtext,
  `day_22` longtext,
  `day_23` longtext,
  `day_24` longtext,
  `day_25` longtext,
  `day_26` longtext,
  `day_27` longtext,
  `day_28` longtext,
  `day_29` longtext,
  `day_30` longtext,
  `day_31` longtext,
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mda_id` (`mda_id`),
  KEY `fk_mda_tha_id` (`tha_id`),
  KEY `fk_mda_tec_id` (`tec_id`),
  CONSTRAINT `fk_mda_tha_id` FOREIGN KEY (`tha_id`) REFERENCES `team_header_all` (`tha_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mda_tec_id` FOREIGN KEY (`tec_id`) REFERENCES `team_emp_combination_all` (`tec_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: member_daily_report_details_all
-- =====================================================
DROP TABLE IF EXISTS `member_daily_report_details_all`;
CREATE TABLE `member_daily_report_details_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mdr_id` varchar(255) DEFAULT NULL COMMENT 'Unique member daily report identifier',
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'References tha_id from team_header_all',
  `tec_id` varchar(255) DEFAULT NULL COMMENT 'References tec_id from team_emp_combination_all',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year',
  `day_1` longtext COMMENT 'JSON: {"out_time": timestamp, "wa_id": "WAI-00001", "text": "report text"}',
  `day_2` longtext,
  `day_3` longtext,
  `day_4` longtext,
  `day_5` longtext,
  `day_6` longtext,
  `day_7` longtext,
  `day_8` longtext,
  `day_9` longtext,
  `day_10` longtext,
  `day_11` longtext,
  `day_12` longtext,
  `day_13` longtext,
  `day_14` longtext,
  `day_15` longtext,
  `day_16` longtext,
  `day_17` longtext,
  `day_18` longtext,
  `day_19` longtext,
  `day_20` longtext,
  `day_21` longtext,
  `day_22` longtext,
  `day_23` longtext,
  `day_24` longtext,
  `day_25` longtext,
  `day_26` longtext,
  `day_27` longtext,
  `day_28` longtext,
  `day_29` longtext,
  `day_30` longtext,
  `day_31` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mdr_id` (`mdr_id`),
  KEY `fk_mdr_tha_id` (`tha_id`),
  KEY `fk_mdr_tec_id` (`tec_id`),
  CONSTRAINT `fk_mdr_tha_id` FOREIGN KEY (`tha_id`) REFERENCES `team_header_all` (`tha_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_mdr_tec_id` FOREIGN KEY (`tec_id`) REFERENCES `team_emp_combination_all` (`tec_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLE: unique_header_all
-- =====================================================
DROP TABLE IF EXISTS `unique_header_all`;
CREATE TABLE `unique_header_all` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_name` text COMMENT 'Name of the table this sequence belongs to',
  `prefix` text COMMENT 'Prefix for unique IDs (e.g., EHA, THA, PHA)',
  `last_id` varchar(255) DEFAULT NULL COMMENT 'Last generated ID value',
  `created_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- Insert sample data into profile_header_all
-- =====================================================
INSERT INTO `profile_header_all` (`profile_id`, `status`, `profile_name`) VALUES
('PHA-00001', 1, 'Director'),
('PHA-00002', 1, 'HR'),
('PHA-00003', 1, 'Employee');

-- =====================================================
-- Insert sample data into employee_header_all
-- =====================================================
INSERT INTO `employee_header_all` (`eha_id`, `first_name`, `last_name`, `marital_status`, `gender`, `dob`, `mob_no`, `email`, `type`, `status`) VALUES
('EHA-00001', 'Aditya', 'Dabade', 'Unmarried', 'Male', '1998-03-12', '9876543210', 'aditya@example.com', 'PHA-00001', 1),
('EHA-00002', 'Sakshi', 'Patil', 'Married', 'Female', '1996-08-22', '8765432109', 'sakshi@example.com', 'PHA-00002', 1),
('EHA-00003', 'Rahul', 'Sharma', 'Unmarried', 'Male', '1995-05-10', '9988776655', 'rahul.sharma@example.com', 'PHA-00003', 1),
('EHA-00004', 'Priya', 'Verma', 'Unmarried', 'Female', '1999-01-18', '9123456780', 'priya.verma@example.com', 'PHA-00003', 1);

-- =====================================================
-- Insert sample data into team_header_all
-- =====================================================
INSERT INTO `team_header_all` (`tha_id`, `team_name`, `team_members`, `team_leader`, `status`) VALUES
('THA-00001', 'MI 20', '["EHA-00001","EHA-00002","EHA-00003"]', '["EHA-00002"]', 1);

-- =====================================================
-- Insert sample data into unique_header_all
-- =====================================================
INSERT INTO `unique_header_all` (`table_name`, `prefix`, `last_id`) VALUES
('employee_header_all', 'EHA', NULL);

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


-- =====================================================
-- TABLE: user_login
-- =====================================================
DROP TABLE IF EXISTS `user_login`;
CREATE TABLE `user_login` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `ul_id` varchar(255) DEFAULT NULL COMMENT 'Unique user login identifier (e.g., UL-00001)',
  `eha_id` varchar(255) NOT NULL COMMENT 'References eha_id from employee_header_all',
  `password` varchar(255) NOT NULL COMMENT 'User password (should be hashed in production)',
  `role` varchar(50) DEFAULT NULL COMMENT 'User role: director, hr, employee, leader',
  `is_first_login` tinyint DEFAULT 1 COMMENT '0-no/1-yes - Force password change on first login',
  `last_login` datetime DEFAULT NULL COMMENT 'Last login timestamp',
  `failed_attempts` int DEFAULT 0 COMMENT 'Number of failed login attempts',
  `is_locked` tinyint DEFAULT 0 COMMENT '0-not locked/1-locked - Account lock status',
  `password_changed_on` datetime DEFAULT NULL COMMENT 'Last password change timestamp',
  `reset_token` varchar(255) DEFAULT NULL COMMENT 'Password reset token',
  `reset_token_expiry` datetime DEFAULT NULL COMMENT 'Reset token expiry timestamp',
  `status` int DEFAULT 1 COMMENT '0-inactive/1-active',
  `inserted_on` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ul_id` (`ul_id`),
  UNIQUE KEY `eha_id` (`eha_id`),
  KEY `fk_user_login_eha` (`eha_id`),
  CONSTRAINT `fk_user_login_eha` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User login credentials and authentication table';

-- =====================================================
-- Insert sample data for existing employees
-- Note: Use actual hashed passwords in production
-- For testing with the Flask route (which uses SHA-256), 
-- these are SHA-256 hashes of 'password123'
-- =====================================================
INSERT INTO `user_login` (`ul_id`, `eha_id`, `password`, `role`, `is_first_login`, `status`) VALUES
('UL-00001', 'EHA-00001', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'director', 0, 1),
('UL-00002', 'EHA-00002', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'hr', 0, 1),
('UL-00003', 'EHA-00003', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'employee', 0, 1),
('UL-00004', 'EHA-00004', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'employee', 1, 1);