-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2026 at 09:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hr_erp`
--

-- --------------------------------------------------------

--
-- Table structure for table `employee_header_all`
--

CREATE TABLE `employee_header_all` (
  `id` int(11) NOT NULL,
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'Unique employee identifier (e.g., EHA-00001)',
  `first_name` text DEFAULT NULL COMMENT 'Employee first name',
  `middle_name` varchar(100) DEFAULT NULL COMMENT 'Employee middle name',
  `last_name` text DEFAULT NULL COMMENT 'Employee last name',
  `marital_status` text DEFAULT NULL COMMENT 'Marital status of employee',
  `gender` text DEFAULT NULL COMMENT 'Employee gender',
  `gender_other` varchar(100) DEFAULT NULL COMMENT 'Other gender specification if applicable',
  `dob` date DEFAULT NULL COMMENT 'Date of birth',
  `mob_no` varchar(20) DEFAULT NULL COMMENT 'Mobile number',
  `email` varchar(255) DEFAULT NULL COMMENT 'Email address',
  `type` varchar(255) DEFAULT NULL COMMENT 'References profile_id from profile_header_all',
  `status` int(11) DEFAULT NULL COMMENT '0-inactive/1-active',
  `inserted_on` datetime DEFAULT current_timestamp(),
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
  `mother_mobile` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_header_all`
--

INSERT INTO `employee_header_all` (`id`, `eha_id`, `first_name`, `middle_name`, `last_name`, `marital_status`, `gender`, `gender_other`, `dob`, `mob_no`, `email`, `type`, `status`, `inserted_on`, `valid_till`, `present_address_line1`, `present_address_line2`, `present_city`, `present_state`, `present_pincode`, `present_country`, `permanent_address_line1`, `permanent_address_line2`, `permanent_city`, `permanent_state`, `permanent_pincode`, `permanent_country`, `aadhar`, `pan`, `aadhar_image_path`, `pan_image_path`, `bank_name`, `bank_account_number`, `bank_ifsc`, `salary`, `expertise`, `photo_path`, `spouse_name`, `spouse_mob`, `spouse_email`, `tenth_school`, `tenth_board`, `tenth_year`, `tenth_marks`, `tenth_marksheet_path`, `twelfth_school`, `twelfth_board`, `twelfth_year`, `twelfth_marks`, `twelfth_marksheet_path`, `ug_college`, `ug_degree`, `ug_year`, `ug_marks`, `ug_degree_image_path`, `pg_college`, `pg_degree`, `pg_year`, `pg_marks`, `pg_degree_image_path`, `father_name`, `father_mobile`, `mother_name`, `mother_mobile`) VALUES
(1, 'EHA-00001', 'Aditya', NULL, 'Dabade', 'Unmarried', 'Male', NULL, '1998-03-12', '9876543210', 'aditya@example.com', 'PHA-00001', 1, '2026-04-25 18:38:11', NULL, NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'EHA-00002', 'Sakshi', NULL, 'Patil', 'Married', 'Female', NULL, '1996-08-22', '8765432109', 'sakshi@example.com', 'PHA-00002', 1, '2026-04-25 18:38:11', NULL, NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'EHA-00003', 'Rahul', NULL, 'Sharma', 'Unmarried', 'Male', NULL, '1995-05-10', '9988776655', 'rahul.sharma@example.com', 'PHA-00003', 1, '2026-04-25 18:38:11', NULL, NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'EHA-00004', 'Priya', NULL, 'Verma', 'Unmarried', 'Female', NULL, '1999-01-18', '9123456780', 'priya.verma@example.com', 'PHA-00003', 1, '2026-04-25 18:38:11', NULL, NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, 'India', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'EHA-00006', 'Satvik', NULL, 'Sahu', 'single', 'male', NULL, '2000-10-16', '7828293892', 'dw@gmail.com', 'PHA-00003', 1, '2026-04-26 01:17:27', NULL, '', '', '', '', '', 'India', '', '', '', '', '', 'India', '234532541241', 'FASWE2141F', 'uploads/documents\\aadhar_20260426011727_Registration_for_AntBox_Internship_Cum_PPO_Recruitment_Drive_for_2027_Graduating_Batch.pdf', 'uploads/documents\\pan_20260426011727_Satvik_Sahu_Resume.pdf', 'ADGASGFASFASFASFA', '55325235252525', 'GDGE0AASG12', 1000000.00, 'Full Stack Web Dev', 'uploads/documents\\photo_20260426011727_WhatsApp_Image_2026-04-16_at_23.40.16.jpeg', 'wdawdaw', '8214124141', NULL, 'wada', 'gwagaw', '2000', '33', 'uploads/documents\\tenth_20260426011727_Screenshot_2026-03-27_133936.png', 'aegaga', 'fasgaag', '2023', '23', 'uploads/documents\\twelfth_20260426011727_Screenshot_2026-03-27_130404.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dwadad', '9241241251', 'waggs', '8281421941');

-- --------------------------------------------------------

--
-- Table structure for table `hr_general_settings_all`
--

CREATE TABLE `hr_general_settings_all` (
  `id` int(11) NOT NULL,
  `hgs_id` varchar(255) DEFAULT NULL COMMENT 'Unique settings identifier',
  `daily_agenda` text DEFAULT NULL COMMENT 'Time range for daily agenda (e.g., 09:45:00 - 10:15:00)',
  `daily_report` text DEFAULT NULL COMMENT 'Time range for daily report (e.g., 18:15:00 - 18:45:00)',
  `submit_next_day` int(11) DEFAULT NULL COMMENT 'Special approval: 0-No/1-Yes',
  `perform_submit` text DEFAULT NULL COMMENT 'Date range for performance submit (e.g., 30 - 06)',
  `perform_verifcation` int(11) DEFAULT NULL COMMENT 'Number of days for performance verification'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hr_qa_settings_all`
--

CREATE TABLE `hr_qa_settings_all` (
  `id` int(11) NOT NULL,
  `hqa_id` varchar(255) DEFAULT NULL COMMENT 'Unique question identifier',
  `question` text DEFAULT NULL COMMENT 'Question text',
  `question_type` int(11) DEFAULT NULL COMMENT '1-description/2-radio/3-selection',
  `length_of_desc` text DEFAULT NULL COMMENT 'Max length for description answers',
  `radio_option` int(11) DEFAULT NULL COMMENT 'For radio type: 0-no/1-yes/2-maybe',
  `selection_option` text DEFAULT NULL COMMENT 'For selection type: comma separated options',
  `inserted_on` datetime DEFAULT current_timestamp(),
  `entered_by` int(11) DEFAULT NULL COMMENT '2-hr/3-member/4-leader',
  `valid_from` datetime DEFAULT NULL,
  `valid_till` datetime DEFAULT NULL,
  `inserted_by` varchar(255) DEFAULT NULL,
  `viewable_by` int(11) DEFAULT NULL COMMENT '2-hr/3-leader/4-director'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_daily_agenda_details_all`
--

CREATE TABLE `member_daily_agenda_details_all` (
  `id` int(11) NOT NULL,
  `mda_id` varchar(255) DEFAULT NULL COMMENT 'Unique member daily agenda identifier',
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'References tha_id from team_header_all',
  `tec_id` varchar(255) DEFAULT NULL COMMENT 'References tec_id from team_emp_combination_all',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year',
  `day_1` longtext DEFAULT NULL COMMENT 'JSON: {"in_time": timestamp, "wa_id": "WAI-00001", "text": "agenda text"}',
  `day_2` longtext DEFAULT NULL,
  `day_3` longtext DEFAULT NULL,
  `day_4` longtext DEFAULT NULL,
  `day_5` longtext DEFAULT NULL,
  `day_6` longtext DEFAULT NULL,
  `day_7` longtext DEFAULT NULL,
  `day_8` longtext DEFAULT NULL,
  `day_9` longtext DEFAULT NULL,
  `day_10` longtext DEFAULT NULL,
  `day_11` longtext DEFAULT NULL,
  `day_12` longtext DEFAULT NULL,
  `day_13` longtext DEFAULT NULL,
  `day_14` longtext DEFAULT NULL,
  `day_15` longtext DEFAULT NULL,
  `day_16` longtext DEFAULT NULL,
  `day_17` longtext DEFAULT NULL,
  `day_18` longtext DEFAULT NULL,
  `day_19` longtext DEFAULT NULL,
  `day_20` longtext DEFAULT NULL,
  `day_21` longtext DEFAULT NULL,
  `day_22` longtext DEFAULT NULL,
  `day_23` longtext DEFAULT NULL,
  `day_24` longtext DEFAULT NULL,
  `day_25` longtext DEFAULT NULL,
  `day_26` longtext DEFAULT NULL,
  `day_27` longtext DEFAULT NULL,
  `day_28` longtext DEFAULT NULL,
  `day_29` longtext DEFAULT NULL,
  `day_30` longtext DEFAULT NULL,
  `day_31` longtext DEFAULT NULL,
  `inserted_on` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_daily_report_details_all`
--

CREATE TABLE `member_daily_report_details_all` (
  `id` int(11) NOT NULL,
  `mdr_id` varchar(255) DEFAULT NULL COMMENT 'Unique member daily report identifier',
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'References tha_id from team_header_all',
  `tec_id` varchar(255) DEFAULT NULL COMMENT 'References tec_id from team_emp_combination_all',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year',
  `day_1` longtext DEFAULT NULL COMMENT 'JSON: {"out_time": timestamp, "wa_id": "WAI-00001", "text": "report text"}',
  `day_2` longtext DEFAULT NULL,
  `day_3` longtext DEFAULT NULL,
  `day_4` longtext DEFAULT NULL,
  `day_5` longtext DEFAULT NULL,
  `day_6` longtext DEFAULT NULL,
  `day_7` longtext DEFAULT NULL,
  `day_8` longtext DEFAULT NULL,
  `day_9` longtext DEFAULT NULL,
  `day_10` longtext DEFAULT NULL,
  `day_11` longtext DEFAULT NULL,
  `day_12` longtext DEFAULT NULL,
  `day_13` longtext DEFAULT NULL,
  `day_14` longtext DEFAULT NULL,
  `day_15` longtext DEFAULT NULL,
  `day_16` longtext DEFAULT NULL,
  `day_17` longtext DEFAULT NULL,
  `day_18` longtext DEFAULT NULL,
  `day_19` longtext DEFAULT NULL,
  `day_20` longtext DEFAULT NULL,
  `day_21` longtext DEFAULT NULL,
  `day_22` longtext DEFAULT NULL,
  `day_23` longtext DEFAULT NULL,
  `day_24` longtext DEFAULT NULL,
  `day_25` longtext DEFAULT NULL,
  `day_26` longtext DEFAULT NULL,
  `day_27` longtext DEFAULT NULL,
  `day_28` longtext DEFAULT NULL,
  `day_29` longtext DEFAULT NULL,
  `day_30` longtext DEFAULT NULL,
  `day_31` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `monthly_questions_details_all`
--

CREATE TABLE `monthly_questions_details_all` (
  `id` int(11) NOT NULL,
  `mqd_id` varchar(255) DEFAULT NULL COMMENT 'Unique monthly questions identifier',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year (e.g., 01-25 for January 2025)',
  `hqa_1` longtext DEFAULT NULL COMMENT 'References hqa_id from hr_qa_settings_all - Question 1',
  `hqa_2` longtext DEFAULT NULL,
  `hqa_3` longtext DEFAULT NULL,
  `hqa_4` longtext DEFAULT NULL,
  `hqa_5` longtext DEFAULT NULL,
  `hqa_6` longtext DEFAULT NULL,
  `hqa_7` longtext DEFAULT NULL,
  `hqa_8` longtext DEFAULT NULL,
  `hqa_9` longtext DEFAULT NULL,
  `hqa_10` longtext DEFAULT NULL,
  `hqa_11` longtext DEFAULT NULL,
  `hqa_12` longtext DEFAULT NULL,
  `hqa_13` longtext DEFAULT NULL,
  `hqa_14` longtext DEFAULT NULL,
  `hqa_15` longtext DEFAULT NULL,
  `hqa_16` longtext DEFAULT NULL,
  `hqa_17` longtext DEFAULT NULL,
  `hqa_18` longtext DEFAULT NULL,
  `hqa_19` longtext DEFAULT NULL,
  `hqa_20` longtext DEFAULT NULL,
  `hqa_21` longtext DEFAULT NULL,
  `hqa_22` longtext DEFAULT NULL,
  `hqa_23` longtext DEFAULT NULL,
  `hqa_24` longtext DEFAULT NULL,
  `hqa_25` longtext DEFAULT NULL,
  `hqa_26` longtext DEFAULT NULL,
  `hqa_27` longtext DEFAULT NULL,
  `hqa_28` longtext DEFAULT NULL,
  `hqa_29` longtext DEFAULT NULL,
  `hqa_30` longtext DEFAULT NULL,
  `inserted_on` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance_points_details_all`
--

CREATE TABLE `performance_points_details_all` (
  `id` int(11) NOT NULL,
  `ppd_id` varchar(255) DEFAULT NULL COMMENT 'Unique performance points identifier',
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'References eha_id from employee_header_all',
  `mm_yy` varchar(10) DEFAULT NULL COMMENT 'Month-Year of performance',
  `point_1` text DEFAULT NULL COMMENT 'Performance point 1',
  `resp_1` text DEFAULT NULL COMMENT 'Response as JSON: {"L": "EHA-xxxxx", "response": "response text"}',
  `point_2` text DEFAULT NULL,
  `resp_2` text DEFAULT NULL,
  `point_3` text DEFAULT NULL,
  `resp_3` text DEFAULT NULL,
  `point_4` text DEFAULT NULL,
  `resp_4` text DEFAULT NULL,
  `point_5` text DEFAULT NULL,
  `resp_5` text DEFAULT NULL,
  `point_6` text DEFAULT NULL,
  `resp_6` text DEFAULT NULL,
  `point_7` text DEFAULT NULL,
  `resp_7` text DEFAULT NULL,
  `point_8` text DEFAULT NULL,
  `resp_8` text DEFAULT NULL,
  `point_9` text DEFAULT NULL,
  `resp_9` text DEFAULT NULL,
  `point_10` text DEFAULT NULL,
  `resp_10` text DEFAULT NULL,
  `point_11` text DEFAULT NULL,
  `resp_11` text DEFAULT NULL,
  `point_12` text DEFAULT NULL,
  `resp_12` text DEFAULT NULL,
  `point_13` text DEFAULT NULL,
  `resp_13` text DEFAULT NULL,
  `point_14` text DEFAULT NULL,
  `resp_14` text DEFAULT NULL,
  `point_15` text DEFAULT NULL,
  `resp_15` text DEFAULT NULL,
  `point_16` text DEFAULT NULL,
  `resp_16` text DEFAULT NULL,
  `point_17` text DEFAULT NULL,
  `resp_17` text DEFAULT NULL,
  `point_18` text DEFAULT NULL,
  `resp_18` text DEFAULT NULL,
  `point_19` text DEFAULT NULL,
  `resp_19` text DEFAULT NULL,
  `point_20` text DEFAULT NULL,
  `resp_20` text DEFAULT NULL,
  `point_21` text DEFAULT NULL,
  `resp_21` text DEFAULT NULL,
  `point_22` text DEFAULT NULL,
  `resp_22` text DEFAULT NULL,
  `point_23` text DEFAULT NULL,
  `resp_23` text DEFAULT NULL,
  `point_24` text DEFAULT NULL,
  `resp_24` text DEFAULT NULL,
  `point_25` text DEFAULT NULL,
  `resp_25` text DEFAULT NULL,
  `point_26` text DEFAULT NULL,
  `resp_26` text DEFAULT NULL,
  `point_27` text DEFAULT NULL,
  `resp_27` text DEFAULT NULL,
  `point_28` text DEFAULT NULL,
  `resp_28` text DEFAULT NULL,
  `point_29` text DEFAULT NULL,
  `resp_29` text DEFAULT NULL,
  `point_30` text DEFAULT NULL,
  `resp_30` text DEFAULT NULL,
  `line_no` int(11) DEFAULT NULL,
  `inserted_on` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance_qa_details_all`
--

CREATE TABLE `performance_qa_details_all` (
  `id` int(11) NOT NULL,
  `pqd_id` varchar(255) DEFAULT NULL COMMENT 'Unique performance QA identifier',
  `mqd_id` varchar(255) DEFAULT NULL COMMENT 'References mqd_id from monthly_questions_details_all',
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'References eha_id from employee_header_all',
  `mm_yy` varchar(45) DEFAULT NULL COMMENT 'Month-Year of performance',
  `hqa_1` longtext DEFAULT NULL COMMENT 'Question 1 from hr_qa_settings_all',
  `ans_1` longtext DEFAULT NULL COMMENT 'Employee answer to question 1',
  `hqa_2` longtext DEFAULT NULL,
  `ans_2` longtext DEFAULT NULL,
  `hqa_3` longtext DEFAULT NULL,
  `ans_3` longtext DEFAULT NULL,
  `hqa_4` longtext DEFAULT NULL,
  `ans_4` longtext DEFAULT NULL,
  `hqa_5` longtext DEFAULT NULL,
  `ans_5` longtext DEFAULT NULL,
  `hqa_6` longtext DEFAULT NULL,
  `ans_6` longtext DEFAULT NULL,
  `hqa_7` longtext DEFAULT NULL,
  `ans_7` longtext DEFAULT NULL,
  `hqa_8` longtext DEFAULT NULL,
  `ans_8` longtext DEFAULT NULL,
  `hqa_9` longtext DEFAULT NULL,
  `ans_9` longtext DEFAULT NULL,
  `hqa_10` longtext DEFAULT NULL,
  `ans_10` longtext DEFAULT NULL,
  `hqa_11` longtext DEFAULT NULL,
  `ans_11` longtext DEFAULT NULL,
  `hqa_12` longtext DEFAULT NULL,
  `ans_12` longtext DEFAULT NULL,
  `hqa_13` longtext DEFAULT NULL,
  `ans_13` longtext DEFAULT NULL,
  `hqa_14` longtext DEFAULT NULL,
  `ans_14` longtext DEFAULT NULL,
  `hqa_15` longtext DEFAULT NULL,
  `ans_15` longtext DEFAULT NULL,
  `hqa_16` longtext DEFAULT NULL,
  `ans_16` longtext DEFAULT NULL,
  `hqa_17` longtext DEFAULT NULL,
  `ans_17` longtext DEFAULT NULL,
  `hqa_18` longtext DEFAULT NULL,
  `ans_18` longtext DEFAULT NULL,
  `hqa_19` longtext DEFAULT NULL,
  `ans_19` longtext DEFAULT NULL,
  `hqa_20` longtext DEFAULT NULL,
  `ans_20` longtext DEFAULT NULL,
  `hqa_21` longtext DEFAULT NULL,
  `ans_21` longtext DEFAULT NULL,
  `hqa_22` longtext DEFAULT NULL,
  `ans_22` longtext DEFAULT NULL,
  `hqa_23` longtext DEFAULT NULL,
  `ans_23` longtext DEFAULT NULL,
  `hqa_24` longtext DEFAULT NULL,
  `ans_24` longtext DEFAULT NULL,
  `hqa_25` longtext DEFAULT NULL,
  `ans_25` longtext DEFAULT NULL,
  `hqa_26` longtext DEFAULT NULL,
  `ans_26` longtext DEFAULT NULL,
  `hqa_27` longtext DEFAULT NULL,
  `ans_27` longtext DEFAULT NULL,
  `hqa_28` longtext DEFAULT NULL,
  `ans_28` longtext DEFAULT NULL,
  `hqa_29` longtext DEFAULT NULL,
  `ans_29` longtext DEFAULT NULL,
  `hqa_30` longtext DEFAULT NULL,
  `ans_30` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profile_header_all`
--

CREATE TABLE `profile_header_all` (
  `id` int(11) NOT NULL,
  `profile_id` varchar(255) DEFAULT NULL COMMENT 'Unique profile identifier (e.g., PHA-00001)',
  `status` int(11) DEFAULT NULL COMMENT '0-inactive/1-active',
  `profile_name` text DEFAULT NULL COMMENT 'Profile/Role name (Director, HR, Employee)',
  `form_ids` longtext DEFAULT NULL COMMENT 'Comma separated form IDs accessible to this profile',
  `process_ids` longtext DEFAULT NULL COMMENT 'Comma separated process IDs accessible to this profile',
  `inserted_on` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profile_header_all`
--

INSERT INTO `profile_header_all` (`id`, `profile_id`, `status`, `profile_name`, `form_ids`, `process_ids`, `inserted_on`) VALUES
(1, 'PHA-00001', 1, 'Director', NULL, NULL, '2026-04-25 18:38:11'),
(2, 'PHA-00002', 1, 'HR', NULL, NULL, '2026-04-25 18:38:11'),
(3, 'PHA-00003', 1, 'Employee', NULL, NULL, '2026-04-25 18:38:11');

-- --------------------------------------------------------

--
-- Table structure for table `team_emp_combination_all`
--

CREATE TABLE `team_emp_combination_all` (
  `id` int(11) NOT NULL,
  `tec_id` varchar(255) DEFAULT NULL COMMENT 'Unique combination identifier',
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'References tha_id from team_header_all',
  `eha_id` varchar(255) DEFAULT NULL COMMENT 'References eha_id from employee_header_all',
  `linked_on` datetime DEFAULT NULL COMMENT 'When employee was added to team',
  `unlinked_on` datetime DEFAULT NULL COMMENT 'When employee was removed from team',
  `link_type` int(11) DEFAULT NULL COMMENT '1-member/2-leader',
  `inserted_on` datetime DEFAULT current_timestamp(),
  `valid_till` datetime DEFAULT NULL,
  `line_no` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_header_all`
--

CREATE TABLE `team_header_all` (
  `id` int(11) NOT NULL,
  `tha_id` varchar(255) DEFAULT NULL COMMENT 'Unique team identifier (e.g., THA-00001)',
  `team_name` text DEFAULT NULL COMMENT 'Name of the team',
  `team_members` varchar(1000) DEFAULT NULL COMMENT 'JSON array of employee IDs (eha_id)',
  `team_leader` varchar(255) DEFAULT NULL COMMENT 'JSON array of team leader IDs (eha_id)',
  `inserted_on` datetime DEFAULT current_timestamp(),
  `status` int(11) DEFAULT NULL COMMENT '0-inactive/1-active',
  `valid_till` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_header_all`
--

INSERT INTO `team_header_all` (`id`, `tha_id`, `team_name`, `team_members`, `team_leader`, `inserted_on`, `status`, `valid_till`) VALUES
(1, 'THA-00001', 'MI 20', '[\"EHA-00001\",\"EHA-00002\",\"EHA-00003\"]', '[\"EHA-00002\"]', '2026-04-25 18:38:11', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `unique_header_all`
--

CREATE TABLE `unique_header_all` (
  `id` int(11) NOT NULL,
  `table_name` text DEFAULT NULL COMMENT 'Name of the table this sequence belongs to',
  `prefix` text DEFAULT NULL COMMENT 'Prefix for unique IDs (e.g., EHA, THA, PHA)',
  `last_id` varchar(255) DEFAULT NULL COMMENT 'Last generated ID value',
  `created_on` datetime DEFAULT current_timestamp(),
  `modified_on` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unique_header_all`
--

INSERT INTO `unique_header_all` (`id`, `table_name`, `prefix`, `last_id`, `created_on`, `modified_on`) VALUES
(1, 'employee_header_all', 'EHA', '6', '2026-04-25 18:38:11', '2026-04-26 01:17:27'),
(2, 'user_login', 'ULH', '8', '2026-04-26 01:09:40', '2026-04-26 01:17:27');

-- --------------------------------------------------------

--
-- Table structure for table `user_login`
--

CREATE TABLE `user_login` (
  `id` int(11) NOT NULL COMMENT 'Primary key',
  `ulh_id` varchar(255) DEFAULT NULL,
  `eha_id` varchar(255) NOT NULL COMMENT 'References eha_id from employee_header_all',
  `password` varchar(255) NOT NULL COMMENT 'User password (should be hashed in production)',
  `role` varchar(50) DEFAULT NULL COMMENT 'User role: director, hr, employee, leader',
  `is_first_login` tinyint(4) DEFAULT 1 COMMENT '0-no/1-yes - Force password change on first login',
  `last_login` datetime DEFAULT NULL COMMENT 'Last login timestamp',
  `failed_attempts` int(11) DEFAULT 0 COMMENT 'Number of failed login attempts',
  `is_locked` tinyint(4) DEFAULT 0 COMMENT '0-not locked/1-locked - Account lock status',
  `password_changed_on` datetime DEFAULT NULL COMMENT 'Last password change timestamp',
  `reset_token` varchar(255) DEFAULT NULL COMMENT 'Password reset token',
  `reset_token_expiry` datetime DEFAULT NULL COMMENT 'Reset token expiry timestamp',
  `status` int(11) DEFAULT 1 COMMENT '0-inactive/1-active',
  `inserted_on` datetime DEFAULT current_timestamp(),
  `updated_on` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User login credentials and authentication table';

--
-- Dumping data for table `user_login`
--

INSERT INTO `user_login` (`id`, `ulh_id`, `eha_id`, `password`, `role`, `is_first_login`, `last_login`, `failed_attempts`, `is_locked`, `password_changed_on`, `reset_token`, `reset_token_expiry`, `status`, `inserted_on`, `updated_on`) VALUES
(1, 'ULH-00005', 'EHA-00001', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'director', 0, '2026-04-26 00:18:47', 0, 0, NULL, NULL, NULL, 1, '2026-04-26 00:16:43', '2026-04-26 01:25:07'),
(2, 'ULH-00006', 'EHA-00002', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'hr', 0, NULL, 0, 0, NULL, NULL, NULL, 1, '2026-04-26 00:16:43', '2026-04-26 01:25:07'),
(3, 'ULH-00007', 'EHA-00003', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'employee', 0, NULL, 0, 0, NULL, NULL, NULL, 1, '2026-04-26 00:16:43', '2026-04-26 01:25:07'),
(4, 'ULH-00008', 'EHA-00004', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'employee', 1, NULL, 0, 0, NULL, NULL, NULL, 1, '2026-04-26 00:16:43', '2026-04-26 01:25:07'),
(5, 'ULH-00001', 'EHA-00006', 'Welcome@6386', 'PHA-00003', 1, NULL, 0, 0, NULL, NULL, NULL, 1, '2026-04-26 01:17:27', '2026-04-26 01:17:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employee_header_all`
--
ALTER TABLE `employee_header_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `eha_id` (`eha_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `mob_no` (`mob_no`),
  ADD UNIQUE KEY `aadhar` (`aadhar`),
  ADD UNIQUE KEY `pan` (`pan`),
  ADD KEY `fk_employee_profile` (`type`);

--
-- Indexes for table `hr_general_settings_all`
--
ALTER TABLE `hr_general_settings_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hgs_id` (`hgs_id`);

--
-- Indexes for table `hr_qa_settings_all`
--
ALTER TABLE `hr_qa_settings_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hqa_id` (`hqa_id`);

--
-- Indexes for table `member_daily_agenda_details_all`
--
ALTER TABLE `member_daily_agenda_details_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mda_id` (`mda_id`),
  ADD KEY `fk_mda_tha_id` (`tha_id`),
  ADD KEY `fk_mda_tec_id` (`tec_id`);

--
-- Indexes for table `member_daily_report_details_all`
--
ALTER TABLE `member_daily_report_details_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mdr_id` (`mdr_id`),
  ADD KEY `fk_mdr_tha_id` (`tha_id`),
  ADD KEY `fk_mdr_tec_id` (`tec_id`);

--
-- Indexes for table `monthly_questions_details_all`
--
ALTER TABLE `monthly_questions_details_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mqd_id` (`mqd_id`);

--
-- Indexes for table `performance_points_details_all`
--
ALTER TABLE `performance_points_details_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ppd_id` (`ppd_id`),
  ADD KEY `fk_ppd_eha_id` (`eha_id`);

--
-- Indexes for table `performance_qa_details_all`
--
ALTER TABLE `performance_qa_details_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pqd_id` (`pqd_id`),
  ADD KEY `fk_pqa_mqd_id` (`mqd_id`),
  ADD KEY `fk_pqa_eha_id` (`eha_id`);

--
-- Indexes for table `profile_header_all`
--
ALTER TABLE `profile_header_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `profile_id` (`profile_id`);

--
-- Indexes for table `team_emp_combination_all`
--
ALTER TABLE `team_emp_combination_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tec_id` (`tec_id`),
  ADD KEY `tec_tha_id` (`tha_id`),
  ADD KEY `tec_eha_id` (`eha_id`);

--
-- Indexes for table `team_header_all`
--
ALTER TABLE `team_header_all`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tha_id` (`tha_id`);

--
-- Indexes for table `unique_header_all`
--
ALTER TABLE `unique_header_all`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_login`
--
ALTER TABLE `user_login`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `eha_id` (`eha_id`),
  ADD UNIQUE KEY `ul_id` (`ulh_id`),
  ADD KEY `fk_user_login_eha` (`eha_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employee_header_all`
--
ALTER TABLE `employee_header_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `hr_general_settings_all`
--
ALTER TABLE `hr_general_settings_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hr_qa_settings_all`
--
ALTER TABLE `hr_qa_settings_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_daily_agenda_details_all`
--
ALTER TABLE `member_daily_agenda_details_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_daily_report_details_all`
--
ALTER TABLE `member_daily_report_details_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `monthly_questions_details_all`
--
ALTER TABLE `monthly_questions_details_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance_points_details_all`
--
ALTER TABLE `performance_points_details_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance_qa_details_all`
--
ALTER TABLE `performance_qa_details_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `profile_header_all`
--
ALTER TABLE `profile_header_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `team_emp_combination_all`
--
ALTER TABLE `team_emp_combination_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `team_header_all`
--
ALTER TABLE `team_header_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `unique_header_all`
--
ALTER TABLE `unique_header_all`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_login`
--
ALTER TABLE `user_login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary key', AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee_header_all`
--
ALTER TABLE `employee_header_all`
  ADD CONSTRAINT `fk_employee_profile` FOREIGN KEY (`type`) REFERENCES `profile_header_all` (`profile_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `member_daily_agenda_details_all`
--
ALTER TABLE `member_daily_agenda_details_all`
  ADD CONSTRAINT `fk_mda_tec_id` FOREIGN KEY (`tec_id`) REFERENCES `team_emp_combination_all` (`tec_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mda_tha_id` FOREIGN KEY (`tha_id`) REFERENCES `team_header_all` (`tha_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `member_daily_report_details_all`
--
ALTER TABLE `member_daily_report_details_all`
  ADD CONSTRAINT `fk_mdr_tec_id` FOREIGN KEY (`tec_id`) REFERENCES `team_emp_combination_all` (`tec_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mdr_tha_id` FOREIGN KEY (`tha_id`) REFERENCES `team_header_all` (`tha_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `performance_points_details_all`
--
ALTER TABLE `performance_points_details_all`
  ADD CONSTRAINT `fk_ppd_eha_id` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `performance_qa_details_all`
--
ALTER TABLE `performance_qa_details_all`
  ADD CONSTRAINT `fk_pqa_eha_id` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pqa_mqd_id` FOREIGN KEY (`mqd_id`) REFERENCES `monthly_questions_details_all` (`mqd_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `team_emp_combination_all`
--
ALTER TABLE `team_emp_combination_all`
  ADD CONSTRAINT `fk_tec_eha_id` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tec_tha_id` FOREIGN KEY (`tha_id`) REFERENCES `team_header_all` (`tha_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_login`
--
ALTER TABLE `user_login`
  ADD CONSTRAINT `fk_user_login_eha` FOREIGN KEY (`eha_id`) REFERENCES `employee_header_all` (`eha_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
