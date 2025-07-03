-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 02, 2025 at 07:12 AM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `1010`
--
CREATE DATABASE IF NOT EXISTS `1010` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `1010`;

-- --------------------------------------------------------

--
-- Table structure for table `appuser`
--

DROP TABLE IF EXISTS `appuser`;
CREATE TABLE IF NOT EXISTS `appuser` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `FullName` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Role` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Phone` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ProfileImagePath` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appuser`
--

INSERT INTO `appuser` (`UserID`, `FullName`, `Email`, `Password`, `Role`, `Phone`, `ProfileImagePath`) VALUES
(23, 'Tharupama', 'tharupama@gmail.com', '$2b$10$D17AdHlh7Z.pC3HC9PAUCebEeOEhhqcd2apigKUHsO7QJ9owOBCBe', 'Supervisor', '01234023145', NULL),
(24, 'Kanchana', 'kanchana@gmail.com', '$2b$10$gwJZcNmFH/wy/O9q3yaa9OOZoS8wtvkLa76sVWCYPgejL/TlEevte', 'Supervisor', '01123654789', NULL),
(25, 'Rajitha', 'rajitha@gmail.com', '$2b$10$qclOf2oKmE1c4eMQne5/rOKrT/nQL9ZwTN81enShEkWrnIX3vgT/C', 'User', '0123654789', NULL),
(26, 'Kusala', 'kusal@gmail.com', '$2b$10$E/pnrgzHBA2SXT8kgFz11uElI0M7Uob9OJOYtFFkA2EAMLwqoB9DW', 'Supervisor', '01123547896', NULL),
(28, 'Suneth Upendra', 'govindikariyawasam@gmail.com', '$2b$10$3rPcZBal2CTGz1GNR3oNHO6k5KnIz310FNb9637g.mefr1aX1N0Re', 'Supervisor', '0712254144', NULL),
(30, 'Nethmi', 'kariyawasam@gmail.com', '$2b$10$zC3MimzbhtPHCSoFOkaK7OgdSHgSoqHdxRoghGqfL8Q39eTsKFA7W', 'Admin', '0775623589', NULL),
(31, 'Kariyawasam', 'kariyawasamkusal@gmail.com', '$2b$10$AvGZQO46YD6R32mLyLgsTukhUqZT9MiJwUzWWKz9QzYcCpE1FaUl6', 'Supervisor', '01235861253', NULL),
(33, 'Diluka', 'nethmitk22@gmail.com', '$2b$10$Ww9RXhIPRBCCLHbgyK3oVuejmQWQzJ7ngznZJR1dQBPrmt7.Zi/9y', 'User', '0774665078', NULL),
(34, 'admin', 'admin22@gmail.com', '$2b$10$7ltjJSMxBSg.Kg6vMCc3sOihNyGIus8Gbr5M8ZnnGfn25VzE4xEOG', 'Admin', '0777858521', NULL),
(35, 'supervisor', 'supervisor22@gmail.com', '$2b$10$kny78UAIx0JCKcTASf4UP.wk/zw6.Bl8m.gTe0I5c/iM2zNVLioua', 'Supervisor', '0761211070', NULL),
(36, 'user', 'user22@gmail.com', '$2b$10$O/BVkiMwnRViRXR5trvPsO7JccjdC3OQuf2HbBV0RXjAS9vb66m3S', 'User', '0774665078', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asipiyasystem`
--

DROP TABLE IF EXISTS `asipiyasystem`;
CREATE TABLE IF NOT EXISTS `asipiyasystem` (
  `AsipiyaSystemID` int NOT NULL AUTO_INCREMENT,
  `SystemName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`AsipiyaSystemID`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `asipiyasystem`
--

INSERT INTO `asipiyasystem` (`AsipiyaSystemID`, `SystemName`, `Description`, `Status`) VALUES
(7, 'Library Management System', 'A system to manage book inventory, borrowing/returning processes, member registrations, and overdue alerts in a library.', 1),
(9, 'Student Attendance System', 'Tracks student attendance using barcodes, RFID, or face recognition, generating reports for teachers and parents.', 1),
(13, 'Inventory Management System', 'Keeps track of stock levels, product orders, deliveries, and sales for businesses managing physical goods.', 1);

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `ClientID` int NOT NULL AUTO_INCREMENT,
  `CompanyName` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactNo` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactPersonEmail` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MobileNo` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  PRIMARY KEY (`ClientID`),
  KEY `fk_user` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`ClientID`, `CompanyName`, `ContactNo`, `ContactPersonEmail`, `MobileNo`, `UserID`) VALUES
(1, 'Asipiya', '091225638', 'asipiya@gmail.com', '022356987', NULL),
(7, 'Keels Super', '01123356898', 'rajitha@gmail.com', '023568', 25),
(6, 'Kusal Oil Mart', '0770568545', 'kariyawasamkusal@gmail.com', '0112564789', 30),
(5, 'zc', 'xdfh', 'ghd@gmail.com', 'hfy', NULL),
(8, 'Cargills Super', '0112356984', 'tharupama@gmail.com', '07756023185', 23);

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `CommentID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int NOT NULL,
  `UserID` int NOT NULL,
  `CommentText` text COLLATE utf8mb4_general_ci NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Mentions` text COLLATE utf8mb4_general_ci,
  `ReplyToCommentID` int DEFAULT NULL,
  `AttachmentFilePath` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AttachmentFileName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AttachmentFileType` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`CommentID`),
  KEY `fk_comment_ticket` (`TicketID`),
  KEY `fk_comment_user` (`UserID`),
  KEY `fk_comment_reply` (`ReplyToCommentID`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`CommentID`, `TicketID`, `UserID`, `CommentText`, `CreatedAt`, `Mentions`, `ReplyToCommentID`, `AttachmentFilePath`, `AttachmentFileName`, `AttachmentFileType`) VALUES
(34, 59, 28, '@Kanchana @Kusala', '2025-06-24 06:25:55', '24,26', NULL, NULL, NULL, NULL),
(35, 68, 34, '@Govindi Tharupama @Govindi', '2025-06-27 06:13:40', '27,22', NULL, 'uploads/comment_attachments/comment-1751004820533-138365611.pdf', 'daily progress-01.pdf', 'application/pdf'),
(36, 68, 34, 'tyy', '2025-06-27 06:15:13', NULL, NULL, 'uploads/comment_attachments/comment-1751004913938-611390567.pdf', 'daily progress-01.pdf', 'application/pdf'),
(37, 68, 34, 'kk', '2025-06-27 06:15:45', NULL, NULL, 'uploads/comment_attachments/comment-1751004945087-781769649.mp4', 'Black Playful Animated Welcome Channel Youtube Intro Video.mp4', 'video/mp4'),
(38, 68, 34, '@Kanchana', '2025-06-27 06:40:14', '24', NULL, 'uploads/comment_attachments/comment-1751006414941-630662392.pdf', 'daily progress-01.pdf', 'application/pdf'),
(39, 68, 34, '@Govindi Tharupama hii @Kusala              @Kusala', '2025-06-27 07:19:35', '27,22,26', NULL, 'uploads/comment_attachments/comment-1751008775244-415167991.pdf', 'My-Internship-Experience-at-ETL-Bricks-Pvt-Ltd.pptx.pdf', 'application/pdf'),
(40, 68, 34, '@Govindi Tharupama hii @Kanchana @Kusala hii@Govindi hii @admin', '2025-06-27 08:27:12', '27,24,22,26,34', NULL, NULL, NULL, NULL),
(41, 68, 34, 'hii @Kusala  @Kanchana hii @Govindi hii @Govindi @Kusala', '2025-06-27 08:28:15', '24,22,26', NULL, NULL, NULL, NULL),
(42, 68, 34, 'hii @Kusala @admin hii @Kanchana @Kusala', '2025-06-27 08:30:45', '24,26,34', NULL, NULL, NULL, NULL),
(43, 68, 34, '@Govindi @Kanchana @Govindi Tharupama', '2025-06-27 08:31:00', '27,24,22', NULL, NULL, NULL, NULL),
(44, 68, 34, '@Govindi Tharupama @Kanchana @Kanchana', '2025-06-27 08:53:33', '27,24,22', NULL, NULL, NULL, NULL),
(45, 68, 34, '@Govindi Tharupama @Kanchana', '2025-06-27 09:06:26', '27,24,22', NULL, 'uploads/comment_attachments/comment-1751015186037-447324711.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(46, 68, 34, '@All Admins hii', '2025-06-27 09:57:34', NULL, NULL, NULL, NULL, NULL),
(47, 71, 34, '@All Admins hii', '2025-06-27 09:58:08', NULL, NULL, NULL, NULL, NULL),
(48, 72, 34, '@Govindi Tharupama @All Admhiiins', '2025-06-27 10:34:45', '27,22', NULL, 'uploads/comment_attachments/comment-1751020485390-483232567.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(49, 72, 34, '@Govindi Tharupama @All Admins @admin @Govindi', '2025-06-27 10:35:04', '27,22,34', NULL, NULL, NULL, NULL),
(50, 77, 34, '@Kusala hihii @Kusala            @All Admins           hiioplop', '2025-06-27 10:46:08', '26', NULL, NULL, NULL, NULL),
(51, 69, 34, 'hi@Govindi Tharupama hii', '2025-06-27 11:25:48', '27,22', NULL, NULL, NULL, NULL),
(52, 71, 34, 'kk', '2025-06-27 13:44:59', NULL, NULL, 'uploads/comment_attachments/comment-1751031899792-277892160.pdf', 'QA.pdf', 'application/pdf'),
(53, 71, 34, '@All Admins', '2025-06-27 13:53:37', NULL, NULL, 'uploads/comment_attachments/comment-1751032417068-520884361.pdf', 'QA.pdf', 'application/pdf'),
(54, 71, 34, '@All Admins', '2025-06-27 13:57:09', NULL, NULL, 'uploads/comment_attachments/comment-1751032629044-514756967.txt', 'read.txt', 'text/plain'),
(55, 68, 34, 'm', '2025-06-27 15:56:05', NULL, NULL, NULL, NULL, NULL),
(56, 68, 34, 'jii', '2025-06-27 16:01:48', NULL, NULL, NULL, NULL, NULL),
(57, 68, 34, 'hii', '2025-06-27 16:02:06', NULL, NULL, NULL, NULL, NULL),
(58, 68, 34, '', '2025-06-27 16:14:07', NULL, NULL, NULL, NULL, NULL),
(59, 68, 34, 'huu @Govindi Tharupama', '2025-06-27 16:26:09', '27,22', NULL, NULL, NULL, NULL),
(60, 68, 34, '@Kanchana', '2025-06-27 16:47:01', '24', NULL, NULL, NULL, NULL),
(61, 68, 34, '@All Admins  hi@Govindi Tharupama', '2025-06-28 07:29:37', '27,22', NULL, NULL, NULL, NULL),
(62, 68, 34, '', '2025-06-28 07:31:22', NULL, NULL, NULL, NULL, NULL),
(63, 68, 34, '@All Admins', '2025-06-28 07:47:58', NULL, NULL, NULL, NULL, NULL),
(64, 68, 34, '@All Admins', '2025-06-28 07:48:09', NULL, NULL, NULL, NULL, NULL),
(65, 68, 34, '', '2025-06-28 07:49:48', NULL, NULL, NULL, NULL, NULL),
(66, 68, 34, 'f', '2025-06-28 08:10:13', NULL, NULL, NULL, NULL, NULL),
(67, 68, 34, 'hi @Govindi Tharupama', '2025-06-28 08:26:02', '27,22', NULL, NULL, NULL, NULL),
(68, 68, 34, 'hii @Govindi Tharupama @All Admins hii helo', '2025-06-28 08:26:36', '27,22', NULL, NULL, NULL, NULL),
(69, 68, 34, '@Govindi Tharupama  hi @Govindi Tharupama hi', '2025-06-28 08:43:02', '27,22', NULL, NULL, NULL, NULL),
(70, 71, 34, '@Kanchana', '2025-06-28 08:46:56', '24', NULL, NULL, NULL, NULL),
(71, 71, 34, 'iii @Govindi Tharupama jiojk@Kanchana jkkio@Kanchana ge huu@Govindi', '2025-06-28 08:54:16', '27,24,22', NULL, NULL, NULL, NULL),
(72, 68, 34, 'jj@Govindi Tharupama ji@Kanchana hr@admin', '2025-06-28 09:06:57', '27,24,22,34', NULL, NULL, NULL, NULL),
(73, 68, 34, 'kjkhk@Kanchana jki@admin kji', '2025-06-28 09:08:28', '24,34', NULL, NULL, NULL, NULL),
(74, 68, 34, 'ioi @Govindi Tharupama jiu@Govindi Tharupama huury88rhhui@Kanchana', '2025-06-28 09:09:09', '27,24,22', NULL, NULL, NULL, NULL),
(75, 68, 34, '@Govindi Tharupama  huu @Kanchana', '2025-06-28 09:12:15', '27,24,22', NULL, NULL, NULL, NULL),
(76, 68, 34, 'hiui @Govindi Tharupama huib ejh ejhjh @All Admins  jiiii  hiii@Kanchana huuihknmk,kk k k k k jiyijy  gjg g gg gjii9ynjhih', '2025-06-28 09:13:33', '27,24,22', NULL, NULL, NULL, NULL),
(77, 71, 34, '', '2025-06-28 14:00:13', NULL, NULL, NULL, NULL, NULL),
(78, 71, 34, '', '2025-06-28 14:12:43', NULL, NULL, NULL, NULL, NULL),
(79, 71, 34, '', '2025-06-28 14:12:59', NULL, NULL, NULL, NULL, NULL),
(80, 71, 34, '', '2025-06-28 14:14:07', NULL, NULL, NULL, NULL, NULL),
(81, 71, 34, 'hu @Govindi Tharupama   hdjhjchdki    h@Kanchana hififosnfmvnmmm     uriuofff@Govindi mcffc,flkjkfjjjkbbb@Govindi ty', '2025-06-28 14:25:14', '27,24,22', NULL, NULL, NULL, NULL),
(82, 68, 34, 'jkj @Govindi Tharupama ddddddd@Govindi dd@Govindi ddd@admin', '2025-06-28 16:04:57', '27,22,34', NULL, NULL, NULL, NULL),
(83, 68, 34, '@Govindi Tharupama jooiighgytrryrrtrrjhbj    gy@Govindi Tharupama bhjbjhjbh ghg@Kanchana yguygyu', '2025-06-28 17:58:28', '27,24,22', NULL, NULL, NULL, NULL),
(84, 68, 34, 'HII@Kanchana  HII   @Kanchana', '2025-06-28 18:03:27', '24', NULL, NULL, NULL, NULL),
(85, 68, 34, '@Govindi Tharupama jjj,f,m f,mf fmf,d fm,@Govindi flkmrl@admin', '2025-06-28 18:36:32', '27,22,34', NULL, NULL, NULL, NULL),
(86, 68, 34, 'ji@Govindi Tharupama', '2025-06-28 18:47:59', '27,22', NULL, NULL, NULL, NULL),
(87, 68, 34, '@Govindi Tharupama hi @Govindi Tharupama hi@All Admins hui@Govindi hjhh@Govindi Tharupama', '2025-06-28 18:49:02', '27,22', NULL, NULL, NULL, NULL),
(88, 80, 34, 'HI @Kariyawasam    HAIEIOE', '2025-06-29 05:46:20', '30', NULL, NULL, NULL, NULL),
(89, 79, 34, '@Kanchana HII @Kusala  HII @admin', '2025-06-29 17:41:02', '24,26,34', NULL, NULL, NULL, NULL),
(90, 73, 35, 'hi @admin  hello', '2025-06-30 03:43:03', '34', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `comment_attachments`
--

DROP TABLE IF EXISTS `comment_attachments`;
CREATE TABLE IF NOT EXISTS `comment_attachments` (
  `AttachmentID` int NOT NULL AUTO_INCREMENT,
  `CommentID` int NOT NULL,
  `FilePath` varchar(255) NOT NULL,
  `FileName` varchar(255) NOT NULL,
  `FileType` varchar(50) NOT NULL,
  PRIMARY KEY (`AttachmentID`),
  KEY `fk_comment_attachments_comment` (`CommentID`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `comment_attachments`
--

INSERT INTO `comment_attachments` (`AttachmentID`, `CommentID`, `FilePath`, `FileName`, `FileType`) VALUES
(1, 56, 'uploads/comment_attachments/comment-1751040108850-167972380.pdf', 'QA.pdf', 'application/pdf'),
(2, 57, 'uploads/comment_attachments/comment-1751040126746-580801184.pdf', 'QA.pdf', 'application/pdf'),
(3, 57, 'uploads/comment_attachments/comment-1751040126779-744833589.txt', 'read.txt', 'text/plain'),
(4, 58, 'uploads/comment_attachments/comment-1751040847504-375065361.txt', 'read.txt', 'text/plain'),
(5, 58, 'uploads/comment_attachments/comment-1751040847505-723248292.pdf', 'QA.pdf', 'application/pdf'),
(6, 59, 'uploads/comment_attachments/comment-1751041569175-760427249.pdf', 'QA.pdf', 'application/pdf'),
(7, 59, 'uploads/comment_attachments/comment-1751041569189-72344829.txt', 'read.txt', 'text/plain'),
(8, 60, 'uploads/comment_attachments/comment-1751042821263-960406679.txt', 'read.txt', 'text/plain'),
(9, 60, 'uploads/comment_attachments/comment-1751042821264-626872930.pdf', 'QA.pdf', 'application/pdf'),
(10, 61, 'uploads/comment_attachments/comment-1751095777502-436419240.pdf', 'QA.pdf', 'application/pdf'),
(11, 61, 'uploads/comment_attachments/comment-1751095777526-134465266.txt', 'read.txt', 'text/plain'),
(12, 62, 'uploads/comment_attachments/comment-1751095882902-698304295.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(13, 62, 'uploads/comment_attachments/comment-1751095882941-91804448.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(14, 62, 'uploads/comment_attachments/comment-1751095882942-660447842.png', 'download.png', 'image/png'),
(15, 63, 'uploads/comment_attachments/comment-1751096878850-606409309.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(16, 64, 'uploads/comment_attachments/comment-1751096889788-236557791.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(17, 64, 'uploads/comment_attachments/comment-1751096889789-36487303.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(18, 65, 'uploads/comment_attachments/comment-1751096988458-245043521.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(19, 65, 'uploads/comment_attachments/comment-1751096988461-586986736.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(20, 66, 'uploads/comment_attachments/comment-1751098213423-408999237.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(21, 67, 'uploads/comment_attachments/comment-1751099162709-986718381.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(22, 68, 'uploads/comment_attachments/comment-1751099196903-900409199.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(23, 68, 'uploads/comment_attachments/comment-1751099196949-47728906.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(24, 68, 'uploads/comment_attachments/comment-1751099196955-942849053.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(25, 68, 'uploads/comment_attachments/comment-1751099196956-633565351.mp4', '365266383627489286.mp4', 'video/mp4'),
(26, 68, 'uploads/comment_attachments/comment-1751099196973-38966459.webp', 'DALLÂ·E 2025-03-07 22.33.22 - A modern, minimalist logo featuring a coder-themed icon with a marketing strategy color scheme. The design should include a sleek, abstract representa.webp', 'image/webp'),
(27, 73, 'uploads/comment_attachments/comment-1751101708837-398829437.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(28, 75, 'uploads/comment_attachments/comment-1751101935163-986613581.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(29, 77, 'uploads/comment_attachments/comment-1751119213418-673555722.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(30, 77, 'uploads/comment_attachments/comment-1751119213419-717852034.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(31, 78, 'uploads/comment_attachments/comment-1751119963111-709004861.pdf', 'SAL_Syl_new1.pdf', 'application/pdf'),
(32, 79, 'uploads/comment_attachments/comment-1751119979148-957430505.pdf', 'SAL_Syl_new1.pdf', 'application/pdf'),
(33, 79, 'uploads/comment_attachments/comment-1751119979153-164775302.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(34, 80, 'uploads/comment_attachments/comment-1751120047954-142068742.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(35, 80, 'uploads/comment_attachments/comment-1751120047954-362049022.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(36, 80, 'uploads/comment_attachments/comment-1751120047971-678662042.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(37, 80, 'uploads/comment_attachments/comment-1751120047974-235778427.txt', 'manage.txt', 'text/plain'),
(38, 80, 'uploads/comment_attachments/comment-1751120047975-666524319.txt', 'import { useState, useEffect, useRe.txt', 'text/plain'),
(39, 80, 'uploads/comment_attachments/comment-1751120047975-571265700.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(40, 80, 'uploads/comment_attachments/comment-1751120047975-204128748.pdf', 'QA (1).pdf', 'application/pdf'),
(41, 80, 'uploads/comment_attachments/comment-1751120047978-702571164.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(42, 81, 'uploads/comment_attachments/comment-1751120714774-801552807.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(43, 81, 'uploads/comment_attachments/comment-1751120714776-592484464.png', 'Screenshot 2025-06-20 002836.png', 'image/png'),
(44, 83, 'uploads/comment_attachments/comment-1751133508691-813247239.pdf', 'QA (1).pdf', 'application/pdf'),
(45, 83, 'uploads/comment_attachments/comment-1751133508702-471719161.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(46, 83, 'uploads/comment_attachments/comment-1751133508704-407318205.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(47, 83, 'uploads/comment_attachments/comment-1751133508705-613517112.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(48, 83, 'uploads/comment_attachments/comment-1751133508755-254916633.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(49, 83, 'uploads/comment_attachments/comment-1751133508762-782633314.txt', 'manage.txt', 'text/plain'),
(50, 83, 'uploads/comment_attachments/comment-1751133508764-698673991.txt', 'import { useState, useEffect, useRe.txt', 'text/plain'),
(51, 83, 'uploads/comment_attachments/comment-1751133508764-845284419.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(52, 84, 'uploads/comment_attachments/comment-1751133807307-480147248.pdf', 'QA (1).pdf', 'application/pdf'),
(53, 84, 'uploads/comment_attachments/comment-1751133807320-689309151.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(54, 84, 'uploads/comment_attachments/comment-1751133807321-288912477.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(55, 84, 'uploads/comment_attachments/comment-1751133807321-534382396.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(56, 84, 'uploads/comment_attachments/comment-1751133807358-220497367.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(57, 84, 'uploads/comment_attachments/comment-1751133807367-604635020.txt', 'manage.txt', 'text/plain'),
(58, 84, 'uploads/comment_attachments/comment-1751133807368-461599211.txt', 'import { useState, useEffect, useRe.txt', 'text/plain'),
(59, 84, 'uploads/comment_attachments/comment-1751133807368-882436997.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(60, 85, 'uploads/comment_attachments/comment-1751135792830-564151172.pdf', 'QA (1).pdf', 'application/pdf'),
(61, 85, 'uploads/comment_attachments/comment-1751135792844-976382217.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(62, 85, 'uploads/comment_attachments/comment-1751135792846-82862912.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(63, 85, 'uploads/comment_attachments/comment-1751135792846-864753627.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(64, 85, 'uploads/comment_attachments/comment-1751135792885-870548140.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(65, 85, 'uploads/comment_attachments/comment-1751135792890-299113072.txt', 'manage.txt', 'text/plain'),
(66, 86, 'uploads/comment_attachments/comment-1751136479827-247338823.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247 (1).mp4', 'video/mp4'),
(67, 86, 'uploads/comment_attachments/comment-1751136479859-851841040.mp3', 'comment-1750942006542-67590265 (1).mp3', 'audio/mpeg'),
(68, 86, 'uploads/comment_attachments/comment-1751136479894-814239288.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247.mp4', 'video/mp4'),
(69, 88, 'uploads/comment_attachments/comment-1751175980714-9884532.mp3', 'comment-1751136479859-851841040.mp3', 'audio/mpeg'),
(70, 88, 'uploads/comment_attachments/comment-1751175980741-101838565.mp4', 'comment-1751136479827-247338823.mp4', 'video/mp4'),
(71, 88, 'uploads/comment_attachments/comment-1751175980755-871867154.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247 (1).mp4', 'video/mp4'),
(72, 88, 'uploads/comment_attachments/comment-1751175980766-54636334.mp3', 'comment-1750942006542-67590265 (1).mp3', 'audio/mpeg'),
(73, 88, 'uploads/comment_attachments/comment-1751175980804-670160827.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247.mp4', 'video/mp4'),
(74, 90, 'uploads/comment_attachments/comment-1751254983541-928611566.jpg', 'WhatsApp Image 2025-06-30 at 00.56.26_b28717b4.jpg', 'image/jpeg'),
(75, 90, 'uploads/comment_attachments/comment-1751254983542-862039613.jpg', 'WhatsApp Image 2025-06-29 at 15.37.42_c538145e.jpg', 'image/jpeg'),
(76, 90, 'uploads/comment_attachments/comment-1751254983543-110168359.mp3', 'comment-1751136479859-851841040.mp3', 'audio/mpeg'),
(77, 90, 'uploads/comment_attachments/comment-1751254983587-288235967.mp4', 'comment-1751136479827-247338823.mp4', 'video/mp4'),
(78, 90, 'uploads/comment_attachments/comment-1751254983608-749943008.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247 (1).mp4', 'video/mp4'),
(79, 90, 'uploads/comment_attachments/comment-1751254983655-602137616.mp3', 'comment-1750942006542-67590265 (1).mp3', 'audio/mpeg');

-- --------------------------------------------------------

--
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
CREATE TABLE IF NOT EXISTS `comment_likes` (
  `LikeID` int NOT NULL AUTO_INCREMENT,
  `CommentID` int NOT NULL,
  `UserID` int NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LikeID`),
  UNIQUE KEY `uq_comment_user_like` (`CommentID`,`UserID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comment_likes`
--

INSERT INTO `comment_likes` (`LikeID`, `CommentID`, `UserID`, `CreatedAt`) VALUES
(1, 44, 34, '2025-06-27 08:54:00'),
(2, 43, 34, '2025-06-27 15:45:36'),
(3, 39, 34, '2025-06-28 13:47:07'),
(4, 86, 34, '2025-06-28 18:48:23');

-- --------------------------------------------------------

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
CREATE TABLE IF NOT EXISTS `evidence` (
  `EvidenceID` int NOT NULL AUTO_INCREMENT,
  `Description` text COLLATE utf8mb4_general_ci,
  `FilePath` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ComplaintID` int DEFAULT NULL,
  PRIMARY KEY (`EvidenceID`),
  KEY `fk_evidence_ticket` (`ComplaintID`)
) ENGINE=MyISAM AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evidence`
--

INSERT INTO `evidence` (`EvidenceID`, `Description`, `FilePath`, `ComplaintID`) VALUES
(66, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691060-924002970.pdf', 68),
(67, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691061-384223388.jpg', 68),
(68, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691061-235133612.mp4', 68),
(69, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691076-838016931.jpg', 68),
(70, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691077-626526867.jpg', 68),
(71, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405767-422087612.pdf', 69),
(72, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405770-880685072.jpg', 69),
(73, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405770-206960288.mp4', 69),
(74, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405794-421586245.jpg', 69),
(75, 'yuzjknkamzyw8kz;q/', 'uploads/evidenceFiles-1750851446628-479784983.pdf', 70),
(76, 'yuzjknkamzyw8kz;q/', 'uploads/evidenceFiles-1750851446630-300102635.jpg', 70),
(77, 'yuzjknkamzyw8kz;q/', 'uploads/evidenceFiles-1750851446630-648488827.mp4', 70),
(78, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473188-951990974.jpg', 71),
(79, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473188-938612062.mp4', 71),
(80, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473206-69717654.jpg', 71),
(81, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473206-15173898.jpg', 71),
(82, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280423-127447264.pdf', 72),
(83, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280426-95454128.pdf', 72),
(84, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280429-371197153.jpg', 72),
(85, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280429-838900753.mp4', 72),
(86, '7dywadijwkajudyyaiudoisajoko', 'uploads/evidenceFiles-1750908296323-64923715.jpg', 73),
(87, '7dywadijwkajudyyaiudoisajoko', 'uploads/evidenceFiles-1750908296323-224915385.mp4', 73),
(88, '7dywadijwkajudyyaiudoisajoko', 'uploads/evidenceFiles-1750908296341-468150302.jpg', 73),
(89, 'jasjkx,m,s ,c', 'uploads/evidenceFiles-1750908318049-466379550.pdf', 74),
(90, 'jasjkx,m,s ,c', 'uploads/evidenceFiles-1750908318052-864652737.jpg', 74),
(91, 'jasjkx,m,s ,c', 'uploads/evidenceFiles-1750908318052-340482591.mp4', 74),
(92, 'aQRSTQ7YSK', 'uploads/evidenceFiles-1750908340257-467020272.pdf', 75),
(93, 'aQRSTQ7YSK', 'uploads/evidenceFiles-1750908340259-54908536.jpg', 75),
(94, 'aQRSTQ7YSK', 'uploads/evidenceFiles-1750908340259-905540302.jpg', 75),
(95, 'TWHAIKMLDMLK', 'uploads/evidenceFiles-1750908367483-201892597.mp4', 76),
(96, 'TWHAIKMLDMLK', 'uploads/evidenceFiles-1750908367497-408107130.jpg', 76),
(97, 'TWHAIKMLDMLK', 'uploads/evidenceFiles-1750908367497-777264430.jpg', 76),
(98, 'euyodipoewk9wur48woiejf;l', 'uploads/evidenceFiles-1750925984406-347389394.xlsx', 77),
(99, 'euyodipoewk9wur48woiejf;l', 'uploads/evidenceFiles-1750925984409-505057830.pptx', 77),
(100, 'euyodipoewk9wur48woiejf;l', 'uploads/evidenceFiles-1750925984414-88152267.docx', 77),
(101, 'hii', 'uploads/evidenceFiles-1751003366026-611691766.png', 78),
(102, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424555-195709544.mp4', 79),
(103, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424577-956276197.sql', 79),
(104, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424577-124444824.pdf', 79),
(105, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424581-660727532.sql', 79),
(106, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424581-408155664.zip', 79),
(107, 'Menuka', 'uploads/evidenceFiles-1751253749381-830628740.pka', 81),
(108, 'jknj', 'uploads/evidenceFiles-1751255010328-678939406.jpg', 82),
(109, 'jknj', 'uploads/evidenceFiles-1751255010328-539055674.mp4', 82),
(110, 'jknj', 'uploads/evidenceFiles-1751255010360-873985646.mp4', 82);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `NotificationID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Message` text COLLATE utf8mb4_general_ci NOT NULL,
  `Type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketLogID` int DEFAULT NULL,
  PRIMARY KEY (`NotificationID`),
  KEY `UserID` (`UserID`),
  KEY `TicketLogID` (`TicketLogID`)
) ENGINE=MyISAM AUTO_INCREMENT=375 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`NotificationID`, `UserID`, `Message`, `Type`, `IsRead`, `CreatedAt`, `TicketLogID`) VALUES
(2, 27, 'You have been assigned to ticket #26', 'SUPERVISOR_ASSIGNED', 0, '2025-06-13 04:29:25', NULL),
(3, 23, 'A supervisor has been assigned to your ticket #26', 'TICKET_UPDATED', 0, '2025-06-13 04:29:25', NULL),
(4, 22, 'Supervisor assigned to ticket #26', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-13 04:29:25', NULL),
(5, 27, 'You have been assigned to ticket #26', 'SUPERVISOR_ASSIGNED', 0, '2025-06-13 04:47:30', NULL),
(6, 23, 'A supervisor has been assigned to your ticket #26', 'TICKET_UPDATED', 0, '2025-06-13 04:47:30', NULL),
(7, 22, 'Supervisor assigned to ticket #26', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-13 04:47:30', NULL),
(8, 22, 'New system added: sgfxgf', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 06:42:50', NULL),
(9, 27, 'New system added: sgfxgf', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 06:42:50', NULL),
(10, 28, 'New system added: sgfxgf', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 06:42:50', NULL),
(11, 22, 'New ticket category added: hdtc', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 06:53:03', NULL),
(12, 27, 'New ticket category added: hdtc', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 06:53:03', NULL),
(13, 28, 'New ticket category added: hdtc', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 06:53:03', NULL),
(14, 22, 'New ticket category added: xdfdb', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 07:01:46', NULL),
(15, 27, 'New ticket category added: xdfdb', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 07:01:46', NULL),
(16, 28, 'New ticket category added: xdfdb', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 07:01:46', NULL),
(17, 22, 'New system added: agzde', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 07:06:46', NULL),
(18, 27, 'New system added: agzde', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 07:06:46', NULL),
(19, 28, 'New system added: agzde', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 07:06:46', NULL),
(20, 22, 'New User registered: Kariyawasam (kariyawasam@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-17 05:17:53', NULL),
(21, 22, 'New User registered: Kariyawasam (kariyawasam@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-17 05:27:56', NULL),
(22, 22, 'New ticket created by User #25: DGFHGhjkpoal;s...', 'NEW_TICKET', 0, '2025-06-17 07:08:41', NULL),
(23, 22, 'New User registered: Kariyawasam (kariyawasamkusal@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-17 07:12:07', NULL),
(24, 22, 'New ticket created by User #31: dasfsffffffaaaaaaaaaaaaaaaaaaa...', 'NEW_TICKET', 0, '2025-06-17 07:12:51', NULL),
(25, 28, 'You have been assigned to ticket #32', 'SUPERVISOR_ASSIGNED', 0, '2025-06-17 07:41:10', NULL),
(26, 31, 'A supervisor has been assigned to your ticket #32', 'TICKET_UPDATED', 0, '2025-06-17 07:41:10', NULL),
(27, 22, 'Supervisor assigned to ticket #32', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-17 07:41:10', NULL),
(28, 28, 'You have been assigned to ticket #32', 'SUPERVISOR_ASSIGNED', 0, '2025-06-17 07:45:08', NULL),
(29, 31, 'A supervisor has been assigned to your ticket #32', 'TICKET_UPDATED', 0, '2025-06-17 07:45:08', NULL),
(30, 22, 'Supervisor assigned to ticket #32', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-17 07:45:08', NULL),
(31, 27, 'You have been assigned to ticket #32', 'SUPERVISOR_ASSIGNED', 0, '2025-06-17 07:47:36', NULL),
(32, 31, 'A supervisor has been assigned to your ticket #32', 'TICKET_UPDATED', 0, '2025-06-17 07:47:36', NULL),
(33, 22, 'Supervisor assigned to ticket #32', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-17 07:47:36', NULL),
(34, 27, 'You have been assigned to ticket #31', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 03:52:51', NULL),
(35, 25, 'A supervisor has been assigned to your ticket #31', 'TICKET_UPDATED', 0, '2025-06-18 03:52:51', NULL),
(36, 22, 'Supervisor assigned to ticket #31', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 03:52:51', NULL),
(37, 22, 'New ticket created by User #25: dffrjujjjjjjjjjjjjjjjjjjjj...', 'NEW_TICKET', 0, '2025-06-18 05:03:39', NULL),
(38, 22, 'New ticket created by User #25: ggggggggffffffrrrrrrrrrrr...', 'NEW_TICKET', 0, '2025-06-18 05:03:52', NULL),
(39, 22, 'New ticket created by User #23: regssaQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...', 'NEW_TICKET', 0, '2025-06-18 05:04:10', NULL),
(40, 22, 'New ticket created by User #23: [PI977R5WWRXGV...', 'NEW_TICKET', 0, '2025-06-18 05:04:23', NULL),
(41, 22, 'New ticket created by User #25: waewgseyydiji...', 'NEW_TICKET', 0, '2025-06-18 06:15:05', NULL),
(42, 22, 'New ticket created by User #25: fsaessdd...', 'NEW_TICKET', 0, '2025-06-18 06:19:07', NULL),
(43, 22, 'New ticket created by User #25: A secure platform for conducting elections where r...', 'NEW_TICKET', 0, '2025-06-18 06:19:46', NULL),
(44, 22, 'New ticket created by User #23: Allows employees to request leave, managers to app...', 'NEW_TICKET', 0, '2025-06-18 06:20:51', NULL),
(45, 22, 'New ticket created by User #23: WDSWWWWWWWWWWWWWWWWWWWWWWWW...', 'NEW_TICKET', 0, '2025-06-18 06:21:01', NULL),
(46, 28, 'You have been assigned to ticket #40', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 07:25:18', NULL),
(47, 23, 'A supervisor has been assigned to your ticket #40', 'TICKET_UPDATED', 0, '2025-06-18 07:25:18', NULL),
(48, 22, 'Supervisor assigned to ticket #40', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 07:25:18', NULL),
(49, 28, 'You have been assigned to ticket #40', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 07:25:22', NULL),
(50, 23, 'A supervisor has been assigned to your ticket #40', 'TICKET_UPDATED', 0, '2025-06-18 07:25:22', NULL),
(51, 22, 'Supervisor assigned to ticket #40', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 07:25:22', NULL),
(52, 28, 'You have been assigned to ticket #40', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 07:25:35', NULL),
(53, 23, 'A supervisor has been assigned to your ticket #40', 'TICKET_UPDATED', 0, '2025-06-18 07:25:35', NULL),
(54, 22, 'Supervisor assigned to ticket #40', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 07:25:35', NULL),
(55, 22, 'New ticket created by User #25: dhtfyfutgu...', 'NEW_TICKET', 0, '2025-06-18 07:55:20', NULL),
(56, 22, 'New ticket created by User #25: mfhykkkkk...', 'NEW_TICKET', 0, '2025-06-18 08:13:10', NULL),
(57, 22, 'New ticket created by User #25: tdtggijuoo...', 'NEW_TICKET', 0, '2025-06-18 08:25:24', NULL),
(58, 22, 'New ticket created by User #25: tdtggijuoo...', 'NEW_TICKET', 0, '2025-06-18 08:25:27', NULL),
(59, 22, 'New ticket created by User #25: chvnnkm...', 'NEW_TICKET', 0, '2025-06-18 08:26:17', NULL),
(60, 22, 'New ticket created by User #25: ihkzal,:Zz;/\nZz0\n...', 'NEW_TICKET', 0, '2025-06-18 08:28:49', NULL),
(61, 22, 'New ticket created by User #25: fdgfhguj...', 'NEW_TICKET', 0, '2025-06-18 08:35:45', NULL),
(62, 28, 'You have been assigned to ticket #48', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 08:42:56', NULL),
(63, 25, 'A supervisor has been assigned to your ticket #48', 'TICKET_UPDATED', 0, '2025-06-18 08:42:56', NULL),
(64, 22, 'Supervisor assigned to ticket #48', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 08:42:56', NULL),
(65, 22, 'New ticket created by User #25: fszedts...', 'NEW_TICKET', 0, '2025-06-18 09:02:58', NULL),
(66, 22, 'New ticket created by User #25: saxjixjIXSSZ...', 'NEW_TICKET', 0, '2025-06-18 09:05:16', NULL),
(67, 22, 'New ticket created by User #25: sxzmxkaS>X...', 'NEW_TICKET', 0, '2025-06-18 09:07:12', NULL),
(68, 22, 'New ticket created by User #22: Manages patient records, doctor appointments, bill...', 'NEW_TICKET', 0, '2025-06-18 09:10:09', NULL),
(69, 22, 'New ticket created by User #22: It has a big bug...', 'NEW_TICKET', 0, '2025-06-18 09:16:40', NULL),
(70, 27, 'You have been assigned to ticket #33', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 11:45:02', NULL),
(71, 25, 'A supervisor has been assigned to your ticket #33', 'TICKET_UPDATED', 0, '2025-06-18 11:45:02', NULL),
(72, 22, 'Supervisor assigned to ticket #33', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 11:45:02', NULL),
(73, 27, 'You have been assigned to ticket #33', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 11:48:12', NULL),
(74, 25, 'A supervisor has been assigned to your ticket #33', 'TICKET_UPDATED', 0, '2025-06-18 11:48:12', NULL),
(75, 22, 'Supervisor assigned to ticket #33', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 11:48:12', NULL),
(76, 28, 'You have been assigned to ticket #50', 'SUPERVISOR_ASSIGNED', 1, '2025-06-18 12:00:43', NULL),
(77, 25, 'A supervisor has been assigned to your ticket #50', 'TICKET_UPDATED', 0, '2025-06-18 12:00:43', NULL),
(78, 22, 'Supervisor assigned to ticket #50', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 12:00:43', NULL),
(79, 22, 'New ticket created by User #23: hghjnkjml...', 'NEW_TICKET', 0, '2025-06-18 12:08:03', NULL),
(80, 27, 'You have been assigned to ticket #34', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 14:35:23', NULL),
(81, 25, 'A supervisor has been assigned to your ticket #34', 'TICKET_UPDATED', 0, '2025-06-18 14:35:23', NULL),
(82, 22, 'Supervisor assigned to ticket #34', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 14:35:23', NULL),
(83, 28, 'You have been assigned to ticket #35', 'SUPERVISOR_ASSIGNED', 1, '2025-06-19 03:44:01', NULL),
(84, 23, 'A supervisor has been assigned to your ticket #35', 'TICKET_UPDATED', 0, '2025-06-19 03:44:01', NULL),
(85, 22, 'Supervisor assigned to ticket #35', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-19 03:44:01', NULL),
(86, 27, 'You have been assigned to ticket #36', 'SUPERVISOR_ASSIGNED', 0, '2025-06-19 03:46:23', NULL),
(87, 23, 'A supervisor has been assigned to your ticket #36', 'TICKET_UPDATED', 0, '2025-06-19 03:46:23', NULL),
(88, 22, 'Supervisor assigned to ticket #36', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-19 03:46:23', NULL),
(89, 22, 'New User registered: Govindi (govindith@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-20 05:33:23', NULL),
(90, 22, 'New ticket category added: zcxd', 'NEW_CATEGORY_ADDED', 0, '2025-06-20 07:26:23', NULL),
(91, 27, 'New ticket category added: zcxd', 'NEW_CATEGORY_ADDED', 0, '2025-06-20 07:26:23', NULL),
(92, 28, 'New ticket category added: zcxd', 'NEW_CATEGORY_ADDED', 1, '2025-06-20 07:26:23', NULL),
(93, 22, 'New ticket created by User #25: kjla;\'cd;xc...', 'NEW_TICKET', 0, '2025-06-23 05:44:34', NULL),
(94, 22, 'New ticket created by User #25: fhjbkjn,.\\.poiupo...', 'NEW_TICKET', 0, '2025-06-23 13:27:19', NULL),
(95, 22, 'New ticket created by User #25: YGKJNKM<LJURTFHJBAM < ...', 'NEW_TICKET', 0, '2025-06-23 13:36:29', NULL),
(96, 22, 'New ticket created by User #25: f gv hbjjnjkl\'.\'/vhvhbm...', 'NEW_TICKET', 0, '2025-06-23 13:36:44', NULL),
(97, 22, 'New ticket created by User #25: fdzshtg...', 'NEW_TICKET', 0, '2025-06-23 14:12:23', NULL),
(98, 22, 'New ticket created by User #23: sASTFERYHETDU...', 'NEW_TICKET', 0, '2025-06-23 14:14:09', NULL),
(99, 22, 'New ticket created by User #23: YGUUVOVL[Z;V[P=0=-A\n...', 'NEW_TICKET', 0, '2025-06-23 14:14:42', NULL),
(100, 22, 'New ticket created by User #25: IURFHI,\'ESEDRFGHJKL;\'...', 'NEW_TICKET', 0, '2025-06-23 14:15:02', NULL),
(101, 22, 'New ticket created by User #25: JSACIOJILSAP:...', 'NEW_TICKET', 0, '2025-06-23 14:15:25', NULL),
(102, 22, 'New ticket created by User #25: 5SDRFNJNKT65RTUJ,...', 'NEW_TICKET', 0, '2025-06-23 14:15:51', NULL),
(103, 25, 'The supervisor for your ticket #59 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 14:39:51', 1),
(104, 25, 'Your ticket #59 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 14:39:51', 2),
(105, 28, 'Ticket #59 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 14:39:51', 2),
(106, 28, 'You have been assigned to ticket #59. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 14:39:51', NULL),
(107, 24, 'You were mentioned in a comment on ticket #59', 'MENTION', 0, '2025-06-24 06:25:55', 34),
(108, 26, 'You were mentioned in a comment on ticket #59', 'MENTION', 0, '2025-06-24 06:25:55', 34),
(109, 24, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 5),
(110, 26, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 6),
(111, 27, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 7),
(112, 28, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 8),
(113, 25, 'The supervisor for your ticket #63 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 06:18:48', 9),
(114, 24, 'You have been assigned to ticket #63. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 06:18:48', NULL),
(115, 25, 'The supervisor for your ticket #63 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 06:20:40', 10),
(116, 24, 'You have been unassigned from ticket #63.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 06:20:40', 10),
(117, 25, 'Your ticket #63 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:20:40', 11),
(118, 24, 'Ticket #63 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:20:40', 11),
(119, 24, 'You have been assigned to ticket #63. Status: Pending, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 06:20:40', NULL),
(120, 25, 'The supervisor for your ticket #63 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 06:28:18', 12),
(121, 24, 'You have been unassigned from ticket #63.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 06:28:18', 12),
(122, 25, 'Your ticket #63 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 06:28:18', 13),
(123, 24, 'Ticket #63 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 06:28:18', 13),
(124, 25, 'Your ticket #63 priority has been changed from High to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:28:18', 14),
(125, 24, 'Ticket #63 priority has been changed from High to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:28:18', 14),
(126, 24, 'You have been assigned to ticket #63. Status: In Progress, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 06:28:18', NULL),
(127, 25, 'The supervisor for your ticket #58 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 07:39:24', 15),
(128, 26, 'You have been unassigned from ticket #58.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 07:39:24', 15),
(129, 26, 'You have been assigned to ticket #58. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 07:39:24', NULL),
(130, 25, 'The supervisor for your ticket #57 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 07:46:55', 16),
(131, 26, 'You have been assigned to ticket #57. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 07:46:55', NULL),
(132, 25, 'The supervisor for your ticket #57 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 07:48:20', 17),
(133, 26, 'You have been unassigned from ticket #57.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 07:48:20', 17),
(134, 24, 'You have been assigned to ticket #57. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 07:48:20', NULL),
(135, 25, 'The supervisor for your ticket #57 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 08:08:15', 18),
(136, 24, 'You have been unassigned from ticket #57.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 08:08:15', 18),
(137, 26, 'You have been assigned to ticket #57. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 08:08:15', NULL),
(138, 25, 'The supervisor for your ticket #58 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 08:13:01', 19),
(139, 26, 'You have been unassigned from ticket #58.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 08:13:01', 19),
(140, 26, 'You have been assigned to ticket #58. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 08:13:01', NULL),
(141, 25, 'The supervisor for your ticket #58 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 08:14:34', 20),
(142, 26, 'You have been unassigned from ticket #58.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 08:14:34', 20),
(143, 24, 'You have been assigned to ticket #58. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 08:14:34', NULL),
(144, 22, 'New ticket created by User #23: iudhuiqajodkf;leaoi98wudwd[w;xd...', 'NEW_TICKET', 0, '2025-06-25 08:53:34', NULL),
(145, 22, 'New ticket created by User #23: f8eawfoiekjopf,;e.s\'\n\n...', 'NEW_TICKET', 0, '2025-06-25 08:53:51', NULL),
(146, 22, 'New ticket created by User #25: iwuojoqakhdiudwiujs...', 'NEW_TICKET', 0, '2025-06-25 08:54:27', NULL),
(147, 22, 'New ticket created by User #25: sahiihdciuwshiuahiujowkoJIUDHUDU...', 'NEW_TICKET', 0, '2025-06-25 08:54:51', NULL),
(148, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 09:15:40', 21),
(149, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 09:15:40', NULL),
(150, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 09:16:28', 22),
(151, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 09:16:28', 22),
(152, 26, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 09:16:28', NULL),
(153, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 09:40:19', 23),
(154, 26, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 09:40:19', 23),
(155, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 09:40:19', NULL),
(156, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 10:46:42', 24),
(157, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 10:46:42', 24),
(158, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 10:46:42', NULL),
(159, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 10:52:00', 25),
(160, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 10:52:00', 25),
(161, 25, 'Your ticket #68 status has been changed from Pending to Pending.', 'STATUS_UPDATE', 0, '2025-06-25 10:52:00', 26),
(162, 24, 'Ticket #68 status has been changed from Pending to Pending.', 'STATUS_UPDATE', 0, '2025-06-25 10:52:00', 26),
(163, 25, 'Your ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 10:52:00', 27),
(164, 24, 'Ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 10:52:00', 27),
(165, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 10:52:00', NULL),
(166, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:04:01', 28),
(167, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 11:04:01', 28),
(168, 25, 'Your ticket #68 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:04:01', 29),
(169, 24, 'Ticket #68 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:04:01', 29),
(170, 25, 'Your ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:04:01', 30),
(171, 24, 'Ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:04:01', 30),
(172, 24, 'You have been assigned to ticket #68. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:04:01', NULL),
(173, 25, 'The supervisor for your ticket #67 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:06:20', 31),
(174, 25, 'Your ticket #67 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 11:06:20', 32),
(175, 24, 'Ticket #67 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 11:06:20', 32),
(176, 25, 'Your ticket #67 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:06:20', 33),
(177, 24, 'Ticket #67 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:06:20', 33),
(178, 24, 'You have been assigned to ticket #67. Status: In Progress, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:06:20', NULL),
(179, 23, 'The supervisor for your ticket #66 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:09:53', 34),
(180, 23, 'Your ticket #66 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:09:53', 35),
(181, 27, 'Ticket #66 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:09:53', 35),
(182, 23, 'Your ticket #66 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:09:53', 36),
(183, 27, 'Ticket #66 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:09:53', 36),
(184, 27, 'You have been assigned to ticket #66. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:09:53', NULL),
(185, 23, 'The supervisor for your ticket #65 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:10:03', 37),
(186, 23, 'Your ticket #65 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 0, '2025-06-25 11:10:03', 38),
(187, 24, 'Ticket #65 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 0, '2025-06-25 11:10:03', 38),
(188, 23, 'Your ticket #65 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:10:03', 39),
(189, 24, 'Ticket #65 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:10:03', 39),
(190, 24, 'You have been assigned to ticket #65. Status: Resolved, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:10:03', NULL),
(191, 22, 'New ticket created by User #23: hfhjkza,;,aojxiuxdhlkdx,nshgxkja ....', 'NEW_TICKET', 0, '2025-06-25 11:36:45', NULL),
(192, 22, 'New ticket created by User #23: yuzjknkamzyw8kz;q/...', 'NEW_TICKET', 0, '2025-06-25 11:37:26', NULL),
(193, 22, 'New ticket created by User #25: fygnlkmak9u8upoqza...', 'NEW_TICKET', 0, '2025-06-25 11:37:53', NULL),
(194, 23, 'The supervisor for your ticket #69 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:54:01', 40),
(195, 23, 'Your ticket #69 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:54:01', 41),
(196, 24, 'Ticket #69 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:54:01', 41),
(197, 23, 'Your ticket #69 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:54:01', 42),
(198, 24, 'Ticket #69 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:54:01', 42),
(199, 24, 'You have been assigned to ticket #69. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:54:01', NULL),
(200, 23, 'The supervisor for your ticket #70 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 12:01:28', 43),
(201, 23, 'Your ticket #70 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 12:01:28', 44),
(202, 24, 'Ticket #70 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 12:01:28', 44),
(203, 23, 'Your ticket #70 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 12:01:28', 45),
(204, 24, 'Ticket #70 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 12:01:28', 45),
(205, 24, 'You have been assigned to ticket #70. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 12:01:28', NULL),
(206, 25, 'The supervisor for your ticket #71 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 13:10:32', 46),
(207, 25, 'Your ticket #71 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 13:10:32', 47),
(208, 27, 'Ticket #71 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 13:10:32', 47),
(209, 25, 'Your ticket #71 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 13:10:32', 48),
(210, 27, 'Ticket #71 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 13:10:32', 48),
(211, 27, 'You have been assigned to ticket #71. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 13:10:32', NULL),
(212, 22, 'New ticket created by User #23: AHUSSUHJKSNKAUsSYI...', 'NEW_TICKET', 0, '2025-06-26 03:24:40', NULL),
(213, 22, 'New ticket created by User #23: 7dywadijwkajudyyaiudoisajoko...', 'NEW_TICKET', 0, '2025-06-26 03:24:56', NULL),
(214, 22, 'New ticket created by User #23: jasjkx,m,s ,c...', 'NEW_TICKET', 0, '2025-06-26 03:25:18', NULL),
(215, 22, 'New ticket created by User #25: aQRSTQ7YSK...', 'NEW_TICKET', 0, '2025-06-26 03:25:40', NULL),
(216, 22, 'New ticket created by User #25: TWHAIKMLDMLK...', 'NEW_TICKET', 0, '2025-06-26 03:26:07', NULL),
(217, 25, 'The supervisor for your ticket #76 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-26 03:41:32', 49),
(218, 25, 'Your ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:41:32', 50),
(219, 24, 'Ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:41:32', 50),
(220, 25, 'Your ticket #76 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:41:32', 51),
(221, 24, 'Ticket #76 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:41:32', 51),
(222, 24, 'You have been assigned to ticket #76. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-26 03:41:32', NULL),
(223, 25, 'The supervisor for your ticket #75 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-26 03:45:54', 52),
(224, 25, 'Your ticket #75 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:45:54', 53),
(225, 24, 'Ticket #75 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:45:54', 53),
(226, 25, 'Your ticket #75 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:45:54', 54),
(227, 24, 'Ticket #75 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:45:54', 54),
(228, 24, 'You have been assigned to ticket #75. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-26 03:45:54', NULL),
(229, 22, 'New ticket created by User #25: euyodipoewk9wur48woiejf;l...', 'NEW_TICKET', 0, '2025-06-26 08:19:44', NULL),
(230, 22, 'New User registered: Diluka (nethmitk22@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-27 05:49:09', NULL),
(231, 22, 'New ticket created by User #33: hii...', 'NEW_TICKET', 0, '2025-06-27 05:49:25', NULL),
(232, 22, 'New User registered: admin (admin22@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-27 05:49:45', NULL),
(233, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 06:13:40', 35),
(234, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 06:13:40', 35),
(235, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 06:40:14', 38),
(236, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 07:19:35', 39),
(237, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 07:19:35', 39),
(238, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 07:19:35', 39),
(239, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(240, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(241, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(242, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(243, 34, 'You were mentioned in a comment on ticket #68', 'MENTION', 1, '2025-06-27 08:27:12', 40),
(244, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:28:15', 41),
(245, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:28:15', 41),
(246, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:28:15', 41),
(247, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:30:45', 42),
(248, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:30:45', 42),
(249, 34, 'You were mentioned in a comment on ticket #68', 'MENTION', 1, '2025-06-27 08:30:45', 42),
(250, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:31:00', 43),
(251, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:31:00', 43),
(252, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:31:00', 43),
(253, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:53:33', 44),
(254, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:53:33', 44),
(255, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:53:33', 44),
(256, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 09:06:26', 45),
(257, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 09:06:26', 45),
(258, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 09:06:26', 45),
(259, 25, 'The supervisor for your ticket #77 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-27 10:31:50', 68),
(260, 25, 'Your ticket #77 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:31:50', 69),
(261, 26, 'Ticket #77 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:31:50', 69),
(262, 25, 'Your ticket #77 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:31:50', 70),
(263, 26, 'Ticket #77 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:31:50', 70),
(264, 26, 'You have been assigned to ticket #77. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-27 10:31:50', NULL),
(265, 23, 'The supervisor for your ticket #72 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-27 10:32:14', 71),
(266, 23, 'Your ticket #72 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:32:14', 72),
(267, 27, 'Ticket #72 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:32:14', 72),
(268, 23, 'Your ticket #72 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:32:14', 73),
(269, 27, 'Ticket #72 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:32:14', 73),
(270, 27, 'You have been assigned to ticket #72. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-27 10:32:14', NULL),
(271, 27, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:34:45', 48),
(272, 22, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:34:45', 48),
(273, 27, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:35:04', 49),
(274, 22, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:35:04', 49),
(275, 34, 'You were mentioned in a comment on ticket #72', 'MENTION', 1, '2025-06-27 10:35:04', 49),
(276, 26, 'You were mentioned in a comment on ticket #77', 'MENTION', 0, '2025-06-27 10:46:08', 50),
(277, 25, 'Your ticket #77 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-06-27 11:20:06', 77),
(278, 26, 'Ticket #77 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-06-27 11:20:06', 77),
(279, 27, 'You were mentioned in a comment on ticket #69', 'MENTION', 0, '2025-06-27 11:25:48', 51),
(280, 22, 'You were mentioned in a comment on ticket #69', 'MENTION', 0, '2025-06-27 11:25:48', 51),
(281, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 16:26:09', 59),
(282, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 16:26:09', 59),
(283, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 16:47:01', 60),
(284, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 07:29:37', 61),
(285, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 07:29:37', 61),
(286, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:02', 67),
(287, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:02', 67),
(288, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:37', 68),
(289, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:37', 68),
(290, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:43:02', 69),
(291, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:43:02', 69),
(292, 24, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:46:56', 70),
(293, 27, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:54:16', 71),
(294, 24, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:54:16', 71),
(295, 22, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:54:16', 71),
(296, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:06:57', 72),
(297, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:06:57', 72),
(298, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:06:57', 72),
(299, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:08:29', 73),
(300, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:09:09', 74),
(301, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:09:09', 74),
(302, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:09:09', 74),
(303, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:12:15', 75),
(304, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:12:15', 75),
(305, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:12:15', 75),
(306, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:13:33', 76),
(307, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:13:33', 76),
(308, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:13:33', 76),
(309, 27, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 14:25:14', 81),
(310, 24, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 14:25:14', 81),
(311, 22, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 14:25:14', 81),
(312, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 16:04:57', 82),
(313, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 16:04:57', 82),
(314, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 17:58:28', 83),
(315, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 17:58:28', 83),
(316, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 17:58:28', 83),
(317, 33, 'The supervisor for your ticket #78 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 1, '2025-06-28 18:01:15', 111),
(318, 33, 'Your ticket #78 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 1, '2025-06-28 18:01:15', 112),
(319, 24, 'Ticket #78 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 0, '2025-06-28 18:01:15', 112),
(320, 33, 'Your ticket #78 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 1, '2025-06-28 18:01:15', 113),
(321, 24, 'Ticket #78 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-28 18:01:15', 113),
(322, 24, 'You have been assigned to ticket #78. Status: Resolved, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-28 18:01:15', NULL),
(323, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:03:27', 84),
(324, 22, 'New ticket created by User #33: MS.RANDULA...', 'NEW_TICKET', 0, '2025-06-28 18:13:44', NULL),
(325, 34, 'New ticket created by User #33: MS.RANDULA...', 'NEW_TICKET', 1, '2025-06-28 18:13:44', NULL),
(326, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:36:32', 85),
(327, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:36:32', 85),
(328, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:47:59', 86),
(329, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:47:59', 86),
(330, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:49:03', 87),
(331, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:49:03', 87),
(332, 25, 'Your ticket #71 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:21:10', 118),
(333, 27, 'Ticket #71 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:21:10', 118),
(334, 22, 'New ticket created by User #149: kjnkj...', 'NEW_TICKET', 0, '2025-06-29 04:31:13', NULL),
(335, 34, 'New ticket created by User #149: kjnkj...', 'NEW_TICKET', 1, '2025-06-29 04:31:13', NULL),
(336, 25, 'Your ticket #68 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:57:00', 119),
(337, 24, 'Ticket #68 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:57:00', 119),
(338, 149, 'The supervisor for your ticket #80 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-29 05:12:57', 120),
(339, 149, 'Your ticket #80 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-29 05:12:57', 121),
(340, 24, 'Ticket #80 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-29 05:12:57', 121),
(341, 149, 'Your ticket #80 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-29 05:12:57', 122),
(342, 24, 'Ticket #80 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-29 05:12:57', 122),
(343, 24, 'You have been assigned to ticket #80. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-29 05:12:57', NULL),
(344, 33, 'The supervisor for your ticket #79 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 1, '2025-06-29 05:13:13', 123),
(345, 33, 'Your ticket #79 status has been changed from Pending to Open.', 'STATUS_UPDATE', 1, '2025-06-29 05:13:13', 124),
(346, 24, 'Ticket #79 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-29 05:13:13', 124),
(347, 33, 'Your ticket #79 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 1, '2025-06-29 05:13:13', 125),
(348, 24, 'Ticket #79 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-29 05:13:13', 125),
(349, 24, 'You have been assigned to ticket #79. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-29 05:13:13', NULL),
(350, 23, 'Your ticket #69 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 05:39:55', 126),
(351, 24, 'Ticket #69 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 05:39:55', 126),
(352, 30, 'You were mentioned in a comment on ticket #80', 'MENTION', 0, '2025-06-29 05:46:20', 88),
(353, 24, 'You were mentioned in a comment on ticket #79', 'MENTION', 0, '2025-06-29 17:41:02', 89),
(354, 26, 'You were mentioned in a comment on ticket #79', 'MENTION', 0, '2025-06-29 17:41:02', 89),
(355, 23, 'Your ticket #70 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 03:20:10', 129),
(356, 24, 'Ticket #70 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 03:20:10', 129),
(357, 34, 'New User registered: supervisor (supervisor22@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 03:20:49', NULL),
(358, 34, 'New User registered: user (user22@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 03:22:15', NULL),
(359, 34, 'New ticket created by User #36: Menuka...', 'NEW_TICKET', 0, '2025-06-30 03:22:29', NULL),
(360, 36, 'The supervisor for your ticket #81 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-30 03:22:55', 130),
(361, 36, 'Your ticket #81 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 03:22:55', 131),
(362, 23, 'Ticket #81 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 03:22:55', 131),
(363, 36, 'Your ticket #81 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-30 03:22:55', 132),
(364, 23, 'Ticket #81 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-30 03:22:55', 132),
(365, 23, 'You have been assigned to ticket #81. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 03:22:55', NULL),
(366, 23, 'The supervisor for your ticket #73 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-30 03:23:41', 133),
(367, 23, 'Your ticket #73 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-30 03:23:41', 134),
(368, 35, 'Ticket #73 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-30 03:23:41', 134),
(369, 23, 'Your ticket #73 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-30 03:23:41', 135),
(370, 35, 'Ticket #73 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-30 03:23:41', 135),
(371, 35, 'You have been assigned to ticket #73. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 03:23:41', NULL),
(372, 34, 'You were mentioned in a comment on ticket #73', 'MENTION', 0, '2025-06-30 03:43:03', 90),
(373, 30, 'New ticket created by User #36: jknj...', 'NEW_TICKET', 0, '2025-06-30 03:43:30', NULL),
(374, 34, 'New ticket created by User #36: jknj...', 'NEW_TICKET', 0, '2025-06-30 03:43:30', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, 30, 'adc0945f-1fad-4504-afa7-a77068932ff2', '2025-06-17 13:40:13', '2025-06-17 07:10:13');

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
CREATE TABLE IF NOT EXISTS `ticket` (
  `TicketID` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `AsipiyaSystemID` int DEFAULT NULL,
  `DateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketCategoryID` int DEFAULT NULL,
  `Description` text COLLATE utf8mb4_general_ci,
  `Status` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Priority` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FirstRespondedTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastRespondedTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketDuration` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SupervisorID` text COLLATE utf8mb4_general_ci,
  `UserNote` text COLLATE utf8mb4_general_ci,
  `DueDate` timestamp NULL DEFAULT NULL,
  `Resolution` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Reason` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`TicketID`),
  KEY `UserId` (`UserId`),
  KEY `AsipiyaSystemID` (`AsipiyaSystemID`),
  KEY `TicketCategoryID` (`TicketCategoryID`),
  KEY `fk_supervisor` (`SupervisorID`(250)),
  KEY `TicketID` (`TicketID`)
) ENGINE=MyISAM AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`TicketID`, `UserId`, `AsipiyaSystemID`, `DateTime`, `TicketCategoryID`, `Description`, `Status`, `Priority`, `FirstRespondedTime`, `LastRespondedTime`, `TicketDuration`, `SupervisorID`, `UserNote`, `DueDate`, `Resolution`, `Reason`) VALUES
(77, 25, 9, '2025-06-26 08:19:44', 11, 'euyodipoewk9wur48woiejf;l', 'Resolved', 'Medium', '2025-06-26 08:19:44', '2025-06-27 11:20:06', NULL, '26', NULL, NULL, NULL, NULL),
(68, 25, 9, '2025-06-25 08:54:51', 16, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'In Progress', 'Medium', '2025-06-25 08:54:51', '2025-06-29 04:57:00', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(69, 23, 7, '2025-06-25 11:36:45', 12, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'In Progress', 'Medium', '2025-06-25 11:36:45', '2025-06-29 05:39:55', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(70, 23, 13, '2025-06-25 11:37:26', 13, 'yuzjknkamzyw8kz;q/', 'In Progress', 'Medium', '2025-06-25 11:37:26', '2025-06-30 03:20:10', NULL, '24,26,27,28', NULL, NULL, NULL, NULL),
(71, 25, 13, '2025-06-25 11:37:53', 12, 'fygnlkmak9u8upoqza', 'In Progress', 'Medium', '2025-06-25 11:37:53', '2025-06-29 04:21:10', NULL, '27,26,24', NULL, NULL, NULL, NULL),
(72, 23, 9, '2025-06-26 03:24:40', 11, 'AHUSSUHJKSNKAUsSYI', 'Open', 'Medium', '2025-06-26 03:24:40', '2025-06-27 10:32:14', NULL, '27', NULL, NULL, NULL, NULL),
(73, 23, 9, '2025-06-26 03:24:56', 14, '7dywadijwkajudyyaiudoisajoko', 'Open', 'Medium', '2025-06-26 03:24:56', '2025-06-30 03:23:41', NULL, '35', NULL, NULL, NULL, NULL),
(74, 23, 9, '2025-06-26 03:25:18', 11, 'jasjkx,m,s ,c', 'Reject', 'Medium', '2025-06-26 06:52:07', '2025-06-26 03:25:18', NULL, NULL, NULL, NULL, NULL, 'JDUYD8U'),
(75, 25, 9, '2025-06-26 03:25:40', 11, 'aQRSTQ7YSK', 'In Progress', 'Medium', '2025-06-26 03:25:40', '2025-06-26 03:45:54', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(76, 25, 9, '2025-06-26 03:26:07', 12, 'TWHAIKMLDMLK', 'Open', 'Medium', '2025-06-26 03:26:07', '2025-06-26 03:41:32', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(78, 33, 13, '2025-06-27 05:49:25', 12, 'hii', 'Resolved', 'Medium', '2025-06-27 05:49:25', '2025-06-28 18:01:15', NULL, '24,26', NULL, NULL, NULL, NULL),
(79, 33, 9, '2025-06-28 18:13:44', 12, 'MS.RANDULA', 'Open', 'Medium', '2025-06-28 18:13:44', '2025-06-29 05:13:13', NULL, '24,26', NULL, NULL, NULL, NULL),
(80, 149, 7, '2025-06-29 04:31:13', 12, 'kjnkj', 'Open', 'Medium', '2025-06-29 04:31:13', '2025-06-29 05:12:57', NULL, '24,26,30', NULL, NULL, NULL, NULL),
(81, 36, 9, '2025-06-30 03:22:29', 12, 'Menuka', 'In Progress', 'Low', '2025-06-30 03:22:29', '2025-06-30 03:22:55', NULL, '23,24', NULL, NULL, NULL, NULL),
(82, 36, 9, '2025-06-30 03:43:30', 14, 'jknj', 'Pending', 'Medium', '2025-06-30 03:43:30', '2025-06-30 03:43:30', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticketcategory`
--

DROP TABLE IF EXISTS `ticketcategory`;
CREATE TABLE IF NOT EXISTS `ticketcategory` (
  `TicketCategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`TicketCategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketcategory`
--

INSERT INTO `ticketcategory` (`TicketCategoryID`, `CategoryName`, `Description`, `Status`) VALUES
(11, 'Service Request', 'Request for a new service, feature access, or resource.', 1),
(12, 'Billing or Payment Issue', 'Raise concerns about incorrect charges, invoices, or payment processing problems.', 1),
(13, 'Data Correction/Update', 'Report incorrect or outdated information in the system that needs to be updated or corrected.', 1),
(14, 'Security Concern', 'Report suspicious activity, data breaches, unauthorized access, or password-related concerns.', 1),
(15, 'User Access or Permission Issue', 'Use this to request changes in user roles, access levels, or resolve permission-related problems.', 1),
(16, 'General Complaint', 'Any issue that doesn\'t fit other categories — such as dissatisfaction with support, services.', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ticketchat`
--

DROP TABLE IF EXISTS `ticketchat`;
CREATE TABLE IF NOT EXISTS `ticketchat` (
  `TicketChatID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int DEFAULT NULL,
  `Type` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Note` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UserCustomerID` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  `Path` text COLLATE utf8mb4_general_ci,
  `Role` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TicketChatID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketchat`
--

INSERT INTO `ticketchat` (`TicketChatID`, `TicketID`, `Type`, `Note`, `UserCustomerID`, `UserID`, `Path`, `Role`, `CreatedAt`) VALUES
(1, 31, 'text', 'Hii', NULL, 25, NULL, 'User', '2025-06-23 05:45:45'),
(2, 55, 'text', 'Hii', NULL, 25, NULL, 'User', '2025-06-23 05:45:59'),
(3, 55, 'file', 'C__Windows_System32_cmd.exe 2025-06-18 17-36-', NULL, 25, 'undefined-1750657576015.mp4', 'User', '2025-06-23 05:46:16'),
(4, 61, 'text', 'Hellow', NULL, 23, NULL, 'User', '2025-06-25 04:59:38'),
(5, 69, 'text', 'hello', NULL, 24, NULL, 'Supervisor', '2025-06-27 11:27:36'),
(6, 69, 'text', 'plz can have help for your ', NULL, 24, NULL, 'Supervisor', '2025-06-27 11:28:05');

-- --------------------------------------------------------

--
-- Table structure for table `ticketlog`
--

DROP TABLE IF EXISTS `ticketlog`;
CREATE TABLE IF NOT EXISTS `ticketlog` (
  `TicketLogID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int DEFAULT NULL,
  `DateTime` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Type` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Description` text COLLATE utf8mb4_general_ci,
  `Note` text COLLATE utf8mb4_general_ci,
  `UserID` int DEFAULT NULL,
  `OldValue` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NewValue` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`TicketLogID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketlog`
--

INSERT INTO `ticketlog` (`TicketLogID`, `TicketID`, `DateTime`, `Type`, `Description`, `Note`, `UserID`, `OldValue`, `NewValue`) VALUES
(1, 59, '2025-06-23 20:09:51', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '28'),
(2, 59, '2025-06-23 20:09:51', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(3, 59, '2025-06-23 20:15:24', 'COMMENT', '@Govindi Tharupama Hellooo', NULL, 22, NULL, NULL),
(4, 59, '2025-06-24 11:55:55', 'COMMENT', 'Comment added by Suneth Upendra: \"@Kanchana @Kusala...\"', NULL, 28, NULL, NULL),
(5, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Kanchana', 'Assigned by 28', 28, NULL, '24'),
(6, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Kusala', 'Assigned by 28', 28, NULL, '26'),
(7, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Govindi Tharupama', 'Assigned by 28', 28, NULL, '27'),
(8, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Suneth Upendra', 'Assigned by 28', 28, NULL, '28'),
(9, 63, '2025-06-25 11:48:48', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27,28'),
(10, 63, '2025-06-25 11:50:40', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27,28', '24,26,27,28,30'),
(11, 63, '2025-06-25 11:50:40', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to High', 'Updated by null', 22, 'Medium', 'High'),
(12, 63, '2025-06-25 11:58:18', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27,28,30', '24,26,27,28'),
(13, 63, '2025-06-25 11:58:18', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to In Progress', 'Updated by null', 22, 'Pending', 'In Progress'),
(14, 63, '2025-06-25 11:58:18', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from High to Medium', 'Updated by null', 22, 'High', 'Medium'),
(15, 58, '2025-06-25 13:09:24', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '26,27,28,30'),
(16, 57, '2025-06-25 13:16:55', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '26,27,28'),
(17, 57, '2025-06-25 13:18:20', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '24,26,27'),
(18, 57, '2025-06-25 13:38:15', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27', '26,27,28'),
(19, 58, '2025-06-25 13:43:01', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28,30', '26,27,28'),
(20, 58, '2025-06-25 13:44:34', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '24,26,27'),
(21, 68, '2025-06-25 14:45:40', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(22, 68, '2025-06-25 14:46:28', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27', '26,27,28'),
(23, 68, '2025-06-25 15:10:19', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '24,27'),
(24, 68, '2025-06-25 16:16:42', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,27', '24,26,27'),
(25, 68, '2025-06-25 16:22:00', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27', '24,26,27,28'),
(26, 68, '2025-06-25 16:22:00', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Pending', 'Updated by null', 22, 'Pending', 'Pending'),
(27, 68, '2025-06-25 16:22:00', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(28, 68, '2025-06-25 16:34:01', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27,28', '24,26,27'),
(29, 68, '2025-06-25 16:34:01', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(30, 68, '2025-06-25 16:34:01', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(31, 67, '2025-06-25 16:36:20', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27,28'),
(32, 67, '2025-06-25 16:36:20', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to In Progress', 'Updated by null', 22, 'Pending', 'In Progress'),
(33, 67, '2025-06-25 16:36:20', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to High', 'Updated by null', 22, 'Medium', 'High'),
(34, 66, '2025-06-25 16:39:52', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '27,28'),
(35, 66, '2025-06-25 16:39:53', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(36, 66, '2025-06-25 16:39:53', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(37, 65, '2025-06-25 16:40:03', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(38, 65, '2025-06-25 16:40:03', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Resolved', 'Updated by null', 22, 'Pending', 'Resolved'),
(39, 65, '2025-06-25 16:40:03', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Low', 'Updated by null', 22, 'Medium', 'Low'),
(40, 69, '2025-06-25 17:24:01', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(41, 69, '2025-06-25 17:24:01', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(42, 69, '2025-06-25 17:24:01', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(43, 70, '2025-06-25 17:31:28', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27,28'),
(44, 70, '2025-06-25 17:31:28', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(45, 70, '2025-06-25 17:31:28', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(46, 71, '2025-06-25 18:40:32', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '27,26,24'),
(47, 71, '2025-06-25 18:40:32', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(48, 71, '2025-06-25 18:40:32', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(49, 76, '2025-06-26 09:11:32', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(50, 76, '2025-06-26 09:11:32', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(51, 76, '2025-06-26 09:11:32', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(52, 75, '2025-06-26 09:15:54', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(53, 75, '2025-06-26 09:15:54', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(54, 75, '2025-06-26 09:15:54', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(55, 68, '2025-06-27 11:43:40', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @Govindi...\"', NULL, 34, NULL, NULL),
(56, 68, '2025-06-27 11:45:13', 'COMMENT', 'Comment added by admin: \"tyy...\"', NULL, 34, NULL, NULL),
(57, 68, '2025-06-27 11:45:45', 'COMMENT', 'Comment added by admin: \"kk...\"', NULL, 34, NULL, NULL),
(58, 68, '2025-06-27 12:10:14', 'COMMENT', 'Comment added by admin: \"@Kanchana...\"', NULL, 34, NULL, NULL),
(59, 68, '2025-06-27 12:49:35', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama hii @Kusala              @Kusala...\"', NULL, 34, NULL, NULL),
(60, 68, '2025-06-27 13:57:12', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama hii @Kanchana @Kusala hii@Govindi hii @admin...\"', NULL, 34, NULL, NULL),
(61, 68, '2025-06-27 13:58:15', 'COMMENT', 'Comment added by admin: \"hii @Kusala  @Kanchana hii @Govindi hii @Govindi @Kusala...\"', NULL, 34, NULL, NULL),
(62, 68, '2025-06-27 14:00:45', 'COMMENT', 'Comment added by admin: \"hii @Kusala @admin hii @Kanchana @Kusala...\"', NULL, 34, NULL, NULL),
(63, 68, '2025-06-27 14:01:00', 'COMMENT', 'Comment added by admin: \"@Govindi @Kanchana @Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(64, 68, '2025-06-27 14:23:33', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @Kanchana @Kanchana...\"', NULL, 34, NULL, NULL),
(65, 68, '2025-06-27 14:36:26', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @Kanchana...\"', NULL, 34, NULL, NULL),
(66, 68, '2025-06-27 15:27:34', 'COMMENT', 'Comment added by admin: \"@All Admins hii...\"', NULL, 34, NULL, NULL),
(67, 71, '2025-06-27 15:28:08', 'COMMENT', 'Comment added by admin: \"@All Admins hii...\"', NULL, 34, NULL, NULL),
(68, 77, '2025-06-27 16:01:50', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '26'),
(69, 77, '2025-06-27 16:01:50', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(70, 77, '2025-06-27 16:01:50', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(71, 72, '2025-06-27 16:02:14', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '27'),
(72, 72, '2025-06-27 16:02:14', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(73, 72, '2025-06-27 16:02:14', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(74, 72, '2025-06-27 16:04:45', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @All Admhiiins...\"', NULL, 34, NULL, NULL),
(75, 72, '2025-06-27 16:05:04', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @All Admins @admin @Govindi...\"', NULL, 34, NULL, NULL),
(76, 77, '2025-06-27 16:16:08', 'COMMENT', 'Comment added by admin: \"@Kusala hihii @Kusala            @All Admins           hiioplop...\"', NULL, 34, NULL, NULL),
(77, 77, '2025-06-27 16:50:06', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to Resolved', 'Status updated by User ID: 34', 34, 'Open', 'Resolved'),
(78, 69, '2025-06-27 16:55:48', 'COMMENT', 'Comment added by admin: \"hi@Govindi Tharupama hii...\"', NULL, 34, NULL, NULL),
(79, 71, '2025-06-27 19:14:59', 'COMMENT', 'Comment added by admin: \"kk...\"', NULL, 34, NULL, NULL),
(80, 71, '2025-06-27 19:23:37', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(81, 71, '2025-06-27 19:27:09', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(82, 68, '2025-06-27 21:26:05', 'COMMENT', 'Comment added by admin: \"m...\"', NULL, 34, NULL, NULL),
(83, 68, '2025-06-27 21:31:48', 'COMMENT', 'Comment added by admin: \"jii\"', NULL, 34, NULL, NULL),
(84, 68, '2025-06-27 21:32:06', 'COMMENT', 'Comment added by admin: \"hii\"', NULL, 34, NULL, NULL),
(85, 68, '2025-06-27 21:44:07', 'COMMENT', 'Comment added by admin: \"\"', NULL, 34, NULL, NULL),
(86, 68, '2025-06-27 21:56:09', 'COMMENT', 'Comment added by admin: \"huu @Govindi Tharupama\"', NULL, 34, NULL, NULL),
(87, 68, '2025-06-27 22:17:01', 'COMMENT', 'Comment added by admin: \"@Kanchana\"', NULL, 34, NULL, NULL),
(88, 68, '2025-06-28 12:59:37', 'COMMENT', 'Comment added by admin: \"@All Admins  hi@Govindi Tharupama\"', NULL, 34, NULL, NULL),
(89, 68, '2025-06-28 13:01:22', 'COMMENT', 'Comment added by admin: \"\"', NULL, 34, NULL, NULL),
(90, 68, '2025-06-28 13:17:58', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(91, 68, '2025-06-28 13:18:09', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(92, 68, '2025-06-28 13:19:48', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(93, 68, '2025-06-28 13:40:13', 'COMMENT', 'Comment added by admin: \"f...\"', NULL, 34, NULL, NULL),
(94, 68, '2025-06-28 13:56:02', 'COMMENT', 'Comment added by admin: \"hi @Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(95, 68, '2025-06-28 13:56:36', 'COMMENT', 'Comment added by admin: \"hii @Govindi Tharupama @All Admins hii helo...\"', NULL, 34, NULL, NULL),
(96, 68, '2025-06-28 14:13:02', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama  hi @Govindi Tharupama hi...\"', NULL, 34, NULL, NULL),
(97, 71, '2025-06-28 14:16:56', 'COMMENT', 'Comment added by admin: \"@Kanchana...\"', NULL, 34, NULL, NULL),
(98, 71, '2025-06-28 14:24:16', 'COMMENT', 'Comment added by admin: \"iii @Govindi Tharupama jiojk@Kanchana jkkio@Kanchana ge huu@Govindi...\"', NULL, 34, NULL, NULL),
(99, 68, '2025-06-28 14:36:57', 'COMMENT', 'Comment added by admin: \"jj@Govindi Tharupama ji@Kanchana hr@admin...\"', NULL, 34, NULL, NULL),
(100, 68, '2025-06-28 14:38:29', 'COMMENT', 'Comment added by admin: \"kjkhk@Kanchana jki@admin kji...\"', NULL, 34, NULL, NULL),
(101, 68, '2025-06-28 14:39:09', 'COMMENT', 'Comment added by admin: \"ioi @Govindi Tharupama jiu@Govindi Tharupama huury88rhhui@Kanchana...\"', NULL, 34, NULL, NULL),
(102, 68, '2025-06-28 14:42:15', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama  huu @Kanchana...\"', NULL, 34, NULL, NULL),
(103, 68, '2025-06-28 14:43:33', 'COMMENT', 'Comment added by admin: \"hiui @Govindi Tharupama huib ejh ejhjh @All Admins  jiiii  hiii@Kanchana huuihknmk,kk k k k k jiyijy...\"', NULL, 34, NULL, NULL),
(104, 71, '2025-06-28 19:30:13', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(105, 71, '2025-06-28 19:42:43', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(106, 71, '2025-06-28 19:42:59', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(107, 71, '2025-06-28 19:44:07', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(108, 71, '2025-06-28 19:55:14', 'COMMENT', 'Comment added by admin: \"hu @Govindi Tharupama   hdjhjchdki    h@Kanchana hififosnfmvnmmm     uriuofff@Govindi mcffc,flkjkfjj...\"', NULL, 34, NULL, NULL),
(109, 68, '2025-06-28 21:34:57', 'COMMENT', 'Comment added by admin: \"jkj @Govindi Tharupama ddddddd@Govindi dd@Govindi ddd@admin...\"', NULL, 34, NULL, NULL),
(110, 68, '2025-06-28 23:28:28', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama jooiighgytrryrrtrrjhbj    gy@Govindi Tharupama bhjbjhjbh ghg@Kanchana yguygyu...\"', NULL, 34, NULL, NULL),
(111, 78, '2025-06-28 23:31:15', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '24,26'),
(112, 78, '2025-06-28 23:31:15', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Resolved', 'Updated by null', 34, 'Pending', 'Resolved'),
(113, 78, '2025-06-28 23:31:15', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(114, 68, '2025-06-28 23:33:27', 'COMMENT', 'Comment added by admin: \"HII@Kanchana  HII   @Kanchana...\"', NULL, 34, NULL, NULL),
(115, 68, '2025-06-29 00:06:32', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama jjj,f,m f,mf fmf,d fm,@Govindi flkmrl@admin...\"', NULL, 34, NULL, NULL),
(116, 68, '2025-06-29 00:17:59', 'COMMENT', 'Comment added by admin: \"ji@Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(117, 68, '2025-06-29 00:19:03', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama hi @Govindi Tharupama hi@All Admins hui@Govindi hjhh@Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(118, 71, '2025-06-29 09:51:10', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(119, 68, '2025-06-29 10:27:00', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(120, 80, '2025-06-29 10:42:57', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '24,26,30'),
(121, 80, '2025-06-29 10:42:57', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(122, 80, '2025-06-29 10:42:57', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(123, 79, '2025-06-29 10:43:13', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '24,26'),
(124, 79, '2025-06-29 10:43:13', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(125, 79, '2025-06-29 10:43:13', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(126, 69, '2025-06-29 11:09:55', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(127, 80, '2025-06-29 11:16:20', 'COMMENT', 'Comment added by admin: \"HI @Kariyawasam    HAIEIOE...\"', NULL, 34, NULL, NULL),
(128, 79, '2025-06-29 23:11:02', 'COMMENT', 'Comment added by admin: \"@Kanchana HII @Kusala  HII @admin...\"', NULL, 34, NULL, NULL),
(129, 70, '2025-06-30 08:50:10', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(130, 81, '2025-06-30 08:52:55', 'SUPERVISOR_CHANGE', 'supervisor (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 35, NULL, '23,24'),
(131, 81, '2025-06-30 08:52:55', 'STATUS_CHANGE', 'supervisor (Supervisor) Status changed from Pending to In Progress', 'Updated by null', 35, 'Pending', 'In Progress'),
(132, 81, '2025-06-30 08:52:55', 'PRIORITY_CHANGE', 'supervisor (Supervisor) Priority changed from Medium to Low', 'Updated by null', 35, 'Medium', 'Low'),
(133, 73, '2025-06-30 08:53:41', 'SUPERVISOR_CHANGE', 'supervisor (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 35, NULL, '35'),
(134, 73, '2025-06-30 08:53:41', 'STATUS_CHANGE', 'supervisor (Supervisor) Status changed from Pending to Open', 'Updated by null', 35, 'Pending', 'Open'),
(135, 73, '2025-06-30 08:53:41', 'PRIORITY_CHANGE', 'supervisor (Supervisor) Priority changed from Medium to Medium', 'Updated by null', 35, 'Medium', 'Medium'),
(136, 73, '2025-06-30 09:13:03', 'COMMENT', 'Comment added by supervisor: \"hi @admin  hello...\"', NULL, 35, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `userid`
--

DROP TABLE IF EXISTS `userid`;
CREATE TABLE IF NOT EXISTS `userid` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `UserName` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactNo` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Branch` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`UserId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comment_reply` FOREIGN KEY (`ReplyToCommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE;

--
-- Constraints for table `comment_attachments`
--
ALTER TABLE `comment_attachments`
  ADD CONSTRAINT `fk_comment_attachments_comment` FOREIGN KEY (`CommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE;

--
-- Constraints for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`CommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `appuser` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `appuser` (`UserID`) ON DELETE CASCADE;
--
-- Database: `ticketmanager`
--
CREATE DATABASE IF NOT EXISTS `ticketmanager` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `ticketmanager`;

-- --------------------------------------------------------

--
-- Table structure for table `appuser`
--

DROP TABLE IF EXISTS `appuser`;
CREATE TABLE IF NOT EXISTS `appuser` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `FullName` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Role` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Phone` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ProfileImagePath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appuser`
--

INSERT INTO `appuser` (`UserID`, `FullName`, `Email`, `Password`, `Role`, `Phone`, `ProfileImagePath`) VALUES
(23, 'Tharupama', 'tharupama@gmail.com', '$2b$10$D17AdHlh7Z.pC3HC9PAUCebEeOEhhqcd2apigKUHsO7QJ9owOBCBe', 'Supervisor', '01234023145', NULL),
(24, 'Kanchana', 'kanchana@gmail.com', '$2b$10$gwJZcNmFH/wy/O9q3yaa9OOZoS8wtvkLa76sVWCYPgejL/TlEevte', 'Supervisor', '01123654789', NULL),
(25, 'Rajitha', 'rajitha@gmail.com', '$2b$10$qclOf2oKmE1c4eMQne5/rOKrT/nQL9ZwTN81enShEkWrnIX3vgT/C', 'User', '0123654789', NULL),
(26, 'Kusala', 'kusal@gmail.com', '$2b$10$E/pnrgzHBA2SXT8kgFz11uElI0M7Uob9OJOYtFFkA2EAMLwqoB9DW', 'Supervisor', '01123547896', NULL),
(28, 'Suneth Upendra', 'govindikariyawasam@gmail.com', '$2b$10$3rPcZBal2CTGz1GNR3oNHO6k5KnIz310FNb9637g.mefr1aX1N0Re', 'Supervisor', '0712254144', NULL),
(30, 'Nethmi', 'kariyawasam@gmail.com', '$2b$10$zC3MimzbhtPHCSoFOkaK7OgdSHgSoqHdxRoghGqfL8Q39eTsKFA7W', 'Admin', '0775623589', NULL),
(31, 'Kariyawasam', 'kariyawasamkusal@gmail.com', '$2b$10$AvGZQO46YD6R32mLyLgsTukhUqZT9MiJwUzWWKz9QzYcCpE1FaUl6', 'Supervisor', '01235861253', NULL),
(33, 'Diluka', 'nethmitk22@gmail.com', '$2b$10$Ww9RXhIPRBCCLHbgyK3oVuejmQWQzJ7ngznZJR1dQBPrmt7.Zi/9y', 'User', '0774665078', NULL),
(34, 'admin', 'admin22@gmail.com', '$2b$10$7ltjJSMxBSg.Kg6vMCc3sOihNyGIus8Gbr5M8ZnnGfn25VzE4xEOG', 'Admin', '0777858521', NULL),
(35, 'supervisor', 'supervisor22@gmail.com', '$2b$10$kny78UAIx0JCKcTASf4UP.wk/zw6.Bl8m.gTe0I5c/iM2zNVLioua', 'Supervisor', '0761211070', NULL),
(36, 'user', 'user22@gmail.com', '$2b$10$O/BVkiMwnRViRXR5trvPsO7JccjdC3OQuf2HbBV0RXjAS9vb66m3S', 'User', '0774665078', NULL),
(37, 'THALIKORALAGE NETHMI SANDEEPANIE', 'NETHMI22@gmail.com', '$2b$10$bMjn0et0NR2DKEaMawNbbeA6VYG0jwWzaXkqnldXV19AWg1Xk6plS', 'User', '0761211070', NULL),
(38, 'supervisor two', 'sup@gmail.com', '$2b$10$csZUOsBmRVp4T6D3PfKkwufDAKveFnUO68Bo1VLup7airnVx5gAY.', 'Supervisor', '0777858521', NULL),
(119, 'Nethmi Tharuka', 'nethmi@technova.com', '$2b$10$2H8ZEmVuftCF6PdgRx/9Ee8OYA684rU5dRo2E/7Rkb/6DjLVmxnyG', 'User', '0774665076', NULL),
(120, 'Sasindu Perera', 'sasindu@bluesky.com', '$2b$10$ODt5oD1pNV5Ypoe2VMzDyeQsd9oSwtQ3slrxlAzrkqL.YujnrNC8W', 'Supervisor', '0774665076', NULL),
(121, 'Ishara Jayasooriya', 'ishara@greenwave.com', '$2b$10$hXdhIBaZCmaQ/NWfPk.GYOdeVEnjjc0c/cjuNiw6iMpxjoefvIH3y', 'Admin', '0774665076', 'profile_images/121-1750883465725.jpeg'),
(145, 'Dilshan Fernando	', 'dilshan.fernando@technova.com', '$2b$10$evb8KUOyqf/WfvS1MxnlZuZVN5T2bJ87rxY1eVXxfdMMy9IbQNZGa', 'Admin', '0774665076', NULL),
(146, 'Anjali Wijesinghe	', 'anjali.wijesinghe@bluesky.com', '$2b$10$Z7VexXg5Ry7ZtVJIm5lMDOGEibm3Dya19m8Qhu.GQNvYc0TLnnOH2', 'Supervisor', '0774665075', NULL),
(147, 'Ishani Perera	', 'ishani.perera@bluesky.com', '$2b$10$3wvrTU1R/JC5WXRUTisLB.T4iz3SrtPdgJtE78nvVifYd3Ga91G12', 'User', '0774665078', NULL),
(148, 'Praghe saman weeralkon	', 'pradeep.jayasinghe@bluesky.com', '$2b$10$F1psY0BBnw9H8nFeK7YH/.ZjwlL1t6AVY4SS9YXdHNRtZ2BjuF01G', 'Supervisor', '0777858521', NULL),
(149, ' Thilina Rathnayake	', 'thilina.rathnayake@technova.com', '$2b$10$1DdTSW0sWBdape0p8CZUMOgII4qgW4WbegJ0aU4VMiQ0y8AgJCtqy', 'User', '0777858521', NULL),
(150, 'Dilani Kumari	', 'k9Ddilani.kumari@bluesky.com', '$2b$10$rZaXwI.6OUYsepCDz6i9GectDSiGcTIirxGBPIIGvEmyDB54KX5UW', 'User', '0774665076', NULL),
(151, 'sanduni fernando ', 'sanduni.fernando@bluesky.com', '$2b$10$jKzeDpjcY2c3VU82KJOg8uGbTTUefYYlQjAHUzH9eU1VaTbB6o93u', 'Admin', '0777858521', NULL),
(152, 'Dilani Kumari	', 'dilani@greenwave.com', '$2b$10$w5QS0MvtzTXRCLahZnZcWutsRxqaRe216zicHLeTGm1BL/WXKmTBG', 'User', '0778569203', NULL),
(153, 'nethmi thalokoralage', 'nethmi@greenwave.com', '$2b$10$8djkFETVvbMGOvdHMJXhs.gJv7oT.jvaRxVOMxdCPW9xnzUBBqFF2', 'User', '0761211070', NULL),
(154, 'ruwani', 'ruwani@greenwave.com', '$2b$10$DnFkKjpUYpC2OUooJdxFe.JlIpuAEU7jlg9vBkh1j7TeWD05WkeWG', 'User', '0774665075', NULL),
(155, 'neha kakar', 'nethmitk222@gmail.com', '$2b$10$2nEpnHEwzRfN1LKY/A/F7eFMkrfXDqT7bj.nJfuQR24SJdxHoMrbm', 'User', '0777858521', NULL),
(156, 'kaweesha gangani', 'kawee@technova.com', '$2b$10$SFYjpZ.Fl/hStb1AgsLHr.WsJnbzPCdI9XbYr41orkZcnE3qZT9fS', 'User', '0777858521', NULL),
(157, 'niroshan perera', 'niroshan@greenwave.com', '$2b$10$/Caunby9wvdQC4YdsquT6OJjJwmAhP8nNcd2H14F2Og9b/nVntps6', 'User', '0774665078', NULL),
(158, 'hashini dilhara', 'hashii@gmail.com', '$2b$10$0Tr4dAMDlJ4f1nmvphBmzOe/CYeomciwO6l5ASIfuIpRbPV5BakJq', 'User', '0777858521', NULL),
(159, 'dumisha abeyakon', 'dumi@gmail.com', '$2b$10$chPtfDRDF9uQsrzy9dtyo.xo/VIw9P1SsqP/HH9YKPsUIZ3Lwo35.', 'User', '0761211070', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asipiyasystem`
--

DROP TABLE IF EXISTS `asipiyasystem`;
CREATE TABLE IF NOT EXISTS `asipiyasystem` (
  `AsipiyaSystemID` int NOT NULL AUTO_INCREMENT,
  `SystemName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`AsipiyaSystemID`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `asipiyasystem`
--

INSERT INTO `asipiyasystem` (`AsipiyaSystemID`, `SystemName`, `Description`, `Status`) VALUES
(4, 'Help Desk Portal', 'A web-based platform to manage IT support tic', 1),
(5, 'Inventory Management System', 'Tracks and manages product stock levels, orde', 1),
(6, 'CRM Platform', 'Helps manage customer relationships, sales, a', 1),
(7, 'Library Management System', 'A system to manage book inventory, borrowing/returning processes, member registrations, and overdue alerts in a library.', 1),
(8, 'Project Tracking System', 'Helps teams track project timelines, delivera', 1),
(9, 'Student Attendance System', 'Tracks student attendance using barcodes, RFID, or face recognition, generating reports for teachers and parents.', 1),
(10, 'Learning Management System', 'Supports online course delivery, student trac', 1),
(11, 'Hospital Management System', 'Handles patient records, appointments, and me', 1),
(12, 'Finatiol management system', 'finatioal steps updated', 1),
(13, 'Inventory Management System', 'Keeps track of stock levels, product orders, deliveries, and sales for businesses managing physical goods.', 1),
(22, 'cloud report system', 'in the cloud all details are finised', 1),
(23, 'book management system', 'new user experience  with good experience', 1);

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `ClientID` int NOT NULL AUTO_INCREMENT,
  `CompanyName` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactNo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactPersonEmail` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `MobileNo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  PRIMARY KEY (`ClientID`),
  KEY `fk_user` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`ClientID`, `CompanyName`, `ContactNo`, `ContactPersonEmail`, `MobileNo`, `UserID`) VALUES
(1, 'Asipiya', '091225638', 'asipiya@gmail.com', '022356987', NULL),
(7, 'Keels Super', '01123356898', 'rajitha@gmail.com', '023568', 25),
(6, 'Kusal Oil Mart', '0770568545', 'kariyawasamkusal@gmail.com', '0112564789', 30),
(5, 'zc', 'xdfh', 'ghd@gmail.com', 'hfy', NULL),
(8, 'Cargills Super', '0112356984', 'tharupama@gmail.com', '07756023185', 23),
(3, 'TechNova Pvt Ltd', '0112233445', 'ishara@greenwave.com', '0771234567', 1),
(4, 'BlueSky Solutions', '0115566778', 'dilani@greenwave.com', '0779876543', 2),
(13, 'TechNova Pvt Ltd', '0112233445', 'ishara@greenwave.com', '0771234567', 1),
(14, 'BlueSky Solutions', '0115566778', 'dilani@greenwave.com', '0779876543', 2),
(15, 'GreenWave Enterprises', '0116677889', 'nethmi@technova.com', '0763456789', 153),
(16, 'TechNova Pvt Ltd', '0112233445', 'thilina.rathnayake@technova.com', '0771234567', 119),
(17, 'BlueSky Solutions', '0115566778', 'k9Ddilani.kumari@bluesky.com', '0779876543', 153),
(18, 'GreenWave Enterprises', '0116677889', 'sanduni.fernando@bluesky.com', '0763456789', 121),
(19, 'asipiya priting company', '0778569865', 'nethmitk22@gmail.com', '0774665078', 155),
(20, 'ruwan book shop', '0778569865', 'dumi@gmail.com', '0774665075', 159),
(21, 'sarasawi book shop', '0778569865', 'dumi@gmail.com', '0774665075', 159);

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `CommentID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int NOT NULL,
  `UserID` int NOT NULL,
  `CommentText` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Mentions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `ReplyToCommentID` int DEFAULT NULL,
  `AttachmentFilePath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AttachmentFileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AttachmentFileType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`CommentID`),
  KEY `fk_comment_ticket` (`TicketID`),
  KEY `fk_comment_user` (`UserID`),
  KEY `fk_comment_reply` (`ReplyToCommentID`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`CommentID`, `TicketID`, `UserID`, `CommentText`, `CreatedAt`, `Mentions`, `ReplyToCommentID`, `AttachmentFilePath`, `AttachmentFileName`, `AttachmentFileType`) VALUES
(34, 59, 28, '@Kanchana @Kusala', '2025-06-24 06:25:55', '24,26', NULL, NULL, NULL, NULL),
(35, 68, 34, '@Govindi Tharupama @Govindi', '2025-06-27 06:13:40', '27,22', NULL, 'uploads/comment_attachments/comment-1751004820533-138365611.pdf', 'daily progress-01.pdf', 'application/pdf'),
(36, 68, 34, 'tyy', '2025-06-27 06:15:13', NULL, NULL, 'uploads/comment_attachments/comment-1751004913938-611390567.pdf', 'daily progress-01.pdf', 'application/pdf'),
(37, 68, 34, 'kk', '2025-06-27 06:15:45', NULL, NULL, 'uploads/comment_attachments/comment-1751004945087-781769649.mp4', 'Black Playful Animated Welcome Channel Youtube Intro Video.mp4', 'video/mp4'),
(38, 68, 34, '@Kanchana', '2025-06-27 06:40:14', '24', NULL, 'uploads/comment_attachments/comment-1751006414941-630662392.pdf', 'daily progress-01.pdf', 'application/pdf'),
(39, 68, 34, '@Govindi Tharupama hii @Kusala              @Kusala', '2025-06-27 07:19:35', '27,22,26', NULL, 'uploads/comment_attachments/comment-1751008775244-415167991.pdf', 'My-Internship-Experience-at-ETL-Bricks-Pvt-Ltd.pptx.pdf', 'application/pdf'),
(40, 68, 34, '@Govindi Tharupama hii @Kanchana @Kusala hii@Govindi hii @admin', '2025-06-27 08:27:12', '27,24,22,26,34', NULL, NULL, NULL, NULL),
(41, 68, 34, 'hii @Kusala  @Kanchana hii @Govindi hii @Govindi @Kusala', '2025-06-27 08:28:15', '24,22,26', NULL, NULL, NULL, NULL),
(42, 68, 34, 'hii @Kusala @admin hii @Kanchana @Kusala', '2025-06-27 08:30:45', '24,26,34', NULL, NULL, NULL, NULL),
(43, 68, 34, '@Govindi @Kanchana @Govindi Tharupama', '2025-06-27 08:31:00', '27,24,22', NULL, NULL, NULL, NULL),
(44, 68, 34, '@Govindi Tharupama @Kanchana @Kanchana', '2025-06-27 08:53:33', '27,24,22', NULL, NULL, NULL, NULL),
(45, 68, 34, '@Govindi Tharupama @Kanchana', '2025-06-27 09:06:26', '27,24,22', NULL, 'uploads/comment_attachments/comment-1751015186037-447324711.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(46, 68, 34, '@All Admins hii', '2025-06-27 09:57:34', NULL, NULL, NULL, NULL, NULL),
(47, 71, 34, '@All Admins hii', '2025-06-27 09:58:08', NULL, NULL, NULL, NULL, NULL),
(48, 72, 34, '@Govindi Tharupama @All Admhiiins', '2025-06-27 10:34:45', '27,22', NULL, 'uploads/comment_attachments/comment-1751020485390-483232567.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(49, 72, 34, '@Govindi Tharupama @All Admins @admin @Govindi', '2025-06-27 10:35:04', '27,22,34', NULL, NULL, NULL, NULL),
(50, 77, 34, '@Kusala hihii @Kusala            @All Admins           hiioplop', '2025-06-27 10:46:08', '26', NULL, NULL, NULL, NULL),
(51, 69, 34, 'hi@Govindi Tharupama hii', '2025-06-27 11:25:48', '27,22', NULL, NULL, NULL, NULL),
(52, 71, 34, 'kk', '2025-06-27 13:44:59', NULL, NULL, 'uploads/comment_attachments/comment-1751031899792-277892160.pdf', 'QA.pdf', 'application/pdf'),
(53, 71, 34, '@All Admins', '2025-06-27 13:53:37', NULL, NULL, 'uploads/comment_attachments/comment-1751032417068-520884361.pdf', 'QA.pdf', 'application/pdf'),
(54, 71, 34, '@All Admins', '2025-06-27 13:57:09', NULL, NULL, 'uploads/comment_attachments/comment-1751032629044-514756967.txt', 'read.txt', 'text/plain'),
(55, 68, 34, 'm', '2025-06-27 15:56:05', NULL, NULL, NULL, NULL, NULL),
(56, 68, 34, 'jii', '2025-06-27 16:01:48', NULL, NULL, NULL, NULL, NULL),
(57, 68, 34, 'hii', '2025-06-27 16:02:06', NULL, NULL, NULL, NULL, NULL),
(58, 68, 34, '', '2025-06-27 16:14:07', NULL, NULL, NULL, NULL, NULL),
(59, 68, 34, 'huu @Govindi Tharupama', '2025-06-27 16:26:09', '27,22', NULL, NULL, NULL, NULL),
(60, 68, 34, '@Kanchana', '2025-06-27 16:47:01', '24', NULL, NULL, NULL, NULL),
(61, 68, 34, '@All Admins  hi@Govindi Tharupama', '2025-06-28 07:29:37', '27,22', NULL, NULL, NULL, NULL),
(62, 68, 34, '', '2025-06-28 07:31:22', NULL, NULL, NULL, NULL, NULL),
(63, 68, 34, '@All Admins', '2025-06-28 07:47:58', NULL, NULL, NULL, NULL, NULL),
(64, 68, 34, '@All Admins', '2025-06-28 07:48:09', NULL, NULL, NULL, NULL, NULL),
(65, 68, 34, '', '2025-06-28 07:49:48', NULL, NULL, NULL, NULL, NULL),
(66, 68, 34, 'f', '2025-06-28 08:10:13', NULL, NULL, NULL, NULL, NULL),
(67, 68, 34, 'hi @Govindi Tharupama', '2025-06-28 08:26:02', '27,22', NULL, NULL, NULL, NULL),
(68, 68, 34, 'hii @Govindi Tharupama @All Admins hii helo', '2025-06-28 08:26:36', '27,22', NULL, NULL, NULL, NULL),
(69, 68, 34, '@Govindi Tharupama  hi @Govindi Tharupama hi', '2025-06-28 08:43:02', '27,22', NULL, NULL, NULL, NULL),
(70, 71, 34, '@Kanchana', '2025-06-28 08:46:56', '24', NULL, NULL, NULL, NULL),
(71, 71, 34, 'iii @Govindi Tharupama jiojk@Kanchana jkkio@Kanchana ge huu@Govindi', '2025-06-28 08:54:16', '27,24,22', NULL, NULL, NULL, NULL),
(72, 68, 34, 'jj@Govindi Tharupama ji@Kanchana hr@admin', '2025-06-28 09:06:57', '27,24,22,34', NULL, NULL, NULL, NULL),
(73, 68, 34, 'kjkhk@Kanchana jki@admin kji', '2025-06-28 09:08:28', '24,34', NULL, NULL, NULL, NULL),
(74, 68, 34, 'ioi @Govindi Tharupama jiu@Govindi Tharupama huury88rhhui@Kanchana', '2025-06-28 09:09:09', '27,24,22', NULL, NULL, NULL, NULL),
(75, 68, 34, '@Govindi Tharupama  huu @Kanchana', '2025-06-28 09:12:15', '27,24,22', NULL, NULL, NULL, NULL),
(76, 68, 34, 'hiui @Govindi Tharupama huib ejh ejhjh @All Admins  jiiii  hiii@Kanchana huuihknmk,kk k k k k jiyijy  gjg g gg gjii9ynjhih', '2025-06-28 09:13:33', '27,24,22', NULL, NULL, NULL, NULL),
(77, 71, 34, '', '2025-06-28 14:00:13', NULL, NULL, NULL, NULL, NULL),
(78, 71, 34, '', '2025-06-28 14:12:43', NULL, NULL, NULL, NULL, NULL),
(79, 71, 34, '', '2025-06-28 14:12:59', NULL, NULL, NULL, NULL, NULL),
(80, 71, 34, '', '2025-06-28 14:14:07', NULL, NULL, NULL, NULL, NULL),
(81, 71, 34, 'hu @Govindi Tharupama   hdjhjchdki    h@Kanchana hififosnfmvnmmm     uriuofff@Govindi mcffc,flkjkfjjjkbbb@Govindi ty', '2025-06-28 14:25:14', '27,24,22', NULL, NULL, NULL, NULL),
(82, 68, 34, 'jkj @Govindi Tharupama ddddddd@Govindi dd@Govindi ddd@admin', '2025-06-28 16:04:57', '27,22,34', NULL, NULL, NULL, NULL),
(83, 68, 34, '@Govindi Tharupama jooiighgytrryrrtrrjhbj    gy@Govindi Tharupama bhjbjhjbh ghg@Kanchana yguygyu', '2025-06-28 17:58:28', '27,24,22', NULL, NULL, NULL, NULL),
(84, 68, 34, 'HII@Kanchana  HII   @Kanchana', '2025-06-28 18:03:27', '24', NULL, NULL, NULL, NULL),
(85, 68, 34, '@Govindi Tharupama jjj,f,m f,mf fmf,d fm,@Govindi flkmrl@admin', '2025-06-28 18:36:32', '27,22,34', NULL, NULL, NULL, NULL),
(86, 68, 34, 'ji@Govindi Tharupama', '2025-06-28 18:47:59', '27,22', NULL, NULL, NULL, NULL),
(87, 68, 34, '@Govindi Tharupama hi @Govindi Tharupama hi@All Admins hui@Govindi hjhh@Govindi Tharupama', '2025-06-28 18:49:02', '27,22', NULL, NULL, NULL, NULL),
(88, 80, 34, 'HI @Kariyawasam    HAIEIOE', '2025-06-29 05:46:20', '30', NULL, NULL, NULL, NULL),
(89, 79, 34, '@Kanchana HII @Kusala  HII @admin', '2025-06-29 17:41:02', '24,26,34', NULL, NULL, NULL, NULL),
(90, 72, 35, 'hi @admin   hi @supervisor     hi', '2025-06-30 03:39:38', '35,34', NULL, NULL, NULL, NULL),
(91, 73, 35, '@admin lcdkd    @Dilshan Fernando', '2025-07-02 06:49:51', '145,34', NULL, NULL, NULL, NULL),
(92, 73, 35, 'hi @Dilshan Fernando	 hii@supervisor hello', '2025-07-02 06:50:30', '145,35', NULL, NULL, NULL, NULL),
(93, 73, 35, '@admin   hii   @admin', '2025-07-02 06:50:44', '34', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `comment_attachments`
--

DROP TABLE IF EXISTS `comment_attachments`;
CREATE TABLE IF NOT EXISTS `comment_attachments` (
  `AttachmentID` int NOT NULL AUTO_INCREMENT,
  `CommentID` int NOT NULL,
  `FilePath` varchar(255) NOT NULL,
  `FileName` varchar(255) NOT NULL,
  `FileType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`AttachmentID`),
  KEY `fk_comment_attachments_comment` (`CommentID`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `comment_attachments`
--

INSERT INTO `comment_attachments` (`AttachmentID`, `CommentID`, `FilePath`, `FileName`, `FileType`) VALUES
(1, 56, 'uploads/comment_attachments/comment-1751040108850-167972380.pdf', 'QA.pdf', 'application/pdf'),
(2, 57, 'uploads/comment_attachments/comment-1751040126746-580801184.pdf', 'QA.pdf', 'application/pdf'),
(3, 57, 'uploads/comment_attachments/comment-1751040126779-744833589.txt', 'read.txt', 'text/plain'),
(4, 58, 'uploads/comment_attachments/comment-1751040847504-375065361.txt', 'read.txt', 'text/plain'),
(5, 58, 'uploads/comment_attachments/comment-1751040847505-723248292.pdf', 'QA.pdf', 'application/pdf'),
(6, 59, 'uploads/comment_attachments/comment-1751041569175-760427249.pdf', 'QA.pdf', 'application/pdf'),
(7, 59, 'uploads/comment_attachments/comment-1751041569189-72344829.txt', 'read.txt', 'text/plain'),
(8, 60, 'uploads/comment_attachments/comment-1751042821263-960406679.txt', 'read.txt', 'text/plain'),
(9, 60, 'uploads/comment_attachments/comment-1751042821264-626872930.pdf', 'QA.pdf', 'application/pdf'),
(10, 61, 'uploads/comment_attachments/comment-1751095777502-436419240.pdf', 'QA.pdf', 'application/pdf'),
(11, 61, 'uploads/comment_attachments/comment-1751095777526-134465266.txt', 'read.txt', 'text/plain'),
(12, 62, 'uploads/comment_attachments/comment-1751095882902-698304295.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(13, 62, 'uploads/comment_attachments/comment-1751095882941-91804448.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(14, 62, 'uploads/comment_attachments/comment-1751095882942-660447842.png', 'download.png', 'image/png'),
(15, 63, 'uploads/comment_attachments/comment-1751096878850-606409309.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(16, 64, 'uploads/comment_attachments/comment-1751096889788-236557791.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(17, 64, 'uploads/comment_attachments/comment-1751096889789-36487303.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(18, 65, 'uploads/comment_attachments/comment-1751096988458-245043521.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(19, 65, 'uploads/comment_attachments/comment-1751096988461-586986736.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(20, 66, 'uploads/comment_attachments/comment-1751098213423-408999237.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(21, 67, 'uploads/comment_attachments/comment-1751099162709-986718381.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(22, 68, 'uploads/comment_attachments/comment-1751099196903-900409199.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(23, 68, 'uploads/comment_attachments/comment-1751099196949-47728906.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(24, 68, 'uploads/comment_attachments/comment-1751099196955-942849053.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(25, 68, 'uploads/comment_attachments/comment-1751099196956-633565351.mp4', '365266383627489286.mp4', 'video/mp4'),
(26, 68, 'uploads/comment_attachments/comment-1751099196973-38966459.webp', 'DALLÂ·E 2025-03-07 22.33.22 - A modern, minimalist logo featuring a coder-themed icon with a marketing strategy color scheme. The design should include a sleek, abstract representa.webp', 'image/webp'),
(27, 73, 'uploads/comment_attachments/comment-1751101708837-398829437.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(28, 75, 'uploads/comment_attachments/comment-1751101935163-986613581.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(29, 77, 'uploads/comment_attachments/comment-1751119213418-673555722.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(30, 77, 'uploads/comment_attachments/comment-1751119213419-717852034.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(31, 78, 'uploads/comment_attachments/comment-1751119963111-709004861.pdf', 'SAL_Syl_new1.pdf', 'application/pdf'),
(32, 79, 'uploads/comment_attachments/comment-1751119979148-957430505.pdf', 'SAL_Syl_new1.pdf', 'application/pdf'),
(33, 79, 'uploads/comment_attachments/comment-1751119979153-164775302.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(34, 80, 'uploads/comment_attachments/comment-1751120047954-142068742.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(35, 80, 'uploads/comment_attachments/comment-1751120047954-362049022.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(36, 80, 'uploads/comment_attachments/comment-1751120047971-678662042.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(37, 80, 'uploads/comment_attachments/comment-1751120047974-235778427.txt', 'manage.txt', 'text/plain'),
(38, 80, 'uploads/comment_attachments/comment-1751120047975-666524319.txt', 'import { useState, useEffect, useRe.txt', 'text/plain'),
(39, 80, 'uploads/comment_attachments/comment-1751120047975-571265700.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(40, 80, 'uploads/comment_attachments/comment-1751120047975-204128748.pdf', 'QA (1).pdf', 'application/pdf'),
(41, 80, 'uploads/comment_attachments/comment-1751120047978-702571164.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(42, 81, 'uploads/comment_attachments/comment-1751120714774-801552807.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(43, 81, 'uploads/comment_attachments/comment-1751120714776-592484464.png', 'Screenshot 2025-06-20 002836.png', 'image/png'),
(44, 83, 'uploads/comment_attachments/comment-1751133508691-813247239.pdf', 'QA (1).pdf', 'application/pdf'),
(45, 83, 'uploads/comment_attachments/comment-1751133508702-471719161.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(46, 83, 'uploads/comment_attachments/comment-1751133508704-407318205.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(47, 83, 'uploads/comment_attachments/comment-1751133508705-613517112.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(48, 83, 'uploads/comment_attachments/comment-1751133508755-254916633.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(49, 83, 'uploads/comment_attachments/comment-1751133508762-782633314.txt', 'manage.txt', 'text/plain'),
(50, 83, 'uploads/comment_attachments/comment-1751133508764-698673991.txt', 'import { useState, useEffect, useRe.txt', 'text/plain'),
(51, 83, 'uploads/comment_attachments/comment-1751133508764-845284419.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(52, 84, 'uploads/comment_attachments/comment-1751133807307-480147248.pdf', 'QA (1).pdf', 'application/pdf'),
(53, 84, 'uploads/comment_attachments/comment-1751133807320-689309151.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(54, 84, 'uploads/comment_attachments/comment-1751133807321-288912477.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(55, 84, 'uploads/comment_attachments/comment-1751133807321-534382396.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(56, 84, 'uploads/comment_attachments/comment-1751133807358-220497367.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(57, 84, 'uploads/comment_attachments/comment-1751133807367-604635020.txt', 'manage.txt', 'text/plain'),
(58, 84, 'uploads/comment_attachments/comment-1751133807368-461599211.txt', 'import { useState, useEffect, useRe.txt', 'text/plain'),
(59, 84, 'uploads/comment_attachments/comment-1751133807368-882436997.png', 'Screenshot 2025-06-24 074826.png', 'image/png'),
(60, 85, 'uploads/comment_attachments/comment-1751135792830-564151172.pdf', 'QA (1).pdf', 'application/pdf'),
(61, 85, 'uploads/comment_attachments/comment-1751135792844-976382217.pdf', 'daily progress-01 (1).pdf', 'application/pdf'),
(62, 85, 'uploads/comment_attachments/comment-1751135792846-82862912.txt', '-- phpMyAdmin SQL Dump.txt', 'text/plain'),
(63, 85, 'uploads/comment_attachments/comment-1751135792846-864753627.mp3', 'comment-1750942006542-67590265.mp3', 'audio/mpeg'),
(64, 85, 'uploads/comment_attachments/comment-1751135792885-870548140.png', 'ChatGPT Image Jun 25, 2025, 11_26_41 AM.png', 'image/png'),
(65, 85, 'uploads/comment_attachments/comment-1751135792890-299113072.txt', 'manage.txt', 'text/plain'),
(66, 86, 'uploads/comment_attachments/comment-1751136479827-247338823.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247 (1).mp4', 'video/mp4'),
(67, 86, 'uploads/comment_attachments/comment-1751136479859-851841040.mp3', 'comment-1750942006542-67590265 (1).mp3', 'audio/mpeg'),
(68, 86, 'uploads/comment_attachments/comment-1751136479894-814239288.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247.mp4', 'video/mp4'),
(69, 88, 'uploads/comment_attachments/comment-1751175980714-9884532.mp3', 'comment-1751136479859-851841040.mp3', 'audio/mpeg'),
(70, 88, 'uploads/comment_attachments/comment-1751175980741-101838565.mp4', 'comment-1751136479827-247338823.mp4', 'video/mp4'),
(71, 88, 'uploads/comment_attachments/comment-1751175980755-871867154.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247 (1).mp4', 'video/mp4'),
(72, 88, 'uploads/comment_attachments/comment-1751175980766-54636334.mp3', 'comment-1750942006542-67590265 (1).mp3', 'audio/mpeg'),
(73, 88, 'uploads/comment_attachments/comment-1751175980804-670160827.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247.mp4', 'video/mp4'),
(74, 90, 'uploads/comment_attachments/comment-1751254778316-828916260.jpg', 'WhatsApp Image 2025-06-30 at 00.56.26_b28717b4.jpg', 'image/jpeg'),
(75, 90, 'uploads/comment_attachments/comment-1751254778319-66695846.jpg', 'WhatsApp Image 2025-06-29 at 15.37.42_c538145e.jpg', 'image/jpeg'),
(76, 90, 'uploads/comment_attachments/comment-1751254778319-258323971.mp3', 'comment-1751136479859-851841040.mp3', 'audio/mpeg'),
(77, 90, 'uploads/comment_attachments/comment-1751254778375-604942535.mp4', 'comment-1751136479827-247338823.mp4', 'video/mp4'),
(78, 90, 'uploads/comment_attachments/comment-1751254778404-991195219.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247 (1).mp4', 'video/mp4'),
(79, 90, 'uploads/comment_attachments/comment-1751254778426-725052222.mp3', 'comment-1750942006542-67590265 (1).mp3', 'audio/mpeg');

-- --------------------------------------------------------

--
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
CREATE TABLE IF NOT EXISTS `comment_likes` (
  `LikeID` int NOT NULL AUTO_INCREMENT,
  `CommentID` int NOT NULL,
  `UserID` int NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LikeID`),
  UNIQUE KEY `uq_comment_user_like` (`CommentID`,`UserID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comment_likes`
--

INSERT INTO `comment_likes` (`LikeID`, `CommentID`, `UserID`, `CreatedAt`) VALUES
(1, 44, 34, '2025-06-27 08:54:00'),
(2, 43, 34, '2025-06-27 15:45:36'),
(3, 39, 34, '2025-06-28 13:47:07'),
(4, 86, 34, '2025-06-28 18:48:23');

-- --------------------------------------------------------

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
CREATE TABLE IF NOT EXISTS `evidence` (
  `EvidenceID` int NOT NULL AUTO_INCREMENT,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `FilePath` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ComplaintID` int DEFAULT NULL,
  PRIMARY KEY (`EvidenceID`),
  KEY `fk_evidence_ticket` (`ComplaintID`)
) ENGINE=MyISAM AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evidence`
--

INSERT INTO `evidence` (`EvidenceID`, `Description`, `FilePath`, `ComplaintID`) VALUES
(66, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691060-924002970.pdf', 68),
(67, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691061-384223388.jpg', 68),
(68, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691061-235133612.mp4', 68),
(69, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691076-838016931.jpg', 68),
(70, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'uploads/evidenceFiles-1750841691077-626526867.jpg', 68),
(71, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405767-422087612.pdf', 69),
(72, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405770-880685072.jpg', 69),
(73, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405770-206960288.mp4', 69),
(74, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'uploads/evidenceFiles-1750851405794-421586245.jpg', 69),
(75, 'yuzjknkamzyw8kz;q/', 'uploads/evidenceFiles-1750851446628-479784983.pdf', 70),
(76, 'yuzjknkamzyw8kz;q/', 'uploads/evidenceFiles-1750851446630-300102635.jpg', 70),
(77, 'yuzjknkamzyw8kz;q/', 'uploads/evidenceFiles-1750851446630-648488827.mp4', 70),
(78, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473188-951990974.jpg', 71),
(79, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473188-938612062.mp4', 71),
(80, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473206-69717654.jpg', 71),
(81, 'fygnlkmak9u8upoqza', 'uploads/evidenceFiles-1750851473206-15173898.jpg', 71),
(82, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280423-127447264.pdf', 72),
(83, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280426-95454128.pdf', 72),
(84, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280429-371197153.jpg', 72),
(85, 'AHUSSUHJKSNKAUsSYI', 'uploads/evidenceFiles-1750908280429-838900753.mp4', 72),
(86, '7dywadijwkajudyyaiudoisajoko', 'uploads/evidenceFiles-1750908296323-64923715.jpg', 73),
(87, '7dywadijwkajudyyaiudoisajoko', 'uploads/evidenceFiles-1750908296323-224915385.mp4', 73),
(88, '7dywadijwkajudyyaiudoisajoko', 'uploads/evidenceFiles-1750908296341-468150302.jpg', 73),
(89, 'jasjkx,m,s ,c', 'uploads/evidenceFiles-1750908318049-466379550.pdf', 74),
(90, 'jasjkx,m,s ,c', 'uploads/evidenceFiles-1750908318052-864652737.jpg', 74),
(91, 'jasjkx,m,s ,c', 'uploads/evidenceFiles-1750908318052-340482591.mp4', 74),
(92, 'aQRSTQ7YSK', 'uploads/evidenceFiles-1750908340257-467020272.pdf', 75),
(93, 'aQRSTQ7YSK', 'uploads/evidenceFiles-1750908340259-54908536.jpg', 75),
(94, 'aQRSTQ7YSK', 'uploads/evidenceFiles-1750908340259-905540302.jpg', 75),
(95, 'TWHAIKMLDMLK', 'uploads/evidenceFiles-1750908367483-201892597.mp4', 76),
(96, 'TWHAIKMLDMLK', 'uploads/evidenceFiles-1750908367497-408107130.jpg', 76),
(97, 'TWHAIKMLDMLK', 'uploads/evidenceFiles-1750908367497-777264430.jpg', 76),
(98, 'euyodipoewk9wur48woiejf;l', 'uploads/evidenceFiles-1750925984406-347389394.xlsx', 77),
(99, 'euyodipoewk9wur48woiejf;l', 'uploads/evidenceFiles-1750925984409-505057830.pptx', 77),
(100, 'euyodipoewk9wur48woiejf;l', 'uploads/evidenceFiles-1750925984414-88152267.docx', 77),
(101, 'hii', 'uploads/evidenceFiles-1751003366026-611691766.png', 78),
(102, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424555-195709544.mp4', 79),
(103, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424577-956276197.sql', 79),
(104, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424577-124444824.pdf', 79),
(105, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424581-660727532.sql', 79),
(106, 'MS.RANDULA', 'uploads/evidenceFiles-1751134424581-408155664.zip', 79),
(107, 'Menuka', 'uploads/evidenceFiles-1751253749381-830628740.pka', 81),
(108, 'tg', 'uploads/evidenceFiles-1751258813406-673431607.jpg', 83),
(109, 'tg', 'uploads/evidenceFiles-1751258813411-924585830.pka', 83),
(110, 'tg', 'uploads/evidenceFiles-1751258813417-126776502.sql', 83),
(111, 'tg', 'uploads/evidenceFiles-1751258813417-978363063.sql', 83),
(112, 'tg', 'uploads/evidenceFiles-1751258813418-550794642.mp3', 83),
(113, 'tg', 'uploads/evidenceFiles-1751258813469-321545737.mp4', 83),
(114, 'tg', 'uploads/evidenceFiles-1751258813501-373927653.mp4', 83),
(115, 'tg', 'uploads/evidenceFiles-1751258813534-958650466.mp3', 83),
(116, 'PLZ CHECK THATA DB STORE', 'uploads/evidenceFiles-1751259545274-326243456.jpeg', 84),
(117, 'thre', 'uploads/evidenceFiles-1751274953889-77596489.jpeg', 89),
(118, 'thre', 'uploads/evidenceFiles-1751274953890-215214432.png', 89),
(119, 'thre', 'uploads/evidenceFiles-1751274953891-175585631.png', 89),
(120, 'thre', 'uploads/evidenceFiles-1751274953891-383464035.jpeg', 89),
(121, 'thre', 'uploads/evidenceFiles-1751274953891-419085997.jpeg', 89),
(122, 'thre', 'uploads/evidenceFiles-1751274953892-74706328.png', 89),
(123, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751275533229-882902336.png', 90),
(124, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751275533229-17297263.png', 90),
(125, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751275533229-604086219.jpeg', 90),
(126, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751275533229-434553140.png', 90),
(127, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751276091863-214617343.png', 92),
(128, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751276091864-591382481.jpeg', 92),
(129, 'inventory set up to navigate pattern', 'uploads/evidenceFiles-1751276586592-624754696.jpeg', 93),
(130, 'log system', 'uploads/evidenceFiles-1751280190025-991912394.png', 94),
(131, 'check log', 'uploads/evidenceFiles-1751336744671-743033118.png', 98),
(132, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751427269118-233125143.png', 100),
(133, 'in the bug sometimes check evidance', 'uploads/evidenceFiles-1751427269120-290223069.jpeg', 100),
(134, 'security checj ', 'uploads/evidenceFiles-1751437562825-865887855.png', 102);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `NotificationID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketLogID` int DEFAULT NULL,
  PRIMARY KEY (`NotificationID`),
  KEY `UserID` (`UserID`),
  KEY `TicketLogID` (`TicketLogID`)
) ENGINE=MyISAM AUTO_INCREMENT=741 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`NotificationID`, `UserID`, `Message`, `Type`, `IsRead`, `CreatedAt`, `TicketLogID`) VALUES
(2, 27, 'You have been assigned to ticket #26', 'SUPERVISOR_ASSIGNED', 0, '2025-06-13 04:29:25', NULL),
(3, 23, 'A supervisor has been assigned to your ticket #26', 'TICKET_UPDATED', 0, '2025-06-13 04:29:25', NULL),
(4, 22, 'Supervisor assigned to ticket #26', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-13 04:29:25', NULL),
(5, 27, 'You have been assigned to ticket #26', 'SUPERVISOR_ASSIGNED', 0, '2025-06-13 04:47:30', NULL),
(6, 23, 'A supervisor has been assigned to your ticket #26', 'TICKET_UPDATED', 0, '2025-06-13 04:47:30', NULL),
(7, 22, 'Supervisor assigned to ticket #26', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-13 04:47:30', NULL),
(8, 22, 'New system added: sgfxgf', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 06:42:50', NULL),
(9, 27, 'New system added: sgfxgf', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 06:42:50', NULL),
(10, 28, 'New system added: sgfxgf', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 06:42:50', NULL),
(11, 22, 'New ticket category added: hdtc', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 06:53:03', NULL),
(12, 27, 'New ticket category added: hdtc', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 06:53:03', NULL),
(13, 28, 'New ticket category added: hdtc', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 06:53:03', NULL),
(14, 22, 'New ticket category added: xdfdb', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 07:01:46', NULL),
(15, 27, 'New ticket category added: xdfdb', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 07:01:46', NULL),
(16, 28, 'New ticket category added: xdfdb', 'NEW_CATEGORY_ADDED', 0, '2025-06-13 07:01:46', NULL),
(17, 22, 'New system added: agzde', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 07:06:46', NULL),
(18, 27, 'New system added: agzde', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 07:06:46', NULL),
(19, 28, 'New system added: agzde', 'NEW_SYSTEM_ADDED', 0, '2025-06-13 07:06:46', NULL),
(20, 22, 'New User registered: Kariyawasam (kariyawasam@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-17 05:17:53', NULL),
(21, 22, 'New User registered: Kariyawasam (kariyawasam@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-17 05:27:56', NULL),
(22, 22, 'New ticket created by User #25: DGFHGhjkpoal;s...', 'NEW_TICKET', 0, '2025-06-17 07:08:41', NULL),
(23, 22, 'New User registered: Kariyawasam (kariyawasamkusal@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-17 07:12:07', NULL),
(24, 22, 'New ticket created by User #31: dasfsffffffaaaaaaaaaaaaaaaaaaa...', 'NEW_TICKET', 0, '2025-06-17 07:12:51', NULL),
(25, 28, 'You have been assigned to ticket #32', 'SUPERVISOR_ASSIGNED', 0, '2025-06-17 07:41:10', NULL),
(26, 31, 'A supervisor has been assigned to your ticket #32', 'TICKET_UPDATED', 0, '2025-06-17 07:41:10', NULL),
(27, 22, 'Supervisor assigned to ticket #32', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-17 07:41:10', NULL),
(28, 28, 'You have been assigned to ticket #32', 'SUPERVISOR_ASSIGNED', 0, '2025-06-17 07:45:08', NULL),
(29, 31, 'A supervisor has been assigned to your ticket #32', 'TICKET_UPDATED', 0, '2025-06-17 07:45:08', NULL),
(30, 22, 'Supervisor assigned to ticket #32', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-17 07:45:08', NULL),
(31, 27, 'You have been assigned to ticket #32', 'SUPERVISOR_ASSIGNED', 0, '2025-06-17 07:47:36', NULL),
(32, 31, 'A supervisor has been assigned to your ticket #32', 'TICKET_UPDATED', 0, '2025-06-17 07:47:36', NULL),
(33, 22, 'Supervisor assigned to ticket #32', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-17 07:47:36', NULL),
(34, 27, 'You have been assigned to ticket #31', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 03:52:51', NULL),
(35, 25, 'A supervisor has been assigned to your ticket #31', 'TICKET_UPDATED', 0, '2025-06-18 03:52:51', NULL),
(36, 22, 'Supervisor assigned to ticket #31', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 03:52:51', NULL),
(37, 22, 'New ticket created by User #25: dffrjujjjjjjjjjjjjjjjjjjjj...', 'NEW_TICKET', 0, '2025-06-18 05:03:39', NULL),
(38, 22, 'New ticket created by User #25: ggggggggffffffrrrrrrrrrrr...', 'NEW_TICKET', 0, '2025-06-18 05:03:52', NULL),
(39, 22, 'New ticket created by User #23: regssaQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ...', 'NEW_TICKET', 0, '2025-06-18 05:04:10', NULL),
(40, 22, 'New ticket created by User #23: [PI977R5WWRXGV...', 'NEW_TICKET', 0, '2025-06-18 05:04:23', NULL),
(41, 22, 'New ticket created by User #25: waewgseyydiji...', 'NEW_TICKET', 0, '2025-06-18 06:15:05', NULL),
(42, 22, 'New ticket created by User #25: fsaessdd...', 'NEW_TICKET', 0, '2025-06-18 06:19:07', NULL),
(43, 22, 'New ticket created by User #25: A secure platform for conducting elections where r...', 'NEW_TICKET', 0, '2025-06-18 06:19:46', NULL),
(44, 22, 'New ticket created by User #23: Allows employees to request leave, managers to app...', 'NEW_TICKET', 0, '2025-06-18 06:20:51', NULL),
(45, 22, 'New ticket created by User #23: WDSWWWWWWWWWWWWWWWWWWWWWWWW...', 'NEW_TICKET', 0, '2025-06-18 06:21:01', NULL),
(46, 28, 'You have been assigned to ticket #40', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 07:25:18', NULL),
(47, 23, 'A supervisor has been assigned to your ticket #40', 'TICKET_UPDATED', 0, '2025-06-18 07:25:18', NULL),
(48, 22, 'Supervisor assigned to ticket #40', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 07:25:18', NULL),
(49, 28, 'You have been assigned to ticket #40', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 07:25:22', NULL),
(50, 23, 'A supervisor has been assigned to your ticket #40', 'TICKET_UPDATED', 0, '2025-06-18 07:25:22', NULL),
(51, 22, 'Supervisor assigned to ticket #40', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 07:25:22', NULL),
(52, 28, 'You have been assigned to ticket #40', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 07:25:35', NULL),
(53, 23, 'A supervisor has been assigned to your ticket #40', 'TICKET_UPDATED', 0, '2025-06-18 07:25:35', NULL),
(54, 22, 'Supervisor assigned to ticket #40', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 07:25:35', NULL),
(55, 22, 'New ticket created by User #25: dhtfyfutgu...', 'NEW_TICKET', 0, '2025-06-18 07:55:20', NULL),
(56, 22, 'New ticket created by User #25: mfhykkkkk...', 'NEW_TICKET', 0, '2025-06-18 08:13:10', NULL),
(57, 22, 'New ticket created by User #25: tdtggijuoo...', 'NEW_TICKET', 0, '2025-06-18 08:25:24', NULL),
(58, 22, 'New ticket created by User #25: tdtggijuoo...', 'NEW_TICKET', 0, '2025-06-18 08:25:27', NULL),
(59, 22, 'New ticket created by User #25: chvnnkm...', 'NEW_TICKET', 0, '2025-06-18 08:26:17', NULL),
(60, 22, 'New ticket created by User #25: ihkzal,:Zz;/\nZz0\n...', 'NEW_TICKET', 0, '2025-06-18 08:28:49', NULL),
(61, 22, 'New ticket created by User #25: fdgfhguj...', 'NEW_TICKET', 0, '2025-06-18 08:35:45', NULL),
(62, 28, 'You have been assigned to ticket #48', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 08:42:56', NULL),
(63, 25, 'A supervisor has been assigned to your ticket #48', 'TICKET_UPDATED', 0, '2025-06-18 08:42:56', NULL),
(64, 22, 'Supervisor assigned to ticket #48', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 08:42:56', NULL),
(65, 22, 'New ticket created by User #25: fszedts...', 'NEW_TICKET', 0, '2025-06-18 09:02:58', NULL),
(66, 22, 'New ticket created by User #25: saxjixjIXSSZ...', 'NEW_TICKET', 0, '2025-06-18 09:05:16', NULL),
(67, 22, 'New ticket created by User #25: sxzmxkaS>X...', 'NEW_TICKET', 0, '2025-06-18 09:07:12', NULL),
(68, 22, 'New ticket created by User #22: Manages patient records, doctor appointments, bill...', 'NEW_TICKET', 0, '2025-06-18 09:10:09', NULL),
(69, 22, 'New ticket created by User #22: It has a big bug...', 'NEW_TICKET', 0, '2025-06-18 09:16:40', NULL),
(70, 27, 'You have been assigned to ticket #33', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 11:45:02', NULL),
(71, 25, 'A supervisor has been assigned to your ticket #33', 'TICKET_UPDATED', 0, '2025-06-18 11:45:02', NULL),
(72, 22, 'Supervisor assigned to ticket #33', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 11:45:02', NULL),
(73, 27, 'You have been assigned to ticket #33', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 11:48:12', NULL),
(74, 25, 'A supervisor has been assigned to your ticket #33', 'TICKET_UPDATED', 0, '2025-06-18 11:48:12', NULL),
(75, 22, 'Supervisor assigned to ticket #33', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 11:48:12', NULL),
(76, 28, 'You have been assigned to ticket #50', 'SUPERVISOR_ASSIGNED', 1, '2025-06-18 12:00:43', NULL),
(77, 25, 'A supervisor has been assigned to your ticket #50', 'TICKET_UPDATED', 0, '2025-06-18 12:00:43', NULL),
(78, 22, 'Supervisor assigned to ticket #50', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 12:00:43', NULL),
(79, 22, 'New ticket created by User #23: hghjnkjml...', 'NEW_TICKET', 0, '2025-06-18 12:08:03', NULL),
(80, 27, 'You have been assigned to ticket #34', 'SUPERVISOR_ASSIGNED', 0, '2025-06-18 14:35:23', NULL),
(81, 25, 'A supervisor has been assigned to your ticket #34', 'TICKET_UPDATED', 0, '2025-06-18 14:35:23', NULL),
(82, 22, 'Supervisor assigned to ticket #34', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-18 14:35:23', NULL),
(83, 28, 'You have been assigned to ticket #35', 'SUPERVISOR_ASSIGNED', 1, '2025-06-19 03:44:01', NULL),
(84, 23, 'A supervisor has been assigned to your ticket #35', 'TICKET_UPDATED', 0, '2025-06-19 03:44:01', NULL),
(85, 22, 'Supervisor assigned to ticket #35', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-19 03:44:01', NULL),
(86, 27, 'You have been assigned to ticket #36', 'SUPERVISOR_ASSIGNED', 0, '2025-06-19 03:46:23', NULL),
(87, 23, 'A supervisor has been assigned to your ticket #36', 'TICKET_UPDATED', 0, '2025-06-19 03:46:23', NULL),
(88, 22, 'Supervisor assigned to ticket #36', 'SUPERVISOR_ASSIGNMENT', 0, '2025-06-19 03:46:23', NULL),
(89, 22, 'New User registered: Govindi (govindith@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-20 05:33:23', NULL),
(90, 22, 'New ticket category added: zcxd', 'NEW_CATEGORY_ADDED', 0, '2025-06-20 07:26:23', NULL),
(91, 27, 'New ticket category added: zcxd', 'NEW_CATEGORY_ADDED', 0, '2025-06-20 07:26:23', NULL),
(92, 28, 'New ticket category added: zcxd', 'NEW_CATEGORY_ADDED', 1, '2025-06-20 07:26:23', NULL),
(93, 22, 'New ticket created by User #25: kjla;\'cd;xc...', 'NEW_TICKET', 0, '2025-06-23 05:44:34', NULL),
(94, 22, 'New ticket created by User #25: fhjbkjn,.\\.poiupo...', 'NEW_TICKET', 0, '2025-06-23 13:27:19', NULL),
(95, 22, 'New ticket created by User #25: YGKJNKM<LJURTFHJBAM < ...', 'NEW_TICKET', 0, '2025-06-23 13:36:29', NULL),
(96, 22, 'New ticket created by User #25: f gv hbjjnjkl\'.\'/vhvhbm...', 'NEW_TICKET', 0, '2025-06-23 13:36:44', NULL),
(97, 22, 'New ticket created by User #25: fdzshtg...', 'NEW_TICKET', 0, '2025-06-23 14:12:23', NULL),
(98, 22, 'New ticket created by User #23: sASTFERYHETDU...', 'NEW_TICKET', 0, '2025-06-23 14:14:09', NULL),
(99, 22, 'New ticket created by User #23: YGUUVOVL[Z;V[P=0=-A\n...', 'NEW_TICKET', 0, '2025-06-23 14:14:42', NULL),
(100, 22, 'New ticket created by User #25: IURFHI,\'ESEDRFGHJKL;\'...', 'NEW_TICKET', 0, '2025-06-23 14:15:02', NULL),
(101, 22, 'New ticket created by User #25: JSACIOJILSAP:...', 'NEW_TICKET', 0, '2025-06-23 14:15:25', NULL),
(102, 22, 'New ticket created by User #25: 5SDRFNJNKT65RTUJ,...', 'NEW_TICKET', 0, '2025-06-23 14:15:51', NULL),
(103, 25, 'The supervisor for your ticket #59 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 14:39:51', 1),
(104, 25, 'Your ticket #59 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 14:39:51', 2),
(105, 28, 'Ticket #59 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 14:39:51', 2),
(106, 28, 'You have been assigned to ticket #59. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 14:39:51', NULL),
(107, 24, 'You were mentioned in a comment on ticket #59', 'MENTION', 0, '2025-06-24 06:25:55', 34),
(108, 26, 'You were mentioned in a comment on ticket #59', 'MENTION', 0, '2025-06-24 06:25:55', 34),
(109, 24, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 5),
(110, 26, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 6),
(111, 27, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 7),
(112, 28, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-24 07:03:33', 8),
(113, 25, 'The supervisor for your ticket #63 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 06:18:48', 9),
(114, 24, 'You have been assigned to ticket #63. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 06:18:48', NULL),
(115, 25, 'The supervisor for your ticket #63 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 06:20:40', 10),
(116, 24, 'You have been unassigned from ticket #63.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 06:20:40', 10),
(117, 25, 'Your ticket #63 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:20:40', 11),
(118, 24, 'Ticket #63 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:20:40', 11),
(119, 24, 'You have been assigned to ticket #63. Status: Pending, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 06:20:40', NULL),
(120, 25, 'The supervisor for your ticket #63 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 06:28:18', 12),
(121, 24, 'You have been unassigned from ticket #63.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 06:28:18', 12),
(122, 25, 'Your ticket #63 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 06:28:18', 13),
(123, 24, 'Ticket #63 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 06:28:18', 13),
(124, 25, 'Your ticket #63 priority has been changed from High to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:28:18', 14),
(125, 24, 'Ticket #63 priority has been changed from High to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 06:28:18', 14),
(126, 24, 'You have been assigned to ticket #63. Status: In Progress, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 06:28:18', NULL),
(127, 25, 'The supervisor for your ticket #58 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 07:39:24', 15),
(128, 26, 'You have been unassigned from ticket #58.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 07:39:24', 15),
(129, 26, 'You have been assigned to ticket #58. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 07:39:24', NULL),
(130, 25, 'The supervisor for your ticket #57 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 07:46:55', 16),
(131, 26, 'You have been assigned to ticket #57. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 07:46:55', NULL),
(132, 25, 'The supervisor for your ticket #57 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 07:48:20', 17),
(133, 26, 'You have been unassigned from ticket #57.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 07:48:20', 17),
(134, 24, 'You have been assigned to ticket #57. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 07:48:20', NULL),
(135, 25, 'The supervisor for your ticket #57 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 08:08:15', 18),
(136, 24, 'You have been unassigned from ticket #57.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 08:08:15', 18),
(137, 26, 'You have been assigned to ticket #57. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 08:08:15', NULL),
(138, 25, 'The supervisor for your ticket #58 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 08:13:01', 19),
(139, 26, 'You have been unassigned from ticket #58.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 08:13:01', 19),
(140, 26, 'You have been assigned to ticket #58. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 08:13:01', NULL),
(141, 25, 'The supervisor for your ticket #58 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 08:14:34', 20),
(142, 26, 'You have been unassigned from ticket #58.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 08:14:34', 20),
(143, 24, 'You have been assigned to ticket #58. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 08:14:34', NULL),
(144, 22, 'New ticket created by User #23: iudhuiqajodkf;leaoi98wudwd[w;xd...', 'NEW_TICKET', 0, '2025-06-25 08:53:34', NULL),
(145, 22, 'New ticket created by User #23: f8eawfoiekjopf,;e.s\'\n\n...', 'NEW_TICKET', 0, '2025-06-25 08:53:51', NULL),
(146, 22, 'New ticket created by User #25: iwuojoqakhdiudwiujs...', 'NEW_TICKET', 0, '2025-06-25 08:54:27', NULL),
(147, 22, 'New ticket created by User #25: sahiihdciuwshiuahiujowkoJIUDHUDU...', 'NEW_TICKET', 0, '2025-06-25 08:54:51', NULL),
(148, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 09:15:40', 21),
(149, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 09:15:40', NULL),
(150, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 09:16:28', 22),
(151, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 09:16:28', 22),
(152, 26, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 09:16:28', NULL),
(153, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 09:40:19', 23),
(154, 26, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 09:40:19', 23),
(155, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 09:40:19', NULL),
(156, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 10:46:42', 24),
(157, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 10:46:42', 24),
(158, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 10:46:42', NULL),
(159, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 10:52:00', 25),
(160, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 10:52:00', 25),
(161, 25, 'Your ticket #68 status has been changed from Pending to Pending.', 'STATUS_UPDATE', 0, '2025-06-25 10:52:00', 26),
(162, 24, 'Ticket #68 status has been changed from Pending to Pending.', 'STATUS_UPDATE', 0, '2025-06-25 10:52:00', 26),
(163, 25, 'Your ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 10:52:00', 27),
(164, 24, 'Ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 10:52:00', 27),
(165, 24, 'You have been assigned to ticket #68. Status: Pending, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 10:52:00', NULL),
(166, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:04:01', 28),
(167, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-25 11:04:01', 28),
(168, 25, 'Your ticket #68 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:04:01', 29),
(169, 24, 'Ticket #68 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:04:01', 29),
(170, 25, 'Your ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:04:01', 30),
(171, 24, 'Ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:04:01', 30),
(172, 24, 'You have been assigned to ticket #68. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:04:01', NULL),
(173, 25, 'The supervisor for your ticket #67 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:06:20', 31),
(174, 25, 'Your ticket #67 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 11:06:20', 32),
(175, 24, 'Ticket #67 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 11:06:20', 32),
(176, 25, 'Your ticket #67 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:06:20', 33),
(177, 24, 'Ticket #67 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:06:20', 33),
(178, 24, 'You have been assigned to ticket #67. Status: In Progress, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:06:20', NULL),
(179, 23, 'The supervisor for your ticket #66 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:09:53', 34),
(180, 23, 'Your ticket #66 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:09:53', 35),
(181, 27, 'Ticket #66 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:09:53', 35),
(182, 23, 'Your ticket #66 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:09:53', 36),
(183, 27, 'Ticket #66 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:09:53', 36),
(184, 27, 'You have been assigned to ticket #66. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:09:53', NULL),
(185, 23, 'The supervisor for your ticket #65 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:10:03', 37),
(186, 23, 'Your ticket #65 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 0, '2025-06-25 11:10:03', 38),
(187, 24, 'Ticket #65 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 0, '2025-06-25 11:10:03', 38),
(188, 23, 'Your ticket #65 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:10:03', 39),
(189, 24, 'Ticket #65 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:10:03', 39),
(190, 24, 'You have been assigned to ticket #65. Status: Resolved, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:10:03', NULL),
(191, 22, 'New ticket created by User #23: hfhjkza,;,aojxiuxdhlkdx,nshgxkja ....', 'NEW_TICKET', 0, '2025-06-25 11:36:45', NULL),
(192, 22, 'New ticket created by User #23: yuzjknkamzyw8kz;q/...', 'NEW_TICKET', 0, '2025-06-25 11:37:26', NULL),
(193, 22, 'New ticket created by User #25: fygnlkmak9u8upoqza...', 'NEW_TICKET', 0, '2025-06-25 11:37:53', NULL),
(194, 23, 'The supervisor for your ticket #69 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:54:01', 40),
(195, 23, 'Your ticket #69 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:54:01', 41),
(196, 24, 'Ticket #69 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 11:54:01', 41),
(197, 23, 'Your ticket #69 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:54:01', 42),
(198, 24, 'Ticket #69 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 11:54:01', 42),
(199, 24, 'You have been assigned to ticket #69. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:54:01', NULL),
(200, 23, 'The supervisor for your ticket #70 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 12:01:28', 43),
(201, 23, 'Your ticket #70 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 12:01:28', 44),
(202, 24, 'Ticket #70 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 12:01:28', 44),
(203, 23, 'Your ticket #70 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 12:01:28', 45),
(204, 24, 'Ticket #70 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 12:01:28', 45),
(205, 24, 'You have been assigned to ticket #70. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 12:01:28', NULL),
(206, 25, 'The supervisor for your ticket #71 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 13:10:32', 46),
(207, 25, 'Your ticket #71 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 13:10:32', 47),
(208, 27, 'Ticket #71 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 13:10:32', 47),
(209, 25, 'Your ticket #71 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 13:10:32', 48),
(210, 27, 'Ticket #71 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-25 13:10:32', 48),
(211, 27, 'You have been assigned to ticket #71. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 13:10:32', NULL),
(212, 22, 'New ticket created by User #23: AHUSSUHJKSNKAUsSYI...', 'NEW_TICKET', 0, '2025-06-26 03:24:40', NULL),
(213, 22, 'New ticket created by User #23: 7dywadijwkajudyyaiudoisajoko...', 'NEW_TICKET', 0, '2025-06-26 03:24:56', NULL),
(214, 22, 'New ticket created by User #23: jasjkx,m,s ,c...', 'NEW_TICKET', 0, '2025-06-26 03:25:18', NULL),
(215, 22, 'New ticket created by User #25: aQRSTQ7YSK...', 'NEW_TICKET', 0, '2025-06-26 03:25:40', NULL),
(216, 22, 'New ticket created by User #25: TWHAIKMLDMLK...', 'NEW_TICKET', 0, '2025-06-26 03:26:07', NULL),
(217, 25, 'The supervisor for your ticket #76 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-26 03:41:32', 49),
(218, 25, 'Your ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:41:32', 50),
(219, 24, 'Ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:41:32', 50),
(220, 25, 'Your ticket #76 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:41:32', 51),
(221, 24, 'Ticket #76 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:41:32', 51),
(222, 24, 'You have been assigned to ticket #76. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-26 03:41:32', NULL),
(223, 25, 'The supervisor for your ticket #75 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-26 03:45:54', 52),
(224, 25, 'Your ticket #75 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:45:54', 53),
(225, 24, 'Ticket #75 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-26 03:45:54', 53),
(226, 25, 'Your ticket #75 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:45:54', 54),
(227, 24, 'Ticket #75 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-26 03:45:54', 54),
(228, 24, 'You have been assigned to ticket #75. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-26 03:45:54', NULL),
(229, 22, 'New ticket created by User #25: euyodipoewk9wur48woiejf;l...', 'NEW_TICKET', 0, '2025-06-26 08:19:44', NULL),
(230, 22, 'New User registered: Diluka (nethmitk22@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-27 05:49:09', NULL),
(231, 22, 'New ticket created by User #33: hii...', 'NEW_TICKET', 0, '2025-06-27 05:49:25', NULL),
(232, 22, 'New User registered: admin (admin22@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-27 05:49:45', NULL),
(233, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 06:13:40', 35),
(234, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 06:13:40', 35),
(235, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 06:40:14', 38),
(236, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 07:19:35', 39),
(237, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 07:19:35', 39),
(238, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 07:19:35', 39),
(239, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(240, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(241, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(242, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:27:12', 40),
(243, 34, 'You were mentioned in a comment on ticket #68', 'MENTION', 1, '2025-06-27 08:27:12', 40),
(244, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:28:15', 41),
(245, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:28:15', 41),
(246, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:28:15', 41),
(247, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:30:45', 42),
(248, 26, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:30:45', 42),
(249, 34, 'You were mentioned in a comment on ticket #68', 'MENTION', 1, '2025-06-27 08:30:45', 42),
(250, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:31:00', 43),
(251, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:31:00', 43),
(252, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:31:00', 43),
(253, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:53:33', 44),
(254, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:53:33', 44),
(255, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 08:53:33', 44),
(256, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 09:06:26', 45),
(257, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 09:06:26', 45),
(258, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 09:06:26', 45),
(259, 25, 'The supervisor for your ticket #77 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-27 10:31:50', 68),
(260, 25, 'Your ticket #77 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:31:50', 69),
(261, 26, 'Ticket #77 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:31:50', 69),
(262, 25, 'Your ticket #77 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:31:50', 70),
(263, 26, 'Ticket #77 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:31:50', 70),
(264, 26, 'You have been assigned to ticket #77. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-27 10:31:50', NULL),
(265, 23, 'The supervisor for your ticket #72 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-27 10:32:14', 71),
(266, 23, 'Your ticket #72 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:32:14', 72),
(267, 27, 'Ticket #72 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-27 10:32:14', 72),
(268, 23, 'Your ticket #72 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:32:14', 73),
(269, 27, 'Ticket #72 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-27 10:32:14', 73),
(270, 27, 'You have been assigned to ticket #72. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-27 10:32:14', NULL),
(271, 27, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:34:45', 48),
(272, 22, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:34:45', 48),
(273, 27, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:35:04', 49),
(274, 22, 'You were mentioned in a comment on ticket #72', 'MENTION', 0, '2025-06-27 10:35:04', 49),
(275, 34, 'You were mentioned in a comment on ticket #72', 'MENTION', 1, '2025-06-27 10:35:04', 49),
(276, 26, 'You were mentioned in a comment on ticket #77', 'MENTION', 0, '2025-06-27 10:46:08', 50),
(277, 25, 'Your ticket #77 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-06-27 11:20:06', 77),
(278, 26, 'Ticket #77 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-06-27 11:20:06', 77),
(279, 27, 'You were mentioned in a comment on ticket #69', 'MENTION', 0, '2025-06-27 11:25:48', 51),
(280, 22, 'You were mentioned in a comment on ticket #69', 'MENTION', 0, '2025-06-27 11:25:48', 51),
(281, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 16:26:09', 59),
(282, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 16:26:09', 59),
(283, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-27 16:47:01', 60),
(284, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 07:29:37', 61),
(285, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 07:29:37', 61),
(286, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:02', 67),
(287, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:02', 67),
(288, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:37', 68),
(289, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:26:37', 68),
(290, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:43:02', 69),
(291, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 08:43:02', 69),
(292, 24, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:46:56', 70),
(293, 27, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:54:16', 71),
(294, 24, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:54:16', 71),
(295, 22, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 08:54:16', 71),
(296, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:06:57', 72),
(297, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:06:57', 72),
(298, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:06:57', 72),
(299, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:08:29', 73),
(300, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:09:09', 74),
(301, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:09:09', 74),
(302, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:09:09', 74),
(303, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:12:15', 75),
(304, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:12:15', 75),
(305, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:12:15', 75),
(306, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:13:33', 76),
(307, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:13:33', 76),
(308, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 09:13:33', 76),
(309, 27, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 14:25:14', 81),
(310, 24, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 14:25:14', 81),
(311, 22, 'You were mentioned in a comment on ticket #71', 'MENTION', 0, '2025-06-28 14:25:14', 81),
(312, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 16:04:57', 82),
(313, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 16:04:57', 82),
(314, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 17:58:28', 83),
(315, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 17:58:28', 83),
(316, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 17:58:28', 83),
(317, 33, 'The supervisor for your ticket #78 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 1, '2025-06-28 18:01:15', 111),
(318, 33, 'Your ticket #78 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 1, '2025-06-28 18:01:15', 112),
(319, 24, 'Ticket #78 status has been changed from Pending to Resolved.', 'STATUS_UPDATE', 0, '2025-06-28 18:01:15', 112),
(320, 33, 'Your ticket #78 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 1, '2025-06-28 18:01:15', 113),
(321, 24, 'Ticket #78 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-28 18:01:15', 113),
(322, 24, 'You have been assigned to ticket #78. Status: Resolved, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-28 18:01:15', NULL),
(323, 24, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:03:27', 84),
(324, 22, 'New ticket created by User #33: MS.RANDULA...', 'NEW_TICKET', 0, '2025-06-28 18:13:44', NULL),
(325, 34, 'New ticket created by User #33: MS.RANDULA...', 'NEW_TICKET', 1, '2025-06-28 18:13:44', NULL),
(326, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:36:32', 85),
(327, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:36:32', 85),
(328, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:47:59', 86),
(329, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:47:59', 86),
(330, 27, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:49:03', 87),
(331, 22, 'You were mentioned in a comment on ticket #68', 'MENTION', 0, '2025-06-28 18:49:03', 87),
(332, 25, 'Your ticket #71 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:21:10', 118),
(333, 27, 'Ticket #71 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:21:10', 118),
(334, 22, 'New ticket created by User #149: kjnkj...', 'NEW_TICKET', 0, '2025-06-29 04:31:13', NULL),
(335, 34, 'New ticket created by User #149: kjnkj...', 'NEW_TICKET', 1, '2025-06-29 04:31:13', NULL),
(336, 25, 'Your ticket #68 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:57:00', 119),
(337, 24, 'Ticket #68 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 04:57:00', 119),
(338, 149, 'The supervisor for your ticket #80 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-29 05:12:57', 120),
(339, 149, 'Your ticket #80 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-29 05:12:57', 121),
(340, 24, 'Ticket #80 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-29 05:12:57', 121),
(341, 149, 'Your ticket #80 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-29 05:12:57', 122),
(342, 24, 'Ticket #80 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-29 05:12:57', 122),
(343, 24, 'You have been assigned to ticket #80. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-29 05:12:57', NULL),
(344, 33, 'The supervisor for your ticket #79 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 1, '2025-06-29 05:13:13', 123),
(345, 33, 'Your ticket #79 status has been changed from Pending to Open.', 'STATUS_UPDATE', 1, '2025-06-29 05:13:13', 124),
(346, 24, 'Ticket #79 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-29 05:13:13', 124),
(347, 33, 'Your ticket #79 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 1, '2025-06-29 05:13:13', 125),
(348, 24, 'Ticket #79 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-29 05:13:13', 125),
(349, 24, 'You have been assigned to ticket #79. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-29 05:13:13', NULL),
(350, 23, 'Your ticket #69 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 05:39:55', 126),
(351, 24, 'Ticket #69 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-29 05:39:55', 126),
(352, 30, 'You were mentioned in a comment on ticket #80', 'MENTION', 0, '2025-06-29 05:46:20', 88),
(353, 24, 'You were mentioned in a comment on ticket #79', 'MENTION', 0, '2025-06-29 17:41:02', 89),
(354, 26, 'You were mentioned in a comment on ticket #79', 'MENTION', 0, '2025-06-29 17:41:02', 89),
(355, 23, 'Your ticket #70 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 03:20:10', 129),
(356, 24, 'Ticket #70 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 03:20:10', 129),
(357, 34, 'New User registered: supervisor (supervisor22@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-30 03:20:49', NULL),
(358, 34, 'New User registered: user (user22@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-30 03:22:15', NULL),
(359, 34, 'New ticket created by User #36: Menuka...', 'NEW_TICKET', 1, '2025-06-30 03:22:29', NULL),
(360, 36, 'The supervisor for your ticket #81 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 1, '2025-06-30 03:22:55', 130),
(361, 36, 'Your ticket #81 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 03:22:55', 131),
(362, 23, 'Ticket #81 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 03:22:55', 131),
(363, 36, 'Your ticket #81 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-30 03:22:55', 132),
(364, 23, 'Ticket #81 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-30 03:22:55', 132),
(365, 23, 'You have been assigned to ticket #81. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 03:22:55', NULL),
(366, 23, 'The supervisor for your ticket #73 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-30 03:23:41', 133),
(367, 23, 'Your ticket #73 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-30 03:23:41', 134),
(368, 35, 'Ticket #73 status has been changed from Pending to Open.', 'STATUS_UPDATE', 1, '2025-06-30 03:23:41', 134),
(369, 23, 'Your ticket #73 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-30 03:23:41', 135),
(370, 35, 'Ticket #73 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 1, '2025-06-30 03:23:41', 135),
(371, 35, 'You have been assigned to ticket #73. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 03:23:41', NULL),
(372, 34, 'You were mentioned in a comment on ticket #72', 'MENTION', 1, '2025-06-30 03:39:38', 90),
(373, 30, 'New ticket created by User #36: djk...', 'NEW_TICKET', 0, '2025-06-30 04:45:34', NULL),
(374, 34, 'New ticket created by User #36: djk...', 'NEW_TICKET', 1, '2025-06-30 04:45:34', NULL),
(375, 36, 'Your ticket #82 has been rejected by admin. Reason: Not a Bug', 'TICKET_REJECTED', 0, '2025-06-30 04:45:52', 137),
(376, 30, 'New ticket created by User #36: tg...', 'NEW_TICKET', 0, '2025-06-30 04:46:53', NULL),
(377, 34, 'New ticket created by User #36: tg...', 'NEW_TICKET', 1, '2025-06-30 04:46:53', NULL),
(378, 25, 'The supervisor for your ticket #77 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-30 04:47:15', 138),
(379, 35, 'You have been unassigned from ticket #77.', 'SUPERVISOR_UNASSIGNED', 1, '2025-06-30 04:47:15', 138),
(380, 25, 'Your ticket #77 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 04:47:15', 139),
(381, 23, 'Ticket #77 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 04:47:15', 139),
(382, 25, 'Your ticket #77 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-30 04:47:15', 140),
(383, 23, 'Ticket #77 priority has been changed from Medium to High.', 'PRIORITY_UPDATE', 0, '2025-06-30 04:47:15', 140),
(384, 23, 'You have been assigned to ticket #77. Status: In Progress, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 04:47:15', NULL),
(385, 36, 'Your ticket #83 has been rejected by admin. Reason: Invalid Request', 'TICKET_REJECTED', 1, '2025-06-30 04:47:24', 141),
(386, 23, 'Your ticket #69 has been rejected by admin. Reason: Invalid Request', 'TICKET_REJECTED', 0, '2025-06-30 04:50:49', 142),
(387, 30, 'New ticket created by User #36: PLZ CHECK THATA DB STORE...', 'NEW_TICKET', 0, '2025-06-30 04:59:05', NULL),
(388, 34, 'New ticket created by User #36: PLZ CHECK THATA DB STORE...', 'NEW_TICKET', 1, '2025-06-30 04:59:05', NULL),
(389, 36, 'Your ticket #84 has been rejected by admin. Reason: Feature Request Misclassified as Bug', 'TICKET_REJECTED', 1, '2025-06-30 04:59:22', 143),
(390, 25, 'The supervisor for your ticket #68 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-30 04:59:36', 144),
(391, 24, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-30 04:59:36', 144),
(392, 25, 'Your ticket #68 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 04:59:36', 145),
(393, 23, 'Ticket #68 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-30 04:59:36', 145),
(394, 25, 'Your ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-30 04:59:36', 146),
(395, 23, 'Ticket #68 priority has been changed from Medium to Medium.', 'PRIORITY_UPDATE', 0, '2025-06-30 04:59:36', 146),
(396, 23, 'You have been assigned to ticket #68. Status: In Progress, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 04:59:36', NULL),
(397, 30, 'New User registered: THALIKORALAGE NETHMI SANDEEPANIE (NETHMI22@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 08:56:51', NULL),
(398, 34, 'New User registered: THALIKORALAGE NETHMI SANDEEPANIE (NETHMI22@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-30 08:56:51', NULL),
(399, 30, 'New ticket created by User #37: NEW TICKET...', 'NEW_TICKET', 0, '2025-06-30 08:57:05', NULL),
(400, 34, 'New ticket created by User #37: NEW TICKET...', 'NEW_TICKET', 1, '2025-06-30 08:57:05', NULL),
(401, 37, 'Your ticket #85 has been updated: supervisor changed to Unknown Supervisor, status changed to In Progress, priority changed to Low.', 'TICKET_UPDATED', 1, '2025-06-30 08:59:00', 147),
(402, 24, 'You have been assigned to ticket #85. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 08:59:00', 147),
(403, 23, 'You have been unassigned from ticket #68.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-30 09:00:36', 150),
(404, 25, 'Your ticket #68 has been updated: supervisor changed to Unknown Supervisor, status changed to In Progress, priority changed to Low.', 'TICKET_UPDATED', 0, '2025-06-30 09:00:36', 150),
(405, 35, 'You have been assigned to ticket #68. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:00:36', 150),
(406, 30, 'New ticket created by User #37: bugs fixed plz...', 'NEW_TICKET', 0, '2025-06-30 09:02:52', NULL),
(407, 34, 'New ticket created by User #37: bugs fixed plz...', 'NEW_TICKET', 1, '2025-06-30 09:02:52', NULL),
(408, 37, 'Your ticket #86 has been updated: supervisor changed to Unknown Supervisor, status changed to In Progress, priority changed to Low.', 'TICKET_UPDATED', 1, '2025-06-30 09:03:10', 153),
(409, 35, 'You have been assigned to ticket #86. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:03:10', 153),
(410, 37, 'Your ticket #86 has been updated: status changed to Open by supervisor.', 'TICKET_UPDATED', 1, '2025-06-30 09:14:43', 156),
(411, 35, 'Ticket #86 assigned to you has been updated: status changed to Open by supervisor.', 'TICKET_UPDATED', 1, '2025-06-30 09:14:43', 156),
(412, 24, 'Ticket #86 assigned to you has been updated: status changed to Open by supervisor.', 'TICKET_UPDATED', 0, '2025-06-30 09:14:43', 156),
(413, 26, 'Ticket #86 assigned to you has been updated: status changed to Open by supervisor.', 'TICKET_UPDATED', 0, '2025-06-30 09:14:43', 156),
(414, 30, 'New ticket created by User #37: one supervisor...', 'NEW_TICKET', 0, '2025-06-30 09:15:23', NULL),
(415, 34, 'New ticket created by User #37: one supervisor...', 'NEW_TICKET', 1, '2025-06-30 09:15:23', NULL),
(416, 30, 'New ticket created by User #37: two supervisor...', 'NEW_TICKET', 0, '2025-06-30 09:15:39', NULL),
(417, 34, 'New ticket created by User #37: two supervisor...', 'NEW_TICKET', 1, '2025-06-30 09:15:39', NULL),
(418, 30, 'New ticket created by User #37: thre...', 'NEW_TICKET', 0, '2025-06-30 09:15:53', NULL),
(419, 34, 'New ticket created by User #37: thre...', 'NEW_TICKET', 1, '2025-06-30 09:15:53', NULL),
(420, 30, 'New User registered: supervisor two (sup@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 09:16:12', NULL),
(421, 34, 'New User registered: supervisor two (sup@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-30 09:16:12', NULL),
(422, 37, 'Your ticket #89 has been updated: supervisor(s) changed to supervisor, supervisor two, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-06-30 09:17:59', 157),
(423, 35, 'You have been assigned to ticket #89. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:17:59', 157),
(424, 38, 'You have been assigned to ticket #89. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:17:59', 157),
(425, 30, 'New User registered: hashini dilhara (hashii@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 09:24:41', NULL),
(426, 34, 'New User registered: hashini dilhara (hashii@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-30 09:24:41', NULL);
INSERT INTO `notifications` (`NotificationID`, `UserID`, `Message`, `Type`, `IsRead`, `CreatedAt`, `TicketLogID`) VALUES
(427, 121, 'New User registered: hashini dilhara (hashii@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 09:24:41', NULL),
(428, 145, 'New User registered: hashini dilhara (hashii@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 09:24:41', NULL),
(429, 151, 'New User registered: hashini dilhara (hashii@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 09:24:41', NULL),
(430, 30, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:25:32', NULL),
(431, 34, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 1, '2025-06-30 09:25:32', NULL),
(432, 121, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:25:32', NULL),
(433, 145, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:25:32', NULL),
(434, 151, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:25:32', NULL),
(435, 158, 'Your ticket #90 has been rejected by supervisor. Reason: Duplicate Ticket', 'TICKET_REJECTED', 1, '2025-06-30 09:26:45', 160),
(436, 37, 'Your ticket #88 has been updated: supervisor(s) changed to Anjali Wijesinghe	, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-06-30 09:29:01', 161),
(437, 146, 'You have been assigned to ticket #88. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:29:01', 161),
(438, 37, 'Your ticket #87 has been updated: supervisor(s) changed to Sasindu Perera, supervisor, status changed to Open, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-06-30 09:31:36', 164),
(439, 120, 'You have been assigned to ticket #87. Status: Open, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:31:36', 164),
(440, 35, 'You have been assigned to ticket #87. Status: Open, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:31:36', 164),
(441, 30, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:33:04', NULL),
(442, 34, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 1, '2025-06-30 09:33:04', NULL),
(443, 121, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:33:04', NULL),
(444, 145, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:33:04', NULL),
(445, 151, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:33:04', NULL),
(446, 158, 'Your ticket #91 has been updated: supervisor(s) changed to Anjali Wijesinghe	, Sasindu Perera, supervisor, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-06-30 09:33:39', 167),
(447, 146, 'You have been assigned to ticket #91. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:33:39', 167),
(448, 120, 'You have been assigned to ticket #91. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 09:33:39', 167),
(449, 35, 'You have been assigned to ticket #91. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:33:39', 167),
(450, 30, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:34:51', NULL),
(451, 34, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 1, '2025-06-30 09:34:51', NULL),
(452, 121, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:34:51', NULL),
(453, 145, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:34:51', NULL),
(454, 151, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-06-30 09:34:51', NULL),
(455, 37, 'Your ticket #92 has been updated: supervisor(s) changed to Anjali Wijesinghe	, Sasindu Perera, supervisor, status changed to Open by admin.', 'TICKET_UPDATED', 1, '2025-06-30 09:35:20', 170),
(456, 146, 'You have been assigned to ticket #92. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:35:20', 170),
(457, 120, 'You have been assigned to ticket #92. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 09:35:20', 170),
(458, 35, 'You have been assigned to ticket #92. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:35:20', 170),
(459, 23, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(460, 24, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(461, 26, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(462, 28, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(463, 30, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(464, 31, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(465, 34, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 1, '2025-06-30 09:38:24', NULL),
(466, 35, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 1, '2025-06-30 09:38:24', NULL),
(467, 38, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 1, '2025-06-30 09:38:24', NULL),
(468, 120, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(469, 121, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(470, 145, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(471, 146, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 1, '2025-06-30 09:38:24', NULL),
(472, 148, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(473, 151, 'New system added: cloud report system', 'NEW_SYSTEM_ADDED', 0, '2025-06-30 09:38:24', NULL),
(474, 23, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(475, 24, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(476, 26, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(477, 28, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(478, 30, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(479, 31, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(480, 34, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 1, '2025-06-30 09:39:54', NULL),
(481, 35, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 1, '2025-06-30 09:39:54', NULL),
(482, 38, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 1, '2025-06-30 09:39:54', NULL),
(483, 120, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(484, 121, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(485, 145, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(486, 146, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 1, '2025-06-30 09:39:54', NULL),
(487, 148, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(488, 151, 'New ticket category added: authentication bugs', 'NEW_CATEGORY_ADDED', 0, '2025-06-30 09:39:54', NULL),
(489, 23, 'Your ticket #72 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 09:41:04', 172),
(490, 35, 'Ticket #72 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-06-30 09:41:04', 172),
(491, 37, 'Your ticket #87 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-06-30 09:41:44', 174),
(492, 120, 'Ticket #87 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 09:41:44', 174),
(493, 30, 'New ticket created by User #37: inventory set up to navigate pattern...', 'NEW_TICKET', 0, '2025-06-30 09:43:06', NULL),
(494, 34, 'New ticket created by User #37: inventory set up to navigate pattern...', 'NEW_TICKET', 1, '2025-06-30 09:43:06', NULL),
(495, 121, 'New ticket created by User #37: inventory set up to navigate pattern...', 'NEW_TICKET', 0, '2025-06-30 09:43:06', NULL),
(496, 145, 'New ticket created by User #37: inventory set up to navigate pattern...', 'NEW_TICKET', 0, '2025-06-30 09:43:06', NULL),
(497, 151, 'New ticket created by User #37: inventory set up to navigate pattern...', 'NEW_TICKET', 0, '2025-06-30 09:43:06', NULL),
(498, 37, 'Your ticket #93 has been updated: supervisor(s) changed to Kanchana, Anjali Wijesinghe	, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-06-30 09:43:24', 176),
(499, 24, 'You have been assigned to ticket #93. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 09:43:24', 176),
(500, 146, 'You have been assigned to ticket #93. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 09:43:24', 176),
(501, 37, 'Your ticket #93 status has been changed from In Progress to Open', 'STATUS_UPDATE', 1, '2025-06-30 09:44:28', 179),
(502, 24, 'Ticket #93 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-06-30 09:44:28', 179),
(503, 37, 'Your ticket #93 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-06-30 09:47:47', 180),
(504, 24, 'Ticket #93 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 09:47:47', 180),
(505, 30, 'New User registered: dumisha abeyakon (dumi@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 10:33:53', NULL),
(506, 34, 'New User registered: dumisha abeyakon (dumi@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-30 10:33:53', NULL),
(507, 121, 'New User registered: dumisha abeyakon (dumi@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 10:33:53', NULL),
(508, 145, 'New User registered: dumisha abeyakon (dumi@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 10:33:53', NULL),
(509, 151, 'New User registered: dumisha abeyakon (dumi@gmail.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-30 10:33:53', NULL),
(510, 30, 'New client registered: ruwan book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-06-30 10:34:32', NULL),
(511, 34, 'New client registered: ruwan book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 1, '2025-06-30 10:34:32', NULL),
(512, 121, 'New client registered: ruwan book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-06-30 10:34:32', NULL),
(513, 145, 'New client registered: ruwan book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-06-30 10:34:32', NULL),
(514, 151, 'New client registered: ruwan book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-06-30 10:34:32', NULL),
(515, 149, 'Your ticket #80 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 10:36:34', 181),
(516, 24, 'Ticket #80 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-30 10:36:34', 181),
(517, 37, 'Supervisors removed from your ticket #93: supervisor', 'SUPERVISOR_REMOVED', 1, '2025-06-30 10:37:38', 183),
(518, 35, 'You have been removed from ticket #93', 'SUPERVISOR_UNASSIGNED', 1, '2025-06-30 10:37:38', 183),
(519, 37, 'New supervisors added to your ticket #93: supervisor', 'SUPERVISOR_ADDED', 1, '2025-06-30 10:39:14', 184),
(520, 35, 'You have been assigned to ticket #93', 'SUPERVISOR_ASSIGNED', 1, '2025-06-30 10:39:14', 184),
(521, 37, 'New supervisors added to your ticket #93: Tharupama', 'SUPERVISOR_ADDED', 1, '2025-06-30 10:40:30', 185),
(522, 23, 'You have been assigned to ticket #93', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 10:40:30', 185),
(523, 37, 'New supervisors added to your ticket #92: Tharupama, Kanchana', 'SUPERVISOR_ADDED', 1, '2025-06-30 10:41:09', 186),
(524, 23, 'You have been assigned to ticket #92', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 10:41:09', 186),
(525, 24, 'You have been assigned to ticket #92', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 10:41:09', 186),
(526, 37, 'Supervisors removed from your ticket #92: Sasindu Perera', 'SUPERVISOR_REMOVED', 1, '2025-06-30 10:41:09', 187),
(527, 120, 'You have been removed from ticket #92', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-30 10:41:09', 187),
(528, 30, 'New ticket created by User #37: log system...', 'NEW_TICKET', 0, '2025-06-30 10:43:09', NULL),
(529, 34, 'New ticket created by User #37: log system...', 'NEW_TICKET', 1, '2025-06-30 10:43:09', NULL),
(530, 121, 'New ticket created by User #37: log system...', 'NEW_TICKET', 0, '2025-06-30 10:43:09', NULL),
(531, 145, 'New ticket created by User #37: log system...', 'NEW_TICKET', 0, '2025-06-30 10:43:09', NULL),
(532, 151, 'New ticket created by User #37: log system...', 'NEW_TICKET', 0, '2025-06-30 10:43:09', NULL),
(533, 37, 'Your ticket #94 has been rejected by admin. Reason: Not a Bug', 'TICKET_REJECTED', 1, '2025-06-30 10:43:36', 188),
(534, 25, 'Your ticket #77 has been updated: supervisor(s) changed to Tharupama, Kanchana, Kusala, status changed to Resolved by admin.', 'TICKET_UPDATED', 0, '2025-06-30 10:44:31', 189),
(535, 23, 'Ticket #77 assigned to you has been updated: supervisor(s) changed to Tharupama, Kanchana, Kusala, status changed to Resolved by admin.', 'TICKET_UPDATED', 0, '2025-06-30 10:44:31', 189),
(536, 24, 'Ticket #77 assigned to you has been updated: supervisor(s) changed to Tharupama, Kanchana, Kusala, status changed to Resolved by admin.', 'TICKET_UPDATED', 0, '2025-06-30 10:44:31', 189),
(537, 26, 'You have been assigned to ticket #77. Status: Resolved, Priority: High. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-06-30 10:44:31', 189),
(538, 37, 'Your ticket #92 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-06-30 10:49:11', 191),
(539, 146, 'Ticket #92 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-06-30 10:49:11', 191),
(540, 37, 'Your ticket #86 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-07-01 01:09:05', 192),
(541, 35, 'Ticket #86 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-07-01 01:09:05', 192),
(542, 37, 'Your ticket #92 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 1, '2025-07-01 01:15:50', 193),
(543, 146, 'Ticket #92 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 0, '2025-07-01 01:15:50', 193),
(544, 25, 'New supervisors added to your ticket #77: Suneth Upendra', 'SUPERVISOR_ADDED', 0, '2025-07-01 01:17:42', 194),
(545, 28, 'You have been assigned to ticket #77', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:17:42', 194),
(546, 25, 'Supervisors removed from your ticket #77: Kanchana', 'SUPERVISOR_REMOVED', 0, '2025-07-01 01:17:42', 195),
(547, 24, 'You have been removed from ticket #77', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-01 01:17:42', 195),
(548, 37, 'New supervisors added to your ticket #89: Kanchana, Tharupama', 'SUPERVISOR_ADDED', 1, '2025-07-01 01:20:46', 196),
(549, 24, 'You have been assigned to ticket #89', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:20:46', 196),
(550, 23, 'You have been assigned to ticket #89', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:20:46', 196),
(551, 30, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:21:44', NULL),
(552, 34, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 1, '2025-07-01 01:21:44', NULL),
(553, 121, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:21:44', NULL),
(554, 145, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:21:44', NULL),
(555, 151, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:21:44', NULL),
(556, 37, 'Your ticket #95 has been updated: supervisor(s) changed to Kanchana, Kusala, status changed to In Progress by admin.', 'TICKET_UPDATED', 1, '2025-07-01 01:22:07', 197),
(557, 24, 'You have been assigned to ticket #95. Status: In Progress, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:22:07', 197),
(558, 26, 'You have been assigned to ticket #95. Status: In Progress, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:22:07', 197),
(559, 37, 'Your ticket #95 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 1, '2025-07-01 01:22:59', 199),
(560, 24, 'Ticket #95 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 0, '2025-07-01 01:22:59', 199),
(561, 37, 'New supervisors added to your ticket #93: Kusala', 'SUPERVISOR_ADDED', 1, '2025-07-01 01:23:22', 200),
(562, 26, 'You have been assigned to ticket #93', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:23:22', 200),
(563, 30, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:31:01', NULL),
(564, 34, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 1, '2025-07-01 01:31:01', NULL),
(565, 121, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:31:01', NULL),
(566, 145, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:31:01', NULL),
(567, 151, 'New ticket created by User #37: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-01 01:31:01', NULL),
(568, 23, 'Your ticket #72 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 0, '2025-07-01 01:31:15', 201),
(569, 35, 'Ticket #72 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 1, '2025-07-01 01:31:15', 201),
(570, 37, 'Your ticket #96 has been updated: supervisor(s) changed to Sasindu Perera, supervisor two, supervisor, status changed to Open by admin.', 'TICKET_UPDATED', 0, '2025-07-01 01:32:12', 202),
(571, 120, 'You have been assigned to ticket #96. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:32:12', 202),
(572, 38, 'You have been assigned to ticket #96. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 01:32:12', 202),
(573, 35, 'You have been assigned to ticket #96. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-07-01 01:32:12', 202),
(574, 25, 'Your ticket #76 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-07-01 01:33:43', 204),
(575, 24, 'Ticket #76 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-07-01 01:33:43', 204),
(576, 37, 'Supervisors removed from your ticket #96: supervisor two, supervisor', 'SUPERVISOR_REMOVED', 0, '2025-07-01 01:35:47', 205),
(577, 38, 'You have been removed from ticket #96', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-01 01:35:47', 205),
(578, 35, 'You have been removed from ticket #96', 'SUPERVISOR_UNASSIGNED', 1, '2025-07-01 01:35:47', 205),
(579, 37, 'Your ticket #85 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-01 01:36:47', 206),
(580, 24, 'Ticket #85 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-01 01:36:47', 206),
(581, 37, 'Your ticket #85 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-07-01 01:38:46', 208),
(582, 24, 'Ticket #85 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-07-01 01:38:46', 208),
(583, 37, 'Your ticket #88 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-01 02:13:59', 209),
(584, 146, 'Ticket #88 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-01 02:13:59', 209),
(585, 37, 'Your ticket #88 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-07-01 02:14:02', 210),
(586, 146, 'Ticket #88 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-07-01 02:14:02', 210),
(587, 37, 'Your ticket #86 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 0, '2025-07-01 02:15:03', 212),
(588, 35, 'Ticket #86 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 1, '2025-07-01 02:15:03', 212),
(589, 30, 'New ticket created by User #158: NEW TICKET update mange ...', 'NEW_TICKET', 0, '2025-07-01 02:16:10', NULL),
(590, 34, 'New ticket created by User #158: NEW TICKET update mange ...', 'NEW_TICKET', 1, '2025-07-01 02:16:10', NULL),
(591, 121, 'New ticket created by User #158: NEW TICKET update mange ...', 'NEW_TICKET', 0, '2025-07-01 02:16:10', NULL),
(592, 145, 'New ticket created by User #158: NEW TICKET update mange ...', 'NEW_TICKET', 0, '2025-07-01 02:16:10', NULL),
(593, 151, 'New ticket created by User #158: NEW TICKET update mange ...', 'NEW_TICKET', 0, '2025-07-01 02:16:10', NULL),
(594, 158, 'Your ticket #97 has been updated: supervisor(s) changed to Kanchana, Sasindu Perera, supervisor two, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 0, '2025-07-01 02:17:00', 213),
(595, 24, 'You have been assigned to ticket #97. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 02:17:00', 213),
(596, 120, 'You have been assigned to ticket #97. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 02:17:00', 213),
(597, 38, 'You have been assigned to ticket #97. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-07-01 02:17:00', 213),
(598, 158, 'Supervisors removed from your ticket #97: supervisor two', 'SUPERVISOR_REMOVED', 1, '2025-07-01 02:18:28', 216),
(599, 38, 'You have been removed from ticket #97', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-01 02:18:28', 216),
(600, 158, 'Your ticket #97 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 1, '2025-07-01 02:19:50', 217),
(601, 24, 'Ticket #97 status has been changed from In Progress to Resolved', 'STATUS_UPDATE', 0, '2025-07-01 02:19:50', 217),
(602, 158, 'Your ticket #97 status has been changed from Resolved to Open', 'STATUS_UPDATE', 1, '2025-07-01 02:21:23', 219),
(603, 24, 'Ticket #97 status has been changed from Resolved to Open', 'STATUS_UPDATE', 0, '2025-07-01 02:21:23', 219),
(604, 30, 'New ticket created by User #158: check log...', 'NEW_TICKET', 0, '2025-07-01 02:25:44', NULL),
(605, 34, 'New ticket created by User #158: check log...', 'NEW_TICKET', 1, '2025-07-01 02:25:44', NULL),
(606, 121, 'New ticket created by User #158: check log...', 'NEW_TICKET', 0, '2025-07-01 02:25:44', NULL),
(607, 145, 'New ticket created by User #158: check log...', 'NEW_TICKET', 0, '2025-07-01 02:25:44', NULL),
(608, 151, 'New ticket created by User #158: check log...', 'NEW_TICKET', 0, '2025-07-01 02:25:44', NULL),
(609, 158, 'Your ticket #98 has been updated: supervisor(s) changed to Tharupama, supervisor two, status changed to Open by admin.', 'TICKET_UPDATED', 1, '2025-07-01 02:26:03', 220),
(610, 23, 'You have been assigned to ticket #98. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 02:26:03', 220),
(611, 38, 'You have been assigned to ticket #98. Status: Open, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-01 02:26:03', 220),
(612, 158, 'Supervisors removed from your ticket #98: Tharupama', 'SUPERVISOR_REMOVED', 1, '2025-07-01 02:26:14', 222),
(613, 23, 'You have been removed from ticket #98', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-01 02:26:14', 222),
(614, 23, 'Your ticket #73 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-07-01 02:26:26', 223),
(615, 35, 'Ticket #73 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-07-01 02:26:26', 223),
(616, 158, 'New supervisors added to your ticket #98: Tharupama, Kanchana', 'SUPERVISOR_ADDED', 1, '2025-07-02 03:18:50', 224),
(617, 23, 'You have been assigned to ticket #98', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 03:18:50', 224),
(618, 24, 'You have been assigned to ticket #98', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 03:18:50', 224),
(619, 30, 'New ticket created by User #158: new log fearture recheck ...', 'NEW_TICKET', 0, '2025-07-02 03:20:19', NULL),
(620, 34, 'New ticket created by User #158: new log fearture recheck ...', 'NEW_TICKET', 1, '2025-07-02 03:20:19', NULL),
(621, 121, 'New ticket created by User #158: new log fearture recheck ...', 'NEW_TICKET', 0, '2025-07-02 03:20:19', NULL),
(622, 145, 'New ticket created by User #158: new log fearture recheck ...', 'NEW_TICKET', 0, '2025-07-02 03:20:19', NULL),
(623, 151, 'New ticket created by User #158: new log fearture recheck ...', 'NEW_TICKET', 0, '2025-07-02 03:20:19', NULL),
(624, 158, 'Your ticket #99 has been updated: supervisor(s) changed to Sasindu Perera, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-07-02 03:20:44', 225),
(625, 120, 'You have been assigned to ticket #99. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 03:20:44', 225),
(626, 158, 'Your ticket #99 status has been changed from In Progress to Open', 'STATUS_UPDATE', 1, '2025-07-02 03:25:19', 228),
(627, 120, 'Ticket #99 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-02 03:25:19', 228),
(628, 158, 'Your ticket #99 status has been changed from Open to In Progress', 'STATUS_UPDATE', 1, '2025-07-02 03:26:55', 230),
(629, 120, 'Ticket #99 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-07-02 03:26:55', 230),
(630, 158, 'New supervisors added to your ticket #99: Tharupama', 'SUPERVISOR_ADDED', 1, '2025-07-02 03:27:24', 231),
(631, 23, 'You have been assigned to ticket #99', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 03:27:24', 231),
(632, 158, 'Supervisors removed from your ticket #99: Sasindu Perera', 'SUPERVISOR_REMOVED', 1, '2025-07-02 03:27:24', 232),
(633, 120, 'You have been removed from ticket #99', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-02 03:27:24', 232),
(634, 30, 'New client registered: sarasawi book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-07-02 03:30:25', NULL),
(635, 34, 'New client registered: sarasawi book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 1, '2025-07-02 03:30:25', NULL),
(636, 121, 'New client registered: sarasawi book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-07-02 03:30:25', NULL),
(637, 145, 'New client registered: sarasawi book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-07-02 03:30:25', NULL),
(638, 151, 'New client registered: sarasawi book shop (Contact: dumi@gmail.com)', 'NEW_CLIENT_REGISTRATION', 0, '2025-07-02 03:30:25', NULL),
(639, 23, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(640, 24, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(641, 26, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(642, 28, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(643, 30, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(644, 31, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(645, 34, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 1, '2025-07-02 03:31:37', NULL),
(646, 35, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 1, '2025-07-02 03:31:37', NULL),
(647, 38, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(648, 120, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(649, 121, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(650, 145, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(651, 146, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(652, 148, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(653, 151, 'New system added: book management system', 'NEW_SYSTEM_ADDED', 0, '2025-07-02 03:31:37', NULL),
(654, 23, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(655, 24, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(656, 26, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(657, 28, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(658, 30, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(659, 31, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(660, 34, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 1, '2025-07-02 03:32:17', NULL),
(661, 35, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 1, '2025-07-02 03:32:17', NULL),
(662, 38, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(663, 120, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(664, 121, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(665, 145, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(666, 146, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(667, 148, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(668, 151, 'New ticket category added: db handeling', 'NEW_CATEGORY_ADDED', 0, '2025-07-02 03:32:17', NULL),
(669, 30, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-02 03:34:28', NULL),
(670, 34, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 1, '2025-07-02 03:34:28', NULL),
(671, 121, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-02 03:34:28', NULL),
(672, 145, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-02 03:34:28', NULL),
(673, 151, 'New ticket created by User #158: in the bug sometimes check evidance...', 'NEW_TICKET', 0, '2025-07-02 03:34:28', NULL),
(674, 158, 'New supervisors added to your ticket #99: Kanchana, Sasindu Perera, supervisor two, supervisor', 'SUPERVISOR_ADDED', 1, '2025-07-02 05:27:20', 233),
(675, 24, 'You have been assigned to ticket #99', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:27:20', 233),
(676, 120, 'You have been assigned to ticket #99', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:27:20', 233),
(677, 38, 'You have been assigned to ticket #99', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:27:20', 233),
(678, 35, 'You have been assigned to ticket #99', 'SUPERVISOR_ASSIGNED', 1, '2025-07-02 05:27:20', 233),
(679, 158, 'Supervisors removed from your ticket #99: Tharupama', 'SUPERVISOR_REMOVED', 1, '2025-07-02 05:27:20', 234),
(680, 23, 'You have been removed from ticket #99', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-02 05:27:20', 234),
(681, 158, 'New supervisors added to your ticket #99: Kusala', 'SUPERVISOR_ADDED', 1, '2025-07-02 05:28:53', 235),
(682, 26, 'You have been assigned to ticket #99', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:28:53', 235),
(683, 158, 'Your ticket #100 has been updated: supervisor(s) changed to Anjali Wijesinghe	, Sasindu Perera, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-07-02 05:30:05', 236),
(684, 146, 'You have been assigned to ticket #100. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:30:05', 236),
(685, 120, 'You have been assigned to ticket #100. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:30:05', 236),
(686, 158, 'New supervisors added to your ticket #100: supervisor', 'SUPERVISOR_ADDED', 1, '2025-07-02 05:30:54', 239),
(687, 35, 'You have been assigned to ticket #100', 'SUPERVISOR_ASSIGNED', 1, '2025-07-02 05:30:54', 239),
(688, 30, 'New ticket created by User #158: acess to the user conditon ...', 'NEW_TICKET', 0, '2025-07-02 05:43:27', NULL),
(689, 34, 'New ticket created by User #158: acess to the user conditon ...', 'NEW_TICKET', 1, '2025-07-02 05:43:27', NULL),
(690, 121, 'New ticket created by User #158: acess to the user conditon ...', 'NEW_TICKET', 0, '2025-07-02 05:43:27', NULL),
(691, 145, 'New ticket created by User #158: acess to the user conditon ...', 'NEW_TICKET', 0, '2025-07-02 05:43:27', NULL),
(692, 151, 'New ticket created by User #158: acess to the user conditon ...', 'NEW_TICKET', 0, '2025-07-02 05:43:27', NULL),
(693, 158, 'Your ticket #101 has been updated: supervisor(s) changed to Anjali Wijesinghe	, supervisor two, status changed to In Progress by admin.', 'TICKET_UPDATED', 1, '2025-07-02 05:43:49', 240),
(694, 146, 'You have been assigned to ticket #101. Status: In Progress, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:43:49', 240),
(695, 38, 'You have been assigned to ticket #101. Status: In Progress, Priority: Medium. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:43:49', 240),
(696, 158, 'New supervisors added to your ticket #101: Sasindu Perera', 'SUPERVISOR_ADDED', 0, '2025-07-02 05:44:03', 242),
(697, 120, 'You have been assigned to ticket #101', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 05:44:03', 242),
(698, 158, 'Supervisors removed from your ticket #101: Anjali Wijesinghe	', 'SUPERVISOR_REMOVED', 0, '2025-07-02 05:44:03', 243),
(699, 146, 'You have been removed from ticket #101', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-02 05:44:03', 243),
(700, 158, 'New supervisors added to your ticket #101: Tharupama by System', 'SUPERVISOR_ADDED', 0, '2025-07-02 06:11:16', 244),
(701, 23, 'You have been assigned to ticket #101 by System', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 06:11:16', 244),
(702, 158, 'New supervisors added to your ticket #101: Anjali Wijesinghe	 by System', 'SUPERVISOR_ADDED', 1, '2025-07-02 06:12:33', 245),
(703, 146, 'You have been assigned to ticket #101 by System', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 06:12:33', 245),
(704, 158, 'Supervisors removed from your ticket #101: Tharupama by System', 'SUPERVISOR_REMOVED', 0, '2025-07-02 06:12:33', 246),
(705, 23, 'You have been removed from ticket #101 by System', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-02 06:12:33', 246),
(706, 158, 'New supervisors added to your ticket #101: supervisor by System', 'SUPERVISOR_ADDED', 1, '2025-07-02 06:23:57', 247),
(707, 35, 'You have been assigned to ticket #101 by System', 'SUPERVISOR_ASSIGNED', 1, '2025-07-02 06:23:57', 247),
(708, 158, 'Supervisors removed from your ticket #101: supervisor two by System', 'SUPERVISOR_REMOVED', 1, '2025-07-02 06:23:57', 248),
(709, 38, 'You have been removed from ticket #101 by System', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-02 06:23:57', 248),
(710, 30, 'New ticket created by User #158: security checj ...', 'NEW_TICKET', 0, '2025-07-02 06:26:02', NULL),
(711, 34, 'New ticket created by User #158: security checj ...', 'NEW_TICKET', 1, '2025-07-02 06:26:02', NULL),
(712, 121, 'New ticket created by User #158: security checj ...', 'NEW_TICKET', 0, '2025-07-02 06:26:02', NULL),
(713, 145, 'New ticket created by User #158: security checj ...', 'NEW_TICKET', 0, '2025-07-02 06:26:02', NULL),
(714, 151, 'New ticket created by User #158: security checj ...', 'NEW_TICKET', 0, '2025-07-02 06:26:02', NULL),
(715, 158, 'New supervisors added to your ticket #101: Kariyawasam by admin', 'SUPERVISOR_ADDED', 1, '2025-07-02 06:27:30', 249),
(716, 31, 'You have been assigned to ticket #101 by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 06:27:30', 249),
(717, 158, 'Supervisors removed from your ticket #101: supervisor by admin', 'SUPERVISOR_REMOVED', 1, '2025-07-02 06:27:30', 250),
(718, 35, 'You have been removed from ticket #101 by admin', 'SUPERVISOR_UNASSIGNED', 1, '2025-07-02 06:27:30', 250),
(719, 158, 'Your ticket #102 has been updated: supervisor(s) assigned: Sasindu Perera, Anjali Wijesinghe	, status changed to In Progress, priority changed to Low by admin.', 'TICKET_UPDATED', 1, '2025-07-02 06:28:01', 251),
(720, 120, 'You have been assigned to ticket #102. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 06:28:01', 251),
(721, 146, 'You have been assigned to ticket #102. Status: In Progress, Priority: Low. Assigned by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 06:28:01', 251),
(722, 158, 'New supervisors added to your ticket #102: supervisor by admin', 'SUPERVISOR_ADDED', 1, '2025-07-02 06:28:39', 254),
(723, 35, 'You have been assigned to ticket #102 by admin', 'SUPERVISOR_ASSIGNED', 1, '2025-07-02 06:28:39', 254),
(724, 158, 'Supervisors removed from your ticket #102: Sasindu Perera by admin', 'SUPERVISOR_REMOVED', 1, '2025-07-02 06:28:39', 255),
(725, 120, 'You have been removed from ticket #102 by admin', 'SUPERVISOR_UNASSIGNED', 0, '2025-07-02 06:28:39', 255),
(726, 23, 'Your ticket #73 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-02 06:36:44', 256),
(727, 35, 'Ticket #73 status has been changed from In Progress to Open', 'STATUS_UPDATE', 1, '2025-07-02 06:36:44', 256),
(728, 25, 'Your ticket #68 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-02 06:44:37', 258),
(729, 35, 'Ticket #68 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-07-02 06:44:37', 258),
(730, 23, 'Your ticket #73 status has been changed from Open to In Progress by Unknown User', 'STATUS_UPDATE', 0, '2025-07-02 06:48:47', 259),
(731, 145, 'You were mentioned in a comment on ticket #73 by supervisor', 'MENTION', 0, '2025-07-02 06:49:51', 91),
(732, 34, 'You were mentioned in a comment on ticket #73 by supervisor', 'MENTION', 1, '2025-07-02 06:49:51', 91),
(733, 145, 'You were mentioned in a comment on ticket #73 by supervisor', 'MENTION', 0, '2025-07-02 06:50:30', 92),
(734, 34, 'You were mentioned in a comment on ticket #73 by supervisor', 'MENTION', 1, '2025-07-02 06:50:44', 93),
(735, 158, 'Your ticket #101 status has been changed from In Progress to Open by Unknown User', 'STATUS_UPDATE', 1, '2025-07-02 06:52:19', 265),
(736, 120, 'Ticket #101 status has been changed from In Progress to Open by Unknown User', 'STATUS_UPDATE', 0, '2025-07-02 06:52:19', 265),
(737, 158, 'Your ticket #101 status has been changed from Open to In Progress by Unknown User', 'STATUS_UPDATE', 1, '2025-07-02 07:01:16', 268),
(738, 120, 'Ticket #101 status has been changed from Open to In Progress by Unknown User', 'STATUS_UPDATE', 0, '2025-07-02 07:01:16', 268),
(739, 158, 'New supervisors added to your ticket #102: supervisor two by admin', 'SUPERVISOR_ADDED', 1, '2025-07-02 07:05:25', 270),
(740, 38, 'You have been assigned to ticket #102 by admin', 'SUPERVISOR_ASSIGNED', 0, '2025-07-02 07:05:25', 270);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, 30, 'adc0945f-1fad-4504-afa7-a77068932ff2', '2025-06-17 13:40:13', '2025-06-17 07:10:13');

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
CREATE TABLE IF NOT EXISTS `ticket` (
  `TicketID` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `AsipiyaSystemID` int DEFAULT NULL,
  `DateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketCategoryID` int DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `Status` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Priority` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FirstRespondedTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastRespondedTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketDuration` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SupervisorID` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `UserNote` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `DueDate` timestamp NULL DEFAULT NULL,
  `Resolution` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`TicketID`),
  KEY `UserId` (`UserId`),
  KEY `AsipiyaSystemID` (`AsipiyaSystemID`),
  KEY `TicketCategoryID` (`TicketCategoryID`),
  KEY `fk_supervisor` (`SupervisorID`(250)),
  KEY `TicketID` (`TicketID`)
) ENGINE=MyISAM AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`TicketID`, `UserId`, `AsipiyaSystemID`, `DateTime`, `TicketCategoryID`, `Description`, `Status`, `Priority`, `FirstRespondedTime`, `LastRespondedTime`, `TicketDuration`, `SupervisorID`, `UserNote`, `DueDate`, `Resolution`, `Reason`) VALUES
(77, 25, 9, '2025-06-26 08:19:44', 11, 'euyodipoewk9wur48woiejf;l', 'Resolved', 'High', '2025-06-26 08:19:44', '2025-06-30 10:44:31', NULL, '23,26,28', NULL, NULL, NULL, NULL),
(68, 25, 9, '2025-06-25 08:54:51', 16, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'Open', 'Low', '2025-06-25 08:54:51', '2025-07-02 06:44:37', NULL, '35', NULL, NULL, NULL, NULL),
(69, 23, 7, '2025-06-25 11:36:45', 12, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'Rejected', 'Medium', '2025-06-30 04:50:50', '2025-06-29 05:39:55', NULL, '24,26,27', NULL, NULL, NULL, 'Invalid Request'),
(70, 23, 13, '2025-06-25 11:37:26', 13, 'yuzjknkamzyw8kz;q/', 'In Progress', 'Medium', '2025-06-25 11:37:26', '2025-06-30 03:20:10', NULL, '24,26,27,28', NULL, NULL, NULL, NULL),
(71, 25, 13, '2025-06-25 11:37:53', 12, 'fygnlkmak9u8upoqza', 'In Progress', 'Medium', '2025-06-25 11:37:53', '2025-06-29 04:21:10', NULL, '27,26,24', NULL, NULL, NULL, NULL),
(72, 23, 9, '2025-06-26 03:24:40', 11, 'AHUSSUHJKSNKAUsSYI', 'Resolved', 'Medium', '2025-06-26 03:24:40', '2025-07-01 01:31:15', NULL, '35', NULL, '2025-06-09 18:30:00', NULL, NULL),
(73, 23, 9, '2025-06-26 03:24:56', 14, '7dywadijwkajudyyaiudoisajoko', 'In Progress', 'Medium', '2025-06-26 03:24:56', '2025-07-02 06:48:47', NULL, '35', NULL, '2025-07-10 18:30:00', 'new user eperience woww', NULL),
(74, 23, 9, '2025-06-26 03:25:18', 11, 'jasjkx,m,s ,c', 'Reject', 'Medium', '2025-06-26 06:52:07', '2025-06-26 03:25:18', NULL, NULL, NULL, NULL, NULL, 'JDUYD8U'),
(75, 25, 9, '2025-06-26 03:25:40', 11, 'aQRSTQ7YSK', 'In Progress', 'Medium', '2025-06-26 03:25:40', '2025-06-26 03:45:54', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(76, 25, 9, '2025-06-26 03:26:07', 12, 'TWHAIKMLDMLK', 'In Progress', 'Medium', '2025-06-26 03:26:07', '2025-07-01 01:33:43', NULL, '24,26,27', NULL, '2025-07-24 18:30:00', NULL, NULL),
(78, 33, 13, '2025-06-27 05:49:25', 12, 'hii', 'Resolved', 'Medium', '2025-06-27 05:49:25', '2025-06-28 18:01:15', NULL, '24,26', NULL, NULL, NULL, NULL),
(79, 33, 9, '2025-06-28 18:13:44', 12, 'MS.RANDULA', 'Open', 'Medium', '2025-06-28 18:13:44', '2025-06-29 05:13:13', NULL, '24,26', NULL, NULL, NULL, NULL),
(80, 149, 7, '2025-06-29 04:31:13', 12, 'kjnkj', 'In Progress', 'Medium', '2025-06-29 04:31:13', '2025-06-30 10:36:34', NULL, '24,26,30', NULL, '2025-06-12 18:30:00', NULL, NULL),
(81, 36, 9, '2025-06-30 03:22:29', 12, 'Menuka', 'In Progress', 'Low', '2025-06-30 03:22:29', '2025-06-30 03:22:55', NULL, '24,28,26', NULL, NULL, NULL, NULL),
(82, 36, 7, '2025-06-30 04:45:34', 12, 'djk', 'Rejected', 'Medium', '2025-06-30 04:45:53', '2025-06-30 04:45:34', NULL, NULL, NULL, NULL, NULL, 'Not a Bug'),
(83, 36, 13, '2025-06-30 04:46:53', 12, 'tg', 'Rejected', 'Medium', '2025-06-30 04:47:24', '2025-06-30 04:46:53', NULL, NULL, NULL, NULL, NULL, 'Invalid Request'),
(84, 36, 7, '2025-06-30 04:59:05', 11, 'PLZ CHECK THATA DB STORE', 'Rejected', 'Medium', '2025-06-30 04:59:22', '2025-06-30 04:59:05', NULL, NULL, NULL, NULL, NULL, 'Feature Request Misclassified as Bug'),
(85, 37, 13, '2025-06-30 08:57:05', 13, 'NEW TICKET', 'In Progress', 'Low', '2025-06-30 08:57:05', '2025-07-01 01:38:46', NULL, '24,23,35', NULL, '2025-07-24 18:30:00', NULL, NULL),
(86, 37, 13, '2025-06-30 09:02:52', 13, 'bugs fixed plz', 'Resolved', 'Medium', '2025-06-30 09:02:52', '2025-07-01 02:15:03', NULL, '35,38', NULL, NULL, NULL, NULL),
(87, 37, 7, '2025-06-30 09:15:23', 12, 'one supervisor', 'In Progress', 'Low', '2025-06-30 09:15:23', '2025-06-30 09:41:44', NULL, '120,35', NULL, '2025-06-06 18:30:00', 'thats great', NULL),
(88, 37, 7, '2025-06-30 09:15:39', 13, 'two supervisor', 'Resolved', 'Low', '2025-06-30 09:15:39', '2025-07-01 02:14:02', NULL, '146', NULL, '2025-08-01 18:30:00', 'that is graet', NULL),
(89, 37, 13, '2025-06-30 09:15:53', 12, 'thre', 'In Progress', 'Low', '2025-06-30 09:15:53', '2025-06-30 09:17:59', NULL, '35,38,24,23', NULL, NULL, NULL, NULL),
(90, 158, 9, '2025-06-30 09:25:32', 12, 'in the bug sometimes check evidance', 'Rejected', 'Medium', '2025-06-30 09:26:46', '2025-06-30 09:25:32', NULL, NULL, NULL, NULL, NULL, 'Duplicate Ticket'),
(91, 158, 6, '2025-06-30 09:33:04', 12, 'in the bug sometimes check evidance', 'In Progress', 'Low', '2025-06-30 09:33:04', '2025-06-30 09:33:39', NULL, '146,120,35', NULL, NULL, NULL, NULL),
(92, 37, 8, '2025-06-30 09:34:51', 12, 'in the bug sometimes check evidance', 'Resolved', 'Medium', '2025-06-30 09:34:51', '2025-07-01 01:15:50', NULL, '146,23,24', NULL, NULL, NULL, NULL),
(93, 37, 7, '2025-06-30 09:43:06', 12, 'inventory set up to navigate pattern', 'In Progress', 'Low', '2025-06-30 09:43:06', '2025-06-30 09:47:47', NULL, '24,146,38,35,23,26', NULL, NULL, NULL, NULL),
(94, 37, 5, '2025-06-30 10:43:09', 12, 'log system', 'Rejected', 'Medium', '2025-06-30 10:43:36', '2025-06-30 10:43:09', NULL, NULL, NULL, NULL, NULL, 'Not a Bug'),
(95, 37, 5, '2025-07-01 01:21:44', 11, 'in the bug sometimes check evidance', 'Resolved', 'Medium', '2025-07-01 01:21:44', '2025-07-01 01:22:59', NULL, '24,26', NULL, NULL, NULL, NULL),
(96, 37, 6, '2025-07-01 01:31:01', 13, 'in the bug sometimes check evidance', 'Open', 'Medium', '2025-07-01 01:31:01', '2025-07-01 01:32:12', NULL, '120', NULL, NULL, NULL, NULL),
(97, 158, 5, '2025-07-01 02:16:10', 13, 'NEW TICKET update mange ', 'Open', 'Low', '2025-07-01 02:16:10', '2025-07-01 02:21:23', NULL, '24,120', NULL, '2025-07-24 18:30:00', NULL, NULL),
(98, 158, 6, '2025-07-01 02:25:44', 12, 'check log', 'Open', 'Medium', '2025-07-01 02:25:44', '2025-07-01 02:26:03', NULL, '38,23,24', NULL, NULL, NULL, NULL),
(99, 158, 6, '2025-07-02 03:20:19', 14, 'new log fearture recheck ', 'In Progress', 'Low', '2025-07-02 03:20:19', '2025-07-02 03:26:55', NULL, '24,120,38,35,26', NULL, '2025-07-10 18:30:00', NULL, NULL),
(100, 158, 8, '2025-07-02 03:34:28', 11, 'in the bug sometimes check evidance', 'In Progress', 'Low', '2025-07-02 03:34:28', '2025-07-02 05:30:05', NULL, '146,120,35', NULL, NULL, NULL, NULL),
(101, 158, 8, '2025-07-02 05:43:27', 15, 'acess to the user conditon ', 'In Progress', 'Medium', '2025-07-02 05:43:27', '2025-07-02 07:01:16', NULL, '120,146,31', NULL, '2025-07-18 18:30:00', 'updated cheked', NULL),
(102, 158, 8, '2025-07-02 06:26:02', 14, 'security checj ', 'In Progress', 'Low', '2025-07-02 06:26:02', '2025-07-02 06:28:01', NULL, '146,35,38', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticketcategory`
--

DROP TABLE IF EXISTS `ticketcategory`;
CREATE TABLE IF NOT EXISTS `ticketcategory` (
  `TicketCategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`TicketCategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketcategory`
--

INSERT INTO `ticketcategory` (`TicketCategoryID`, `CategoryName`, `Description`, `Status`) VALUES
(11, 'Service Request', 'Request for a new service, feature access, or resource.', 1),
(12, 'Billing or Payment Issue', 'Raise concerns about incorrect charges, invoices, or payment processing problems.', 1),
(13, 'Data Correction/Update', 'Report incorrect or outdated information in the system that needs to be updated or corrected.', 1),
(14, 'Security Concern', 'Report suspicious activity, data breaches, unauthorized access, or password-related concerns.', 1),
(15, 'User Access or Permission Issue', 'Use this to request changes in user roles, access levels, or resolve permission-related problems.', 1),
(16, 'General Complaint', 'Any issue that doesn\'t fit other categories — such as dissatisfaction with support, services.', 1),
(21, 'authentication bugs', 'plz check the authentication bug in reported', 1),
(22, 'db handeling', 'in the db issues resolve that', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ticketchat`
--

DROP TABLE IF EXISTS `ticketchat`;
CREATE TABLE IF NOT EXISTS `ticketchat` (
  `TicketChatID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int DEFAULT NULL,
  `Type` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Note` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UserCustomerID` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  `Path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `Role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Seen` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`TicketChatID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketchat`
--

INSERT INTO `ticketchat` (`TicketChatID`, `TicketID`, `Type`, `Note`, `UserCustomerID`, `UserID`, `Path`, `Role`, `CreatedAt`, `Seen`) VALUES
(1, 31, 'text', 'Hii', NULL, 25, NULL, 'User', '2025-06-23 05:45:45', 0),
(2, 55, 'text', 'Hii', NULL, 25, NULL, 'User', '2025-06-23 05:45:59', 0),
(3, 55, 'file', 'C__Windows_System32_cmd.exe 2025-06-18 17-36-', NULL, 25, 'undefined-1750657576015.mp4', 'User', '2025-06-23 05:46:16', 0),
(4, 61, 'text', 'Hellow', NULL, 23, NULL, 'User', '2025-06-25 04:59:38', 0),
(5, 69, 'text', 'hello', NULL, 24, NULL, 'Supervisor', '2025-06-27 11:27:36', 0),
(6, 69, 'text', 'plz can have help for your ', NULL, 24, NULL, 'Supervisor', '2025-06-27 11:28:05', 0);

-- --------------------------------------------------------

--
-- Table structure for table `ticketlog`
--

DROP TABLE IF EXISTS `ticketlog`;
CREATE TABLE IF NOT EXISTS `ticketlog` (
  `TicketLogID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int DEFAULT NULL,
  `DateTime` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Type` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `Note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `UserID` int DEFAULT NULL,
  `OldValue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NewValue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`TicketLogID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketlog`
--

INSERT INTO `ticketlog` (`TicketLogID`, `TicketID`, `DateTime`, `Type`, `Description`, `Note`, `UserID`, `OldValue`, `NewValue`) VALUES
(1, 59, '2025-06-23 20:09:51', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '28'),
(2, 59, '2025-06-23 20:09:51', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(3, 59, '2025-06-23 20:15:24', 'COMMENT', '@Govindi Tharupama Hellooo', NULL, 22, NULL, NULL),
(4, 59, '2025-06-24 11:55:55', 'COMMENT', 'Comment added by Suneth Upendra: \"@Kanchana @Kusala...\"', NULL, 28, NULL, NULL),
(5, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Kanchana', 'Assigned by 28', 28, NULL, '24'),
(6, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Kusala', 'Assigned by 28', 28, NULL, '26'),
(7, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Govindi Tharupama', 'Assigned by 28', 28, NULL, '27'),
(8, 61, '2025-06-24 12:33:33', 'SUPERVISOR_ASSIGNMENT', 'Suneth Upendra (Supervisor) Supervisor assigned: Suneth Upendra', 'Assigned by 28', 28, NULL, '28'),
(9, 63, '2025-06-25 11:48:48', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27,28'),
(10, 63, '2025-06-25 11:50:40', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27,28', '24,26,27,28,30'),
(11, 63, '2025-06-25 11:50:40', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to High', 'Updated by null', 22, 'Medium', 'High'),
(12, 63, '2025-06-25 11:58:18', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27,28,30', '24,26,27,28'),
(13, 63, '2025-06-25 11:58:18', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to In Progress', 'Updated by null', 22, 'Pending', 'In Progress'),
(14, 63, '2025-06-25 11:58:18', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from High to Medium', 'Updated by null', 22, 'High', 'Medium'),
(15, 58, '2025-06-25 13:09:24', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '26,27,28,30'),
(16, 57, '2025-06-25 13:16:55', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '26,27,28'),
(17, 57, '2025-06-25 13:18:20', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '24,26,27'),
(18, 57, '2025-06-25 13:38:15', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27', '26,27,28'),
(19, 58, '2025-06-25 13:43:01', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28,30', '26,27,28'),
(20, 58, '2025-06-25 13:44:34', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '24,26,27'),
(21, 68, '2025-06-25 14:45:40', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(22, 68, '2025-06-25 14:46:28', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27', '26,27,28'),
(23, 68, '2025-06-25 15:10:19', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '26,27,28', '24,27'),
(24, 68, '2025-06-25 16:16:42', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,27', '24,26,27'),
(25, 68, '2025-06-25 16:22:00', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27', '24,26,27,28'),
(26, 68, '2025-06-25 16:22:00', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Pending', 'Updated by null', 22, 'Pending', 'Pending'),
(27, 68, '2025-06-25 16:22:00', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(28, 68, '2025-06-25 16:34:01', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, '24,26,27,28', '24,26,27'),
(29, 68, '2025-06-25 16:34:01', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(30, 68, '2025-06-25 16:34:01', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(31, 67, '2025-06-25 16:36:20', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27,28'),
(32, 67, '2025-06-25 16:36:20', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to In Progress', 'Updated by null', 22, 'Pending', 'In Progress'),
(33, 67, '2025-06-25 16:36:20', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to High', 'Updated by null', 22, 'Medium', 'High'),
(34, 66, '2025-06-25 16:39:52', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '27,28'),
(35, 66, '2025-06-25 16:39:53', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(36, 66, '2025-06-25 16:39:53', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(37, 65, '2025-06-25 16:40:03', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(38, 65, '2025-06-25 16:40:03', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Resolved', 'Updated by null', 22, 'Pending', 'Resolved'),
(39, 65, '2025-06-25 16:40:03', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Low', 'Updated by null', 22, 'Medium', 'Low'),
(40, 69, '2025-06-25 17:24:01', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(41, 69, '2025-06-25 17:24:01', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(42, 69, '2025-06-25 17:24:01', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(43, 70, '2025-06-25 17:31:28', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27,28'),
(44, 70, '2025-06-25 17:31:28', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(45, 70, '2025-06-25 17:31:28', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(46, 71, '2025-06-25 18:40:32', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '27,26,24'),
(47, 71, '2025-06-25 18:40:32', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(48, 71, '2025-06-25 18:40:32', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(49, 76, '2025-06-26 09:11:32', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(50, 76, '2025-06-26 09:11:32', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(51, 76, '2025-06-26 09:11:32', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(52, 75, '2025-06-26 09:15:54', 'SUPERVISOR_CHANGE', 'Govindi (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 22, NULL, '24,26,27'),
(53, 75, '2025-06-26 09:15:54', 'STATUS_CHANGE', 'Govindi (Admin) Status changed from Pending to Open', 'Updated by null', 22, 'Pending', 'Open'),
(54, 75, '2025-06-26 09:15:54', 'PRIORITY_CHANGE', 'Govindi (Admin) Priority changed from Medium to Medium', 'Updated by null', 22, 'Medium', 'Medium'),
(55, 68, '2025-06-27 11:43:40', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @Govindi...\"', NULL, 34, NULL, NULL),
(56, 68, '2025-06-27 11:45:13', 'COMMENT', 'Comment added by admin: \"tyy...\"', NULL, 34, NULL, NULL),
(57, 68, '2025-06-27 11:45:45', 'COMMENT', 'Comment added by admin: \"kk...\"', NULL, 34, NULL, NULL),
(58, 68, '2025-06-27 12:10:14', 'COMMENT', 'Comment added by admin: \"@Kanchana...\"', NULL, 34, NULL, NULL),
(59, 68, '2025-06-27 12:49:35', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama hii @Kusala              @Kusala...\"', NULL, 34, NULL, NULL),
(60, 68, '2025-06-27 13:57:12', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama hii @Kanchana @Kusala hii@Govindi hii @admin...\"', NULL, 34, NULL, NULL),
(61, 68, '2025-06-27 13:58:15', 'COMMENT', 'Comment added by admin: \"hii @Kusala  @Kanchana hii @Govindi hii @Govindi @Kusala...\"', NULL, 34, NULL, NULL),
(62, 68, '2025-06-27 14:00:45', 'COMMENT', 'Comment added by admin: \"hii @Kusala @admin hii @Kanchana @Kusala...\"', NULL, 34, NULL, NULL),
(63, 68, '2025-06-27 14:01:00', 'COMMENT', 'Comment added by admin: \"@Govindi @Kanchana @Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(64, 68, '2025-06-27 14:23:33', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @Kanchana @Kanchana...\"', NULL, 34, NULL, NULL),
(65, 68, '2025-06-27 14:36:26', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @Kanchana...\"', NULL, 34, NULL, NULL),
(66, 68, '2025-06-27 15:27:34', 'COMMENT', 'Comment added by admin: \"@All Admins hii...\"', NULL, 34, NULL, NULL),
(67, 71, '2025-06-27 15:28:08', 'COMMENT', 'Comment added by admin: \"@All Admins hii...\"', NULL, 34, NULL, NULL),
(68, 77, '2025-06-27 16:01:50', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '26'),
(69, 77, '2025-06-27 16:01:50', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(70, 77, '2025-06-27 16:01:50', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(71, 72, '2025-06-27 16:02:14', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '27'),
(72, 72, '2025-06-27 16:02:14', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(73, 72, '2025-06-27 16:02:14', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(74, 72, '2025-06-27 16:04:45', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @All Admhiiins...\"', NULL, 34, NULL, NULL),
(75, 72, '2025-06-27 16:05:04', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama @All Admins @admin @Govindi...\"', NULL, 34, NULL, NULL),
(76, 77, '2025-06-27 16:16:08', 'COMMENT', 'Comment added by admin: \"@Kusala hihii @Kusala            @All Admins           hiioplop...\"', NULL, 34, NULL, NULL),
(77, 77, '2025-06-27 16:50:06', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to Resolved', 'Status updated by User ID: 34', 34, 'Open', 'Resolved'),
(78, 69, '2025-06-27 16:55:48', 'COMMENT', 'Comment added by admin: \"hi@Govindi Tharupama hii...\"', NULL, 34, NULL, NULL),
(79, 71, '2025-06-27 19:14:59', 'COMMENT', 'Comment added by admin: \"kk...\"', NULL, 34, NULL, NULL),
(80, 71, '2025-06-27 19:23:37', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(81, 71, '2025-06-27 19:27:09', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(82, 68, '2025-06-27 21:26:05', 'COMMENT', 'Comment added by admin: \"m...\"', NULL, 34, NULL, NULL),
(83, 68, '2025-06-27 21:31:48', 'COMMENT', 'Comment added by admin: \"jii\"', NULL, 34, NULL, NULL),
(84, 68, '2025-06-27 21:32:06', 'COMMENT', 'Comment added by admin: \"hii\"', NULL, 34, NULL, NULL),
(85, 68, '2025-06-27 21:44:07', 'COMMENT', 'Comment added by admin: \"\"', NULL, 34, NULL, NULL),
(86, 68, '2025-06-27 21:56:09', 'COMMENT', 'Comment added by admin: \"huu @Govindi Tharupama\"', NULL, 34, NULL, NULL),
(87, 68, '2025-06-27 22:17:01', 'COMMENT', 'Comment added by admin: \"@Kanchana\"', NULL, 34, NULL, NULL),
(88, 68, '2025-06-28 12:59:37', 'COMMENT', 'Comment added by admin: \"@All Admins  hi@Govindi Tharupama\"', NULL, 34, NULL, NULL),
(89, 68, '2025-06-28 13:01:22', 'COMMENT', 'Comment added by admin: \"\"', NULL, 34, NULL, NULL),
(90, 68, '2025-06-28 13:17:58', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(91, 68, '2025-06-28 13:18:09', 'COMMENT', 'Comment added by admin: \"@All Admins...\"', NULL, 34, NULL, NULL),
(92, 68, '2025-06-28 13:19:48', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(93, 68, '2025-06-28 13:40:13', 'COMMENT', 'Comment added by admin: \"f...\"', NULL, 34, NULL, NULL),
(94, 68, '2025-06-28 13:56:02', 'COMMENT', 'Comment added by admin: \"hi @Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(95, 68, '2025-06-28 13:56:36', 'COMMENT', 'Comment added by admin: \"hii @Govindi Tharupama @All Admins hii helo...\"', NULL, 34, NULL, NULL),
(96, 68, '2025-06-28 14:13:02', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama  hi @Govindi Tharupama hi...\"', NULL, 34, NULL, NULL),
(97, 71, '2025-06-28 14:16:56', 'COMMENT', 'Comment added by admin: \"@Kanchana...\"', NULL, 34, NULL, NULL),
(98, 71, '2025-06-28 14:24:16', 'COMMENT', 'Comment added by admin: \"iii @Govindi Tharupama jiojk@Kanchana jkkio@Kanchana ge huu@Govindi...\"', NULL, 34, NULL, NULL),
(99, 68, '2025-06-28 14:36:57', 'COMMENT', 'Comment added by admin: \"jj@Govindi Tharupama ji@Kanchana hr@admin...\"', NULL, 34, NULL, NULL),
(100, 68, '2025-06-28 14:38:29', 'COMMENT', 'Comment added by admin: \"kjkhk@Kanchana jki@admin kji...\"', NULL, 34, NULL, NULL),
(101, 68, '2025-06-28 14:39:09', 'COMMENT', 'Comment added by admin: \"ioi @Govindi Tharupama jiu@Govindi Tharupama huury88rhhui@Kanchana...\"', NULL, 34, NULL, NULL),
(102, 68, '2025-06-28 14:42:15', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama  huu @Kanchana...\"', NULL, 34, NULL, NULL),
(103, 68, '2025-06-28 14:43:33', 'COMMENT', 'Comment added by admin: \"hiui @Govindi Tharupama huib ejh ejhjh @All Admins  jiiii  hiii@Kanchana huuihknmk,kk k k k k jiyijy...\"', NULL, 34, NULL, NULL),
(104, 71, '2025-06-28 19:30:13', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(105, 71, '2025-06-28 19:42:43', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(106, 71, '2025-06-28 19:42:59', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(107, 71, '2025-06-28 19:44:07', 'COMMENT', 'Comment added by admin: \"...\"', NULL, 34, NULL, NULL),
(108, 71, '2025-06-28 19:55:14', 'COMMENT', 'Comment added by admin: \"hu @Govindi Tharupama   hdjhjchdki    h@Kanchana hififosnfmvnmmm     uriuofff@Govindi mcffc,flkjkfjj...\"', NULL, 34, NULL, NULL),
(109, 68, '2025-06-28 21:34:57', 'COMMENT', 'Comment added by admin: \"jkj @Govindi Tharupama ddddddd@Govindi dd@Govindi ddd@admin...\"', NULL, 34, NULL, NULL),
(110, 68, '2025-06-28 23:28:28', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama jooiighgytrryrrtrrjhbj    gy@Govindi Tharupama bhjbjhjbh ghg@Kanchana yguygyu...\"', NULL, 34, NULL, NULL),
(111, 78, '2025-06-28 23:31:15', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '24,26'),
(112, 78, '2025-06-28 23:31:15', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Resolved', 'Updated by null', 34, 'Pending', 'Resolved'),
(113, 78, '2025-06-28 23:31:15', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(114, 68, '2025-06-28 23:33:27', 'COMMENT', 'Comment added by admin: \"HII@Kanchana  HII   @Kanchana...\"', NULL, 34, NULL, NULL),
(115, 68, '2025-06-29 00:06:32', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama jjj,f,m f,mf fmf,d fm,@Govindi flkmrl@admin...\"', NULL, 34, NULL, NULL),
(116, 68, '2025-06-29 00:17:59', 'COMMENT', 'Comment added by admin: \"ji@Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(117, 68, '2025-06-29 00:19:03', 'COMMENT', 'Comment added by admin: \"@Govindi Tharupama hi @Govindi Tharupama hi@All Admins hui@Govindi hjhh@Govindi Tharupama...\"', NULL, 34, NULL, NULL),
(118, 71, '2025-06-29 09:51:10', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(119, 68, '2025-06-29 10:27:00', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(120, 80, '2025-06-29 10:42:57', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '24,26,30'),
(121, 80, '2025-06-29 10:42:57', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(122, 80, '2025-06-29 10:42:57', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(123, 79, '2025-06-29 10:43:13', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '24,26'),
(124, 79, '2025-06-29 10:43:13', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by null', 34, 'Pending', 'Open'),
(125, 79, '2025-06-29 10:43:13', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(126, 69, '2025-06-29 11:09:55', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(127, 80, '2025-06-29 11:16:20', 'COMMENT', 'Comment added by admin: \"HI @Kariyawasam    HAIEIOE...\"', NULL, 34, NULL, NULL),
(128, 79, '2025-06-29 23:11:02', 'COMMENT', 'Comment added by admin: \"@Kanchana HII @Kusala  HII @admin...\"', NULL, 34, NULL, NULL),
(129, 70, '2025-06-30 08:50:10', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(130, 81, '2025-06-30 08:52:55', 'SUPERVISOR_CHANGE', 'supervisor (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 35, NULL, '23,24'),
(131, 81, '2025-06-30 08:52:55', 'STATUS_CHANGE', 'supervisor (Supervisor) Status changed from Pending to In Progress', 'Updated by null', 35, 'Pending', 'In Progress'),
(132, 81, '2025-06-30 08:52:55', 'PRIORITY_CHANGE', 'supervisor (Supervisor) Priority changed from Medium to Low', 'Updated by null', 35, 'Medium', 'Low'),
(133, 73, '2025-06-30 08:53:41', 'SUPERVISOR_CHANGE', 'supervisor (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 35, NULL, '35'),
(134, 73, '2025-06-30 08:53:41', 'STATUS_CHANGE', 'supervisor (Supervisor) Status changed from Pending to Open', 'Updated by null', 35, 'Pending', 'Open'),
(135, 73, '2025-06-30 08:53:41', 'PRIORITY_CHANGE', 'supervisor (Supervisor) Priority changed from Medium to Medium', 'Updated by null', 35, 'Medium', 'Medium'),
(136, 72, '2025-06-30 09:09:38', 'COMMENT', 'Comment added by supervisor: \"hi @admin   hi @supervisor     hi...\"', NULL, 35, NULL, NULL),
(137, 82, '2025-06-30 10:15:52', 'TICKET_REJECTED', 'admin (Admin) Ticket rejected: Not a Bug', 'Not a Bug', 34, 'Pending', 'Rejected'),
(138, 77, '2025-06-30 10:17:15', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, '35', '23,24'),
(139, 77, '2025-06-30 10:17:15', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by null', 34, 'Pending', 'In Progress'),
(140, 77, '2025-06-30 10:17:15', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to High', 'Updated by null', 34, 'Medium', 'High'),
(141, 83, '2025-06-30 10:17:24', 'TICKET_REJECTED', 'admin (Admin) Ticket rejected: Invalid Request', 'Invalid Request', 34, 'Pending', 'Rejected'),
(142, 69, '2025-06-30 10:20:49', 'TICKET_REJECTED', 'admin (Admin) Ticket rejected: Invalid Request', 'Invalid Request', 34, 'Pending', 'Rejected'),
(143, 84, '2025-06-30 10:29:22', 'TICKET_REJECTED', 'admin (Admin) Ticket rejected: Feature Request Misclassified as Bug', 'Feature Request Misclassified as Bug', 34, 'Pending', 'Rejected'),
(144, 68, '2025-06-30 10:29:36', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, '24,26,27', '23,24,35'),
(145, 68, '2025-06-30 10:29:36', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by null', 34, 'Pending', 'In Progress'),
(146, 68, '2025-06-30 10:29:36', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Medium', 'Updated by null', 34, 'Medium', 'Medium'),
(147, 85, '2025-06-30 14:29:00', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '24,23,35'),
(148, 85, '2025-06-30 14:29:00', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by null', 34, 'Pending', 'In Progress'),
(149, 85, '2025-06-30 14:29:00', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by null', 34, 'Medium', 'Low'),
(150, 68, '2025-06-30 14:30:36', 'SUPERVISOR_CHANGE', 'supervisor (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 35, '23,24,35', '35'),
(151, 68, '2025-06-30 14:30:36', 'STATUS_CHANGE', 'supervisor (Supervisor) Status changed from Pending to In Progress', 'Updated by null', 35, 'Pending', 'In Progress'),
(152, 68, '2025-06-30 14:30:36', 'PRIORITY_CHANGE', 'supervisor (Supervisor) Priority changed from Medium to Low', 'Updated by null', 35, 'Medium', 'Low'),
(153, 86, '2025-06-30 14:33:10', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 34, NULL, '35'),
(154, 86, '2025-06-30 14:33:10', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by null', 34, 'Pending', 'In Progress'),
(155, 86, '2025-06-30 14:33:10', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by null', 34, 'Medium', 'Low'),
(156, 86, '2025-06-30 14:44:43', 'STATUS_CHANGE', 'supervisor (Supervisor) Status changed from Pending to Open', 'Updated by supervisor', 35, 'Pending', 'Open'),
(157, 89, '2025-06-30 14:47:59', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to supervisor, supervisor two', 'Assigned by admin', 34, NULL, '35,38'),
(158, 89, '2025-06-30 14:47:59', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(159, 89, '2025-06-30 14:47:59', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(160, 90, '2025-06-30 14:56:45', 'TICKET_REJECTED', 'supervisor (Supervisor) Ticket rejected: Duplicate Ticket', 'Duplicate Ticket', 35, 'Pending', 'Rejected'),
(161, 88, '2025-06-30 14:59:01', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Anjali Wijesinghe	', 'Assigned by admin', 34, NULL, '146'),
(162, 88, '2025-06-30 14:59:01', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(163, 88, '2025-06-30 14:59:01', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(164, 87, '2025-06-30 15:01:36', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Sasindu Perera, supervisor', 'Assigned by admin', 34, NULL, '120,35'),
(165, 87, '2025-06-30 15:01:36', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by admin', 34, 'Pending', 'Open'),
(166, 87, '2025-06-30 15:01:36', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(167, 91, '2025-06-30 15:03:39', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Anjali Wijesinghe	, Sasindu Perera, supervisor', 'Assigned by admin', 34, NULL, '146,120,35'),
(168, 91, '2025-06-30 15:03:39', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(169, 91, '2025-06-30 15:03:39', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(170, 92, '2025-06-30 15:05:20', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Anjali Wijesinghe	, Sasindu Perera, supervisor', 'Assigned by admin', 34, NULL, '146,120,35'),
(171, 92, '2025-06-30 15:05:20', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by admin', 34, 'Pending', 'Open'),
(172, 72, '2025-06-30 15:11:04', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(173, 72, '2025-06-30 15:11:10', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-06-10', NULL, 34, NULL, '2025-06-10'),
(174, 87, '2025-06-30 15:11:44', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(175, 87, '2025-06-30 15:11:51', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-06-07', NULL, 34, NULL, '2025-06-07'),
(176, 93, '2025-06-30 15:13:24', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Kanchana, Anjali Wijesinghe	', 'Assigned by admin', 34, NULL, '24,146'),
(177, 93, '2025-06-30 15:13:24', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(178, 93, '2025-06-30 15:13:24', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(179, 93, '2025-06-30 15:14:28', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Open', 'Status updated by User ID: 34', 34, 'In Progress', 'Open'),
(180, 93, '2025-06-30 15:17:47', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(181, 80, '2025-06-30 16:06:34', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(182, 80, '2025-06-30 16:06:40', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-06-13', NULL, 34, NULL, '2025-06-13'),
(183, 93, '2025-06-30 16:07:38', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: supervisor', 'Supervisors removed via edit', NULL, '35', NULL),
(184, 93, '2025-06-30 16:09:14', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: supervisor', 'Supervisors added via edit', NULL, NULL, '35'),
(185, 93, '2025-06-30 16:10:30', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Tharupama', 'Supervisors added via edit', NULL, NULL, '23'),
(186, 92, '2025-06-30 16:11:09', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Tharupama, Kanchana', 'Supervisors added via edit', NULL, NULL, '23,24'),
(187, 92, '2025-06-30 16:11:09', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: Sasindu Perera', 'Supervisors removed via edit', NULL, '120', NULL),
(188, 94, '2025-06-30 16:13:36', 'TICKET_REJECTED', 'admin (Admin) Ticket rejected: Not a Bug', 'Not a Bug', 34, 'Pending', 'Rejected'),
(189, 77, '2025-06-30 16:14:31', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from Tharupama, Kanchana to Tharupama, Kanchana, Kusala', 'Assigned by admin', 34, '23,24', '23,24,26'),
(190, 77, '2025-06-30 16:14:31', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Resolved', 'Updated by admin', 34, 'Pending', 'Resolved'),
(191, 92, '2025-06-30 16:19:11', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(192, 86, '2025-07-01 06:39:05', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(193, 92, '2025-07-01 06:45:50', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Resolved', 'Status updated by User ID: 34', 34, 'In Progress', 'Resolved'),
(194, 77, '2025-07-01 06:47:42', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Suneth Upendra', 'Supervisors added via edit', NULL, NULL, '28'),
(195, 77, '2025-07-01 06:47:42', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: Kanchana', 'Supervisors removed via edit', NULL, '24', NULL),
(196, 89, '2025-07-01 06:50:46', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Kanchana, Tharupama', 'Supervisors added via edit', NULL, NULL, '24,23'),
(197, 95, '2025-07-01 06:52:07', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Kanchana, Kusala', 'Assigned by admin', 34, NULL, '24,26'),
(198, 95, '2025-07-01 06:52:07', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(199, 95, '2025-07-01 06:52:59', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Resolved', 'Status updated by User ID: 34', 34, 'In Progress', 'Resolved'),
(200, 93, '2025-07-01 06:53:22', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Kusala', 'Supervisors added via edit', NULL, NULL, '26'),
(201, 72, '2025-07-01 07:01:15', 'STATUS_CHANGE', 'supervisor (Supervisor) Status changed from In Progress to Resolved', 'Status updated by User ID: 35', 35, 'In Progress', 'Resolved'),
(202, 96, '2025-07-01 07:02:12', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Sasindu Perera, supervisor two, supervisor', 'Assigned by admin', 34, NULL, '120,38,35'),
(203, 96, '2025-07-01 07:02:12', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by admin', 34, 'Pending', 'Open'),
(204, 76, '2025-07-01 07:03:43', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(205, 96, '2025-07-01 07:05:47', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: supervisor two, supervisor', 'Supervisors removed via edit', NULL, '38,35', NULL),
(206, 85, '2025-07-01 07:06:47', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Open', 'Status updated by User ID: 34', 34, 'In Progress', 'Open'),
(207, 85, '2025-07-01 07:06:52', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-07-25', NULL, 34, NULL, '2025-07-25'),
(208, 85, '2025-07-01 07:08:46', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(209, 88, '2025-07-01 07:43:59', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Open', 'Status updated by User ID: 34', 34, 'In Progress', 'Open'),
(210, 88, '2025-07-01 07:44:02', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to Resolved', 'Status updated by User ID: 34', 34, 'Open', 'Resolved'),
(211, 88, '2025-07-01 07:44:04', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-08-02', NULL, 34, NULL, '2025-08-02'),
(212, 86, '2025-07-01 07:45:03', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Resolved', 'Status updated by User ID: 34', 34, 'In Progress', 'Resolved'),
(213, 97, '2025-07-01 07:47:00', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Kanchana, Sasindu Perera, supervisor two', 'Assigned by admin', 34, NULL, '24,120,38'),
(214, 97, '2025-07-01 07:47:00', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(215, 97, '2025-07-01 07:47:00', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(216, 97, '2025-07-01 07:48:28', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: supervisor two', 'Supervisors removed via edit', NULL, '38', NULL),
(217, 97, '2025-07-01 07:49:50', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Resolved', 'Status updated by User ID: 34', 34, 'In Progress', 'Resolved'),
(218, 97, '2025-07-01 07:49:54', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-07-25', NULL, 34, NULL, '2025-07-25'),
(219, 97, '2025-07-01 07:51:23', 'STATUS_CHANGE', 'admin (Admin) Status changed from Resolved to Open', 'Status updated by User ID: 34', 34, 'Resolved', 'Open'),
(220, 98, '2025-07-01 07:56:03', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Tharupama, supervisor two', 'Assigned by admin', 34, NULL, '23,38'),
(221, 98, '2025-07-01 07:56:03', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to Open', 'Updated by admin', 34, 'Pending', 'Open'),
(222, 98, '2025-07-01 07:56:14', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: Tharupama', 'Supervisors removed via edit', NULL, '23', NULL),
(223, 73, '2025-07-01 07:56:26', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(224, 98, '2025-07-02 08:48:50', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Tharupama, Kanchana', 'Supervisors added via edit', NULL, NULL, '23,24'),
(225, 99, '2025-07-02 08:50:44', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Sasindu Perera', 'Assigned by admin', 34, NULL, '120'),
(226, 99, '2025-07-02 08:50:44', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(227, 99, '2025-07-02 08:50:44', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(228, 99, '2025-07-02 08:55:19', 'STATUS_CHANGE', 'admin (Admin) Status changed from In Progress to Open', 'Status updated by User ID: 34', 34, 'In Progress', 'Open'),
(229, 99, '2025-07-02 08:55:21', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-07-11', NULL, 34, NULL, '2025-07-11'),
(230, 99, '2025-07-02 08:56:55', 'STATUS_CHANGE', 'admin (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 34', 34, 'Open', 'In Progress'),
(231, 99, '2025-07-02 08:57:24', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Tharupama', 'Supervisors added via edit', NULL, NULL, '23'),
(232, 99, '2025-07-02 08:57:24', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: Sasindu Perera', 'Supervisors removed via edit', NULL, '120', NULL),
(233, 99, '2025-07-02 10:57:20', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Kanchana, Sasindu Perera, supervisor two, supervisor', 'Supervisors added via edit', NULL, NULL, '24,120,38,35'),
(234, 99, '2025-07-02 10:57:20', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: Tharupama', 'Supervisors removed via edit', NULL, '23', NULL),
(235, 99, '2025-07-02 10:58:53', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Kusala', 'Supervisors added via edit', NULL, NULL, '26'),
(236, 100, '2025-07-02 11:00:05', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Anjali Wijesinghe	, Sasindu Perera', 'Assigned by admin', 34, NULL, '146,120'),
(237, 100, '2025-07-02 11:00:05', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(238, 100, '2025-07-02 11:00:05', 'PRIORITY_CHANGE', 'admin (Admin) Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(239, 100, '2025-07-02 11:00:54', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: supervisor', 'Supervisors added via edit', NULL, NULL, '35'),
(240, 101, '2025-07-02 11:13:49', 'SUPERVISOR_CHANGE', 'admin (Admin) Supervisor changed from unassigned to Anjali Wijesinghe	, supervisor two', 'Assigned by admin', 34, NULL, '146,38'),
(241, 101, '2025-07-02 11:13:49', 'STATUS_CHANGE', 'admin (Admin) Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(242, 101, '2025-07-02 11:14:03', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) Supervisors added: Sasindu Perera', 'Supervisors added via edit', NULL, NULL, '120'),
(243, 101, '2025-07-02 11:14:03', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) Supervisors removed: Anjali Wijesinghe	', 'Supervisors removed via edit', NULL, '146', NULL),
(244, 101, '2025-07-02 11:41:16', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) System (System) added supervisors: Tharupama', 'Added by System', NULL, '38,120', '23'),
(245, 101, '2025-07-02 11:42:33', 'SUPERVISOR_ADDED', 'Unknown User (Unknown Role) System (System) added supervisors: Anjali Wijesinghe	', 'Added by System', NULL, '38,120,23', '146'),
(246, 101, '2025-07-02 11:42:33', 'SUPERVISOR_REMOVED', 'Unknown User (Unknown Role) System (System) removed supervisors: Tharupama', 'Removed by System', NULL, '23', '38,120,146'),
(247, 101, '2025-07-02 11:53:57', 'SUPERVISOR_ADDED', 'System (System) added supervisors: supervisor', 'Added by System', NULL, NULL, NULL),
(248, 101, '2025-07-02 11:53:57', 'SUPERVISOR_REMOVED', 'System (System) removed supervisors: supervisor two', 'Removed by System', NULL, NULL, NULL),
(249, 101, '2025-07-02 11:57:30', 'SUPERVISOR_ADDED', 'admin (Admin) added supervisors: Kariyawasam', 'Added by admin', 34, NULL, NULL),
(250, 101, '2025-07-02 11:57:30', 'SUPERVISOR_REMOVED', 'admin (Admin) removed supervisors: supervisor', 'Removed by admin', 34, NULL, NULL),
(251, 102, '2025-07-02 11:58:01', 'SUPERVISOR_CHANGE', 'Supervisors assigned: Sasindu Perera, Anjali Wijesinghe	 (Previously: No supervisors)', 'Assigned by admin', 34, NULL, '120,146'),
(252, 102, '2025-07-02 11:58:01', 'STATUS_CHANGE', 'Status changed from Pending to In Progress', 'Updated by admin', 34, 'Pending', 'In Progress'),
(253, 102, '2025-07-02 11:58:01', 'PRIORITY_CHANGE', 'Priority changed from Medium to Low', 'Updated by admin', 34, 'Medium', 'Low'),
(254, 102, '2025-07-02 11:58:39', 'SUPERVISOR_ADDED', 'admin (Admin) added supervisors: supervisor', 'Added by admin', 34, NULL, NULL),
(255, 102, '2025-07-02 11:58:39', 'SUPERVISOR_REMOVED', 'admin (Admin) removed supervisors: Sasindu Perera', 'Removed by admin', 34, NULL, NULL),
(256, 73, '2025-07-02 12:06:44', 'STATUS_CHANGE', 'Status changed from In Progress to Open', 'Status updated by User ID: 35', 35, 'In Progress', 'Open'),
(257, 73, '2025-07-02 12:06:51', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-07-17', NULL, 35, NULL, '2025-07-17'),
(258, 68, '2025-07-02 12:14:37', 'STATUS_CHANGE', 'Status changed from In Progress to Open', 'Status updated by User ID: 35', 35, 'In Progress', 'Open'),
(259, 73, '2025-07-02 12:18:47', 'STATUS_CHANGE', 'supervisor changed status from Open to In Progress', 'Updated by supervisor', 35, 'Open', 'In Progress'),
(260, 73, '2025-07-02 12:18:57', 'DUE_DATE_CHANGE', 'supervisor changed due date from Thu Jul 17 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-07-11', 'Updated by supervisor', 35, '2025-07-17 00:00:00.000', '2025-07-11'),
(261, 73, '2025-07-02 12:19:51', 'COMMENT', 'supervisor added a comment: \"@admin lcdkd    @Dilshan Fernando...\"', 'Updated by supervisor', 35, NULL, NULL),
(262, 73, '2025-07-02 12:20:30', 'COMMENT', 'supervisor added a comment: \"hi @Dilshan Fernando	 hii@supervisor hello...\"', 'Updated by supervisor', 35, NULL, NULL),
(263, 73, '2025-07-02 12:20:44', 'COMMENT', 'supervisor added a comment: \"@admin   hii   @admin...\"', 'Updated by supervisor', 35, NULL, NULL),
(264, 101, '2025-07-02 12:21:47', 'DUE_DATE_CHANGE', 'admin changed due date from null to 2025-07-26', 'Updated by admin', 34, NULL, '2025-07-26'),
(265, 101, '2025-07-02 12:22:19', 'STATUS_CHANGE', 'admin changed status from In Progress to Open', 'Updated by admin', 34, 'In Progress', 'Open'),
(266, 76, '2025-07-02 12:25:44', 'DUE_DATE_CHANGE', 'admin changed due date to 2025-07-11', 'Updated by admin', 34, NULL, '2025-07-11'),
(267, 76, '2025-07-02 12:25:53', 'DUE_DATE_CHANGE', 'admin changed due date from Fri Jul 11 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-07-25', 'Updated by admin', 34, '2025-07-11 00:00:00.000', '2025-07-25'),
(268, 101, '2025-07-02 12:31:16', 'STATUS_CHANGE', 'admin changed status from Open to In Progress', 'Updated by admin', 34, 'Open', 'In Progress'),
(269, 101, '2025-07-02 12:31:18', 'DUE_DATE_CHANGE', 'admin changed due date from Sat Jul 26 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-07-19', 'Updated by admin', 34, '2025-07-26 00:00:00.000', '2025-07-19'),
(270, 102, '2025-07-02 12:35:25', 'SUPERVISOR_ADDED', 'admin added supervisors: supervisor two', 'Updated by admin', 34, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `userid`
--

DROP TABLE IF EXISTS `userid`;
CREATE TABLE IF NOT EXISTS `userid` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `UserName` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContactNo` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Branch` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`UserId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comment_reply` FOREIGN KEY (`ReplyToCommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE;

--
-- Constraints for table `comment_attachments`
--
ALTER TABLE `comment_attachments`
  ADD CONSTRAINT `fk_comment_attachments_comment` FOREIGN KEY (`CommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE;

--
-- Constraints for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`CommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `appuser` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `appuser` (`UserID`) ON DELETE CASCADE;
--
-- Database: `tickett`
--
CREATE DATABASE IF NOT EXISTS `tickett` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `tickett`;

-- --------------------------------------------------------

--
-- Table structure for table `appuser`
--

DROP TABLE IF EXISTS `appuser`;
CREATE TABLE IF NOT EXISTS `appuser` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `FullName` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Email` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Role` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Phone` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ProfileImagePath` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appuser`
--

INSERT INTO `appuser` (`UserId`, `FullName`, `Email`, `password`, `Role`, `Phone`, `ProfileImagePath`) VALUES
(26, 'Gunathilaka', 'gunathilaka@gmail.com', '$2b$10$UA/k02LBELO47/r3igJB4uLJeubKkdDgkPT1mw8inrdGyni23yTi2', 'User', '0785432123', NULL),
(27, 'Kamal', 'kamal@gmail.com', '$2b$10$wW5UqcPMt5ZDEpPOFqYN5eEzuGj6LzKoSKHjVMNuKR.YVh3f2AUVK', 'User', '0760543267', NULL),
(28, 'Sunil', 'sunil@gmail.com', '$2b$10$EloQPSrQz69dm8GPTOKWruvxnjJ7hq9uOQA5oF0EDjYarmJeyrBIm', 'User', '0765234325', NULL),
(29, 'Ravindu SK', 'ravindu@gmail.com', '$2b$10$12sHAPpoZmPuuWctlnIQHu2xq.68qNK7EoajeKqcU2EOCrNEF83N.', 'Admin', '0785437654', NULL),
(30, 'Saman Edirimuni', 'samanedirimuni@gmai.com', '$2b$10$gjsHTd9N5VPM7RCMQW8N4ui4fZjGobJUfXBkoYbFgM1unFbtBat.u', 'Supervisor', '0769543565', NULL),
(31, 'Anuhas', 'anuhas@gmail.com', '$2b$10$otgl/RGQlLcsg.WZofD3M.kfbWtKmdy0wIsntIKuir9/NG1i0G/ru', 'Supervisor', '0770945367', NULL),
(32, 'new ', 'new@greenwave.com', '$2b$10$Zj2nHVDF5.26gwB.mKn/wu.3H.Hb5GZndlOAbekdjiyszKyPO92e6', 'User', '0774665075', NULL),
(119, 'Nethmi Tharuka', 'nethmi@technova.com', '$2b$10$2H8ZEmVuftCF6PdgRx/9Ee8OYA684rU5dRo2E/7Rkb/6DjLVmxnyG', 'User', '0774665076', NULL),
(120, 'Sasindu Perera', 'sasindu@bluesky.com', '$2b$10$ODt5oD1pNV5Ypoe2VMzDyeQsd9oSwtQ3slrxlAzrkqL.YujnrNC8W', 'Supervisor', '0774665076', NULL),
(121, 'Ishara Jayasooriya', 'ishara@greenwave.com', '$2b$10$hXdhIBaZCmaQ/NWfPk.GYOdeVEnjjc0c/cjuNiw6iMpxjoefvIH3y', 'Admin', '0774665076', NULL),
(145, 'Dilshan Fernando	', 'dilshan.fernando@technova.com', '$2b$10$evb8KUOyqf/WfvS1MxnlZuZVN5T2bJ87rxY1eVXxfdMMy9IbQNZGa', 'Admin', '0774665076', NULL),
(146, 'Anjali Wijesinghe	', 'anjali.wijesinghe@bluesky.com', '$2b$10$Z7VexXg5Ry7ZtVJIm5lMDOGEibm3Dya19m8Qhu.GQNvYc0TLnnOH2', 'Supervisor', '0774665075', NULL),
(147, 'Ishani Perera	', 'ishani.perera@bluesky.com', '$2b$10$3wvrTU1R/JC5WXRUTisLB.T4iz3SrtPdgJtE78nvVifYd3Ga91G12', 'User', '0774665078', NULL),
(148, 'Pradeep Jayasinghe	', 'pradeep.jayasinghe@bluesky.com', '$2b$10$F1psY0BBnw9H8nFeK7YH/.ZjwlL1t6AVY4SS9YXdHNRtZ2BjuF01G', 'User', '0777858521', NULL),
(149, ' Thilina Rathnayake	', 'thilina.rathnayake@technova.com', '$2b$10$1DdTSW0sWBdape0p8CZUMOgII4qgW4WbegJ0aU4VMiQ0y8AgJCtqy', 'User', '0777858521', NULL),
(150, 'Dilani Kumari	', 'k9Ddilani.kumari@bluesky.com', '$2b$10$rZaXwI.6OUYsepCDz6i9GectDSiGcTIirxGBPIIGvEmyDB54KX5UW', 'User', '0774665076', NULL),
(151, 'sanduni fernando ', 'sanduni.fernando@bluesky.com', '$2b$10$jKzeDpjcY2c3VU82KJOg8uGbTTUefYYlQjAHUzH9eU1VaTbB6o93u', 'User', '0777858521', NULL),
(152, 'Dilani Kumari	', 'dilani@greenwave.com', '$2b$10$w5QS0MvtzTXRCLahZnZcWutsRxqaRe216zicHLeTGm1BL/WXKmTBG', 'User', '0778569203', NULL),
(153, 'nethmi thalokoralage', 'nethmi@greenwave.com', '$2b$10$8djkFETVvbMGOvdHMJXhs.gJv7oT.jvaRxVOMxdCPW9xnzUBBqFF2', 'User', '0761211070', NULL),
(154, 'ruwani', 'ruwani@greenwave.com', '$2b$10$DnFkKjpUYpC2OUooJdxFe.JlIpuAEU7jlg9vBkh1j7TeWD05WkeWG', 'User', '0774665075', NULL),
(155, 'neha kakar', 'nethmitk22@gmail.com', '$2b$10$2nEpnHEwzRfN1LKY/A/F7eFMkrfXDqT7bj.nJfuQR24SJdxHoMrbm', 'User', '0777858521', NULL),
(156, 'kaweesha gangani', 'kawee@technova.com', '$2b$10$SFYjpZ.Fl/hStb1AgsLHr.WsJnbzPCdI9XbYr41orkZcnE3qZT9fS', 'User', '0777858521', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asipiyasystem`
--

DROP TABLE IF EXISTS `asipiyasystem`;
CREATE TABLE IF NOT EXISTS `asipiyasystem` (
  `AsipiyaSystemID` int NOT NULL AUTO_INCREMENT,
  `SystemName` varchar(255) NOT NULL,
  `Description` varchar(45) DEFAULT NULL,
  `Status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`AsipiyaSystemID`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `asipiyasystem`
--

INSERT INTO `asipiyasystem` (`AsipiyaSystemID`, `SystemName`, `Description`, `Status`) VALUES
(4, 'Help Desk Portal', 'A web-based platform to manage IT support tic', 1),
(5, 'Inventory Management System', 'Tracks and manages product stock levels, orde', 1),
(6, 'CRM Platform', 'Helps manage customer relationships, sales, a', 1),
(7, 'Employee Management System', 'Used to manage employee records, attendance, ', 1),
(8, 'Project Tracking System', 'Helps teams track project timelines, delivera', 1),
(9, 'E-Commerce Platform', 'Manages online store operations including pro', 1),
(10, 'Learning Management System', 'Supports online course delivery, student trac', 1),
(11, 'Hospital Management System', 'Handles patient records, appointments, and me', 1),
(12, 'Finatiol management system', 'finatioal steps updated', 1);

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `ClientID` int NOT NULL AUTO_INCREMENT,
  `CompanyName` varchar(45) DEFAULT NULL,
  `ContactNo` varchar(45) DEFAULT NULL,
  `ContactPersonEmail` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `MobileNo` varchar(45) DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  PRIMARY KEY (`ClientID`),
  KEY `fk_user` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`ClientID`, `CompanyName`, `ContactNo`, `ContactPersonEmail`, `MobileNo`, `UserID`) VALUES
(3, 'TechNova Pvt Ltd', '0112233445', 'ishara@greenwave.com', '0771234567', 1),
(4, 'BlueSky Solutions', '0115566778', 'dilani@greenwave.com', '0779876543', 2),
(5, 'GreenWave Enterprises', '0116677889', 'nethmi@technova.com', '0763456789', 153),
(6, 'TechNova Pvt Ltd', '0112233445', 'thilina.rathnayake@technova.com', '0771234567', 119),
(7, 'BlueSky Solutions', '0115566778', 'k9Ddilani.kumari@bluesky.com', '0779876543', 153),
(8, 'GreenWave Enterprises', '0116677889', 'sanduni.fernando@bluesky.com', '0763456789', 121),
(9, 'asipiya priting company', '0778569865', 'nethmitk22@gmail.com', '0774665078', 155);

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `CommentID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int NOT NULL,
  `UserID` int NOT NULL,
  `CommentText` text NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Mentions` text,
  `ReplyToCommentID` int DEFAULT NULL,
  `AttachmentFilePath` varchar(255) DEFAULT NULL,
  `AttachmentFileName` varchar(255) DEFAULT NULL,
  `AttachmentFileType` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`CommentID`),
  KEY `fk_comment_ticket` (`TicketID`),
  KEY `fk_comment_user` (`UserID`),
  KEY `fk_comment_reply` (`ReplyToCommentID`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
CREATE TABLE IF NOT EXISTS `evidence` (
  `EvidenceID` int NOT NULL AUTO_INCREMENT,
  `Description` text,
  `FilePath` varchar(255) DEFAULT NULL,
  `ComplaintID` int DEFAULT NULL,
  PRIMARY KEY (`EvidenceID`),
  KEY `fk_evidence_ticket` (`ComplaintID`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `evidence`
--

INSERT INTO `evidence` (`EvidenceID`, `Description`, `FilePath`, `ComplaintID`) VALUES
(10, 'System crash when clicking submit button.', 'uploads/evidenceFiles-1750328703021-356389906.jpeg', 55),
(11, 'System crash when clicking submit button.', 'uploads/evidenceFiles-1750328703023-335049320.png', 55),
(12, 'User unable to login due to password error.', 'uploads/evidenceFiles-1750329542402-20868426.png', 56),
(13, 'Unable to generate monthly sales report.\r\n\r\n', 'uploads/evidenceFiles-1750329563216-197874949.jpeg', 57),
(14, 'Email notifications not being sent.\r\n\r\n', 'uploads/evidenceFiles-1750329592472-482436931.jpeg', 58),
(15, 'Search function returns incorrect results.\r\n\r\n', 'uploads/evidenceFiles-1750329630963-175057936.jpeg', 60),
(16, 'System is slow during peak hours.\r\n\r\n', 'uploads/evidenceFiles-1750329654500-949217158.png', 61),
(17, 'Account locked after multiple failed login attempts.\r\n\r\n', 'uploads/evidenceFiles-1750329681397-996631638.png', 62),
(18, 'Need access to admin panel for reports.\r\n\r\n', 'uploads/evidenceFiles-1750329703572-840416295.jpeg', 63),
(19, 'Missing data in user activity logs.\r\n\r\n', 'uploads/evidenceFiles-1750329734988-971804001.png', 64),
(20, 'Missing data in user activity logs.\r\n\r\n', 'uploads/evidenceFiles-1750329734988-52766220.jpeg', 64),
(21, 'Missing data in user activity logs.\r\n\r\n', 'uploads/evidenceFiles-1750329734988-672161978.jpeg', 64),
(22, 'Missing data in user activity logs.\r\n\r\n', 'uploads/evidenceFiles-1750329734989-816485577.jpeg', 64),
(23, 'Cannot export data to CSV format.\r\n\r\n', 'uploads/evidenceFiles-1750329771068-127096339.png', 65),
(24, 'User unable to update contact information.\r\n\r\n', 'uploads/evidenceFiles-1750329892267-272132600.jpeg', 66),
(25, 'its tracking root eroor', 'uploads/evidenceFiles-1750661517164-953319514.png', 69),
(26, 'this color is white theme..plz its convert dark mode', 'uploads/evidenceFiles-1750680599636-311533734.jpeg', 74),
(27, 'this color is white theme..plz its convert dark mode', 'uploads/evidenceFiles-1750680599636-977668815.png', 74),
(28, 'plz check that ', 'uploads/evidenceFiles-1750680972729-768896482.jpeg', 75),
(29, 'improved the inventory ui black mode not working..', 'uploads/evidenceFiles-1750685476232-638654196.jpeg', 76),
(30, 'improved the inventory ui black mode not working..', 'uploads/evidenceFiles-1750685476233-545976013.png', 76),
(31, 'employess count issue..', 'uploads/evidenceFiles-1750735619953-261121077.png', 77);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `NotificationID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Message` text NOT NULL,
  `Type` varchar(50) NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketLogID` int DEFAULT NULL,
  PRIMARY KEY (`NotificationID`),
  KEY `UserID` (`UserID`),
  KEY `TicketLogID` (`TicketLogID`)
) ENGINE=MyISAM AUTO_INCREMENT=437 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`NotificationID`, `UserID`, `Message`, `Type`, `IsRead`, `CreatedAt`, `TicketLogID`) VALUES
(390, 120, 'Ticket #57 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 12:17:53', 105),
(389, 151, 'Your ticket #57 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 12:17:53', 105),
(388, 120, 'You have been assigned to ticket #75. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 12:16:47', NULL),
(387, 120, 'Ticket #75 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-23 12:16:47', 104),
(386, 155, 'Your ticket #75 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-23 12:16:47', 104),
(385, 120, 'Ticket #75 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-23 12:16:47', 103),
(384, 155, 'Your ticket #75 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-23 12:16:47', 103),
(383, 155, 'The supervisor for your ticket #75 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 12:16:47', 102),
(382, 145, 'New ticket created by User #155: plz check that ...', 'NEW_TICKET', 1, '2025-06-23 12:16:12', NULL),
(381, 121, 'New ticket created by User #155: plz check that ...', 'NEW_TICKET', 1, '2025-06-23 12:16:12', NULL),
(380, 146, 'You have been assigned to ticket #74. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 12:10:22', NULL),
(379, 146, 'Ticket #74 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-23 12:10:22', 101),
(378, 155, 'Your ticket #74 priority has been changed from Medium to Low.', 'PRIORITY_UPDATE', 0, '2025-06-23 12:10:22', 101),
(377, 146, 'Ticket #74 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-23 12:10:22', 100),
(376, 155, 'Your ticket #74 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-23 12:10:22', 100),
(375, 155, 'The supervisor for your ticket #74 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 12:10:22', 99),
(374, 145, 'New ticket created by User #155: this color is white theme..plz its convert dark mo...', 'NEW_TICKET', 1, '2025-06-23 12:09:59', NULL),
(373, 121, 'New ticket created by User #155: this color is white theme..plz its convert dark mo...', 'NEW_TICKET', 1, '2025-06-23 12:09:59', NULL),
(372, 120, 'You have been assigned to ticket #73. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 12:00:36', NULL),
(371, 120, 'Ticket #73 status has been changed from Resolved to Open by Unknown User.', 'STATUS_UPDATE', 0, '2025-06-23 12:00:36', 98),
(370, 155, 'Your ticket #73 status has been changed from Resolved to Open by Unknown User.', 'STATUS_UPDATE', 0, '2025-06-23 12:00:36', 98),
(369, 146, 'You have been assigned to ticket #69. Status: Open, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 11:56:30', NULL),
(368, 146, 'Ticket #69 priority has been changed from Medium to Low by Unknown User.', 'PRIORITY_UPDATE', 0, '2025-06-23 11:56:30', 97),
(367, 153, 'Your ticket #69 priority has been changed from Medium to Low by Unknown User.', 'PRIORITY_UPDATE', 0, '2025-06-23 11:56:30', 97),
(366, 146, 'Ticket #69 status has been changed from Pending to Open by Unknown User.', 'STATUS_UPDATE', 0, '2025-06-23 11:56:30', 96),
(365, 153, 'Your ticket #69 status has been changed from Pending to Open by Unknown User.', 'STATUS_UPDATE', 0, '2025-06-23 11:56:30', 96),
(364, 120, 'You have been unassigned from ticket #69 by Unknown User.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-23 11:56:30', 95),
(363, 153, 'The supervisor for your ticket #69 has changed from unassigned to Unknown Supervisor by Unknown User.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 11:56:30', 95),
(362, 120, 'You have been assigned to ticket #73. Status: Resolved, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 11:54:01', NULL),
(361, 120, 'Ticket #73 priority has been changed from Low to Medium by Unknown User.', 'PRIORITY_UPDATE', 0, '2025-06-23 11:54:01', 94),
(360, 155, 'Your ticket #73 priority has been changed from Low to Medium by Unknown User.', 'PRIORITY_UPDATE', 0, '2025-06-23 11:54:01', 94),
(359, 120, 'Ticket #73 status has been changed from In Progress to Resolved by Unknown User.', 'STATUS_UPDATE', 0, '2025-06-23 11:54:01', 93),
(358, 155, 'Your ticket #73 status has been changed from In Progress to Resolved by Unknown User.', 'STATUS_UPDATE', 0, '2025-06-23 11:54:01', 93),
(357, 120, 'You have been assigned to ticket #73. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 11:43:13', NULL),
(356, 145, 'New ticket created by User #155: not availble system count...', 'NEW_TICKET', 1, '2025-06-23 10:10:48', NULL),
(355, 121, 'New ticket created by User #155: not availble system count...', 'NEW_TICKET', 1, '2025-06-23 10:10:48', NULL),
(354, 145, 'New User registered: neha kakar (nethmitk22@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 10:10:26', NULL),
(353, 121, 'New User registered: neha kakar (nethmitk22@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 10:10:26', NULL),
(352, 146, 'You have been assigned to ticket #72. Status: In Progress, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 09:53:33', NULL),
(351, 120, 'You were mentioned in a comment on ticket #57', 'MENTION', 0, '2025-06-23 09:16:46', NULL),
(350, 145, 'New ticket created by User #153: check...', 'NEW_TICKET', 1, '2025-06-23 08:03:42', NULL),
(349, 121, 'New ticket created by User #153: check...', 'NEW_TICKET', 1, '2025-06-23 08:03:42', NULL),
(348, 120, 'You have been assigned to ticket #71. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 07:41:07', NULL),
(347, 145, 'New ticket created by User #154: hello...', 'NEW_TICKET', 1, '2025-06-23 07:40:41', NULL),
(346, 121, 'New ticket created by User #154: hello...', 'NEW_TICKET', 1, '2025-06-23 07:40:41', NULL),
(345, 145, 'New User registered: ruwani (ruwani@greenwave.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 07:40:28', NULL),
(344, 121, 'New User registered: ruwani (ruwani@greenwave.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 07:40:28', NULL),
(343, 120, 'You have been assigned to ticket #70. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 07:03:18', NULL),
(341, 121, 'New ticket created by User #153: mko...', 'NEW_TICKET', 1, '2025-06-23 06:59:16', NULL),
(342, 145, 'New ticket created by User #153: mko...', 'NEW_TICKET', 1, '2025-06-23 06:59:16', NULL),
(340, 120, 'You have been assigned to ticket #69. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:52:12', NULL),
(339, 145, 'New ticket created by User #153: its tracking root eroor...', 'NEW_TICKET', 1, '2025-06-23 06:51:57', NULL),
(338, 121, 'New ticket created by User #153: its tracking root eroor...', 'NEW_TICKET', 1, '2025-06-23 06:51:57', NULL),
(337, 145, 'New User registered: nethmi thalokoralage (nethmi@greenwave.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 06:47:50', NULL),
(336, 121, 'New User registered: nethmi thalokoralage (nethmi@greenwave.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 06:47:50', NULL),
(335, 120, 'You have been assigned to ticket #68. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:38:08', NULL),
(334, 120, 'You have been assigned to ticket #68. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:36:13', NULL),
(333, 120, 'You have been assigned to ticket #68. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:36:06', NULL),
(332, 145, 'New ticket created by User #152: hii...', 'NEW_TICKET', 1, '2025-06-23 06:35:51', NULL),
(331, 121, 'New ticket created by User #152: hii...', 'NEW_TICKET', 1, '2025-06-23 06:35:51', NULL),
(330, 120, 'You have been assigned to ticket #67. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:26:19', NULL),
(328, 121, 'New ticket created by User #152: ji...', 'NEW_TICKET', 1, '2025-06-23 06:26:07', NULL),
(329, 145, 'New ticket created by User #152: ji...', 'NEW_TICKET', 1, '2025-06-23 06:26:07', NULL),
(327, 120, 'You have been assigned to ticket #58. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:12:55', NULL),
(326, 120, 'You have been assigned to ticket #59. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:08:12', NULL),
(325, 120, 'You have been assigned to ticket #57. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 06:05:19', NULL),
(324, 120, 'You have been assigned to ticket #66. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 03:01:45', NULL),
(323, 120, 'You were mentioned in a comment on ticket #55', 'MENTION', 0, '2025-06-23 02:56:21', NULL),
(322, 121, 'You were mentioned in a comment on ticket #60', 'MENTION', 1, '2025-06-21 15:42:15', NULL),
(321, 120, 'You have been assigned to ticket #60. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 15:28:47', NULL),
(320, 120, 'You have been assigned to ticket #66. Status: In Progress, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:46:12', NULL),
(319, 120, 'You have been assigned to ticket #66. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:45:33', NULL),
(318, 120, 'You have been assigned to ticket #55. Status: In Progress, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:39:27', NULL),
(317, 120, 'You have been assigned to ticket #61. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:23:36', NULL),
(316, 120, 'You have been assigned to ticket #64. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:22:41', NULL),
(315, 120, 'You have been assigned to ticket #64. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:21:23', NULL),
(314, 120, 'You have been assigned to ticket #64. Status: In Progress, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:20:45', NULL),
(313, 146, 'You have been assigned to ticket #66. Status: In Progress, Priority: Low.', 'SUPERVISOR_ASSIGNED', 1, '2025-06-21 14:13:24', NULL),
(312, 120, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:10:49', NULL),
(311, 120, 'You have been assigned to ticket #59. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:05:59', NULL),
(310, 146, 'You have been assigned to ticket #60. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 14:04:38', NULL),
(309, 120, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:54:40', NULL),
(308, 120, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:51:15', NULL),
(307, 146, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:47:05', NULL),
(306, 120, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:46:02', NULL),
(305, 146, 'You have been assigned to ticket #61. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:45:11', NULL),
(304, 146, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 1, '2025-06-21 13:44:51', NULL),
(303, 146, 'You have been assigned to ticket #57. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:42:18', NULL),
(302, 120, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:41:39', NULL),
(301, 120, 'You have been assigned to ticket #66. Status: Open, Priority: High.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:37:05', NULL),
(300, 120, 'You have been assigned to ticket #66. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:34:50', NULL),
(299, 120, 'You have been assigned to ticket #66. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:33:31', NULL),
(298, 120, 'You have been assigned to ticket #66. Status: Resolved, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-21 13:33:11', NULL),
(297, 146, 'New ticket category added: new ticket test', 'NEW_CATEGORY_ADDED', 0, '2025-06-20 08:38:38', NULL),
(296, 145, 'New ticket category added: new ticket test', 'NEW_CATEGORY_ADDED', 1, '2025-06-20 08:38:38', NULL),
(295, 121, 'New ticket category added: new ticket test', 'NEW_CATEGORY_ADDED', 1, '2025-06-20 08:38:38', NULL),
(294, 120, 'New ticket category added: new ticket test', 'NEW_CATEGORY_ADDED', 0, '2025-06-20 08:38:38', NULL),
(293, 145, 'New ticket created by User #152: User unable to update contact information.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:44:52', NULL),
(292, 121, 'New ticket created by User #152: User unable to update contact information.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:44:52', NULL),
(291, 145, 'New User registered: Dilani Kumari	 (dilani@greenwave.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:44:27', NULL),
(290, 121, 'New User registered: Dilani Kumari	 (dilani@greenwave.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:44:27', NULL),
(289, 145, 'New ticket created by User #119: Cannot export data to CSV format.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:42:51', NULL),
(288, 121, 'New ticket created by User #119: Cannot export data to CSV format.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:42:51', NULL),
(287, 145, 'New ticket created by User #149: Missing data in user activity logs.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:42:14', NULL),
(286, 121, 'New ticket created by User #149: Missing data in user activity logs.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:42:14', NULL),
(285, 145, 'New ticket created by User #149: Need access to admin panel for reports.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:41:43', NULL),
(284, 121, 'New ticket created by User #149: Need access to admin panel for reports.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:41:43', NULL),
(283, 145, 'New ticket created by User #149: Account locked after multiple failed login attempt...', 'NEW_TICKET', 1, '2025-06-19 10:41:21', NULL),
(282, 121, 'New ticket created by User #149: Account locked after multiple failed login attempt...', 'NEW_TICKET', 1, '2025-06-19 10:41:21', NULL),
(281, 145, 'New ticket created by User #150: System is slow during peak hours.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:40:54', NULL),
(280, 121, 'New ticket created by User #150: System is slow during peak hours.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:40:54', NULL),
(279, 145, 'New ticket created by User #150: Search function returns incorrect results.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:40:30', NULL),
(278, 121, 'New ticket created by User #150: Search function returns incorrect results.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:40:30', NULL),
(277, 145, 'New ticket created by User #150: Unable to upload profile picture.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:40:12', NULL),
(276, 121, 'New ticket created by User #150: Unable to upload profile picture.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:40:12', NULL),
(275, 145, 'New ticket created by User #150: Email notifications not being sent.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:39:52', NULL),
(274, 121, 'New ticket created by User #150: Email notifications not being sent.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:39:52', NULL),
(273, 145, 'New ticket created by User #151: Unable to generate monthly sales report.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:39:23', NULL),
(272, 121, 'New ticket created by User #151: Unable to generate monthly sales report.\n\n...', 'NEW_TICKET', 1, '2025-06-19 10:39:23', NULL),
(271, 145, 'New ticket created by User #151: User unable to login due to password error....', 'NEW_TICKET', 1, '2025-06-19 10:39:02', NULL),
(270, 121, 'New ticket created by User #151: User unable to login due to password error....', 'NEW_TICKET', 1, '2025-06-19 10:39:02', NULL),
(269, 121, 'New User registered: sanduni fernando  (sanduni.fernando@bluesky.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:37:40', NULL),
(268, 121, 'New User registered: Dilani Kumari	 (k9Ddilani.kumari@bluesky.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:36:46', NULL),
(267, 121, 'New User registered:  Thilina Rathnayake	 (thilina.rathnayake@technova.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:36:13', NULL),
(266, 121, 'New User registered: Pradeep Jayasinghe	 (pradeep.jayasinghe@bluesky.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:35:30', NULL),
(265, 121, 'New User registered: Ishani Perera	 (ishani.perera@bluesky.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:35:06', NULL),
(264, 121, 'New User registered: Anjali Wijesinghe	 (anjali.wijesinghe@bluesky.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:34:37', NULL),
(263, 121, 'New User registered: Dilshan Fernando	 (dilshan.fernando@technova.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-19 10:34:12', NULL),
(262, 121, 'New ticket created by User #119: System crash when clicking submit button....', 'NEW_TICKET', 1, '2025-06-19 10:25:02', NULL),
(261, 121, 'New system added: Hospital Management System', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:15:54', NULL),
(260, 120, 'New system added: Hospital Management System', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:15:54', NULL),
(259, 121, 'New system added: Learning Management System', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:15:23', NULL),
(258, 120, 'New system added: Learning Management System', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:15:23', NULL),
(257, 121, 'New system added: E-Commerce Platform', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:14:53', NULL),
(256, 120, 'New system added: E-Commerce Platform', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:14:53', NULL),
(255, 121, 'New system added: Project Tracking System', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:14:24', NULL),
(254, 120, 'New system added: Project Tracking System', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:14:24', NULL),
(253, 121, 'New system added: Employee Management System', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:13:56', NULL),
(252, 120, 'New system added: Employee Management System', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:13:56', NULL),
(251, 121, 'New system added: CRM Platform', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:13:18', NULL),
(250, 120, 'New system added: CRM Platform', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:13:18', NULL),
(249, 121, 'New system added: Inventory Management System', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:12:50', NULL),
(248, 120, 'New system added: Inventory Management System', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:12:50', NULL),
(247, 121, 'New system added: Help Desk Portal', 'NEW_SYSTEM_ADDED', 1, '2025-06-19 10:12:19', NULL),
(246, 120, 'New system added: Help Desk Portal', 'NEW_SYSTEM_ADDED', 0, '2025-06-19 10:12:19', NULL),
(391, 155, 'Your ticket #75 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-06-23 12:18:31', 106),
(392, 120, 'Ticket #75 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-06-23 12:18:31', 106),
(393, 120, 'You have been assigned to ticket #75. Status: Open, Priority: Low.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 12:22:53', NULL),
(394, 150, 'Your ticket #58 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 12:40:27', 107),
(395, 120, 'Ticket #58 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 12:40:27', 107),
(396, 150, 'Your ticket #58 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-06-23 12:42:51', 110),
(397, 120, 'Ticket #58 status has been changed from In Progress to Open', 'STATUS_UPDATE', 0, '2025-06-23 12:42:51', 110),
(398, 120, 'You were mentioned in a comment on ticket #58', 'MENTION', 0, '2025-06-23 12:43:23', NULL),
(399, 120, 'You were mentioned in a comment on ticket #58', 'MENTION', 0, '2025-06-23 12:59:44', NULL),
(400, 121, 'New User registered: kaweesha gangani (kawee@technova.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 13:30:35', NULL),
(401, 145, 'New User registered: kaweesha gangani (kawee@technova.com)', 'NEW_USER_REGISTRATION', 0, '2025-06-23 13:30:35', NULL),
(402, 121, 'New ticket created by User #156: improved the inventory ui black mode not working.....', 'NEW_TICKET', 1, '2025-06-23 13:31:16', NULL),
(403, 145, 'New ticket created by User #156: improved the inventory ui black mode not working.....', 'NEW_TICKET', 0, '2025-06-23 13:31:16', NULL),
(404, 156, 'The supervisor for your ticket #76 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 13:31:57', 114),
(405, 156, 'Your ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 13:31:57', 115),
(406, 120, 'Ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 13:31:57', 115),
(407, 120, 'You have been assigned to ticket #76. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 13:31:57', NULL),
(408, 156, 'The supervisor for your ticket #76 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 13:33:59', 116),
(409, 120, 'You have been unassigned from ticket #76.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-23 13:33:59', 116),
(410, 156, 'Your ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 13:33:59', 117),
(411, 146, 'Ticket #76 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-23 13:33:59', 117),
(412, 146, 'You have been assigned to ticket #76. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 13:33:59', NULL),
(413, 156, 'The supervisor for your ticket #76 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-23 13:35:12', 118),
(414, 146, 'You have been unassigned from ticket #76.', 'SUPERVISOR_UNASSIGNED', 0, '2025-06-23 13:35:12', 118),
(415, 120, 'You have been assigned to ticket #76. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 13:35:12', NULL),
(416, 156, 'Your ticket #76 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 13:37:35', 119),
(417, 120, 'Ticket #76 status has been changed from Open to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 13:37:35', 119),
(418, 156, 'Your ticket #76 status has been changed from In Progress to Open.', 'STATUS_UPDATE', 0, '2025-06-23 13:38:03', 120),
(419, 120, 'Ticket #76 status has been changed from In Progress to Open.', 'STATUS_UPDATE', 0, '2025-06-23 13:38:03', 120),
(420, 120, 'You have been assigned to ticket #76. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-23 13:38:03', NULL),
(421, 120, 'You were mentioned in a comment on ticket #76', 'MENTION', 0, '2025-06-23 13:42:15', NULL),
(422, 120, 'New system added: Finatiol management system', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 13:44:22', NULL),
(423, 121, 'New system added: Finatiol management system', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 13:44:22', NULL),
(424, 145, 'New system added: Finatiol management system', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 13:44:22', NULL),
(425, 146, 'New system added: Finatiol management system', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 13:44:22', NULL),
(426, 156, 'Your ticket #76 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-06-23 14:17:36', 124),
(427, 120, 'Ticket #76 status has been changed from Open to Resolved', 'STATUS_UPDATE', 0, '2025-06-23 14:17:36', 124),
(428, 156, 'Your ticket #76 status has been changed from Resolved to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 14:17:50', 125),
(429, 120, 'Ticket #76 status has been changed from Resolved to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 14:17:50', 125),
(430, 29, 'New ticket created by User #155: employess count issue.....', 'NEW_TICKET', 0, '2025-06-24 03:26:59', NULL),
(431, 121, 'New ticket created by User #155: employess count issue.....', 'NEW_TICKET', 0, '2025-06-24 03:26:59', NULL),
(432, 145, 'New ticket created by User #155: employess count issue.....', 'NEW_TICKET', 0, '2025-06-24 03:26:59', NULL),
(433, 30, 'You were mentioned in a comment on ticket #66', 'MENTION', 0, '2025-06-24 03:28:12', NULL),
(434, 29, 'New ticket created by User #149: Menuka...', 'NEW_TICKET', 0, '2025-06-29 04:25:47', NULL),
(435, 121, 'New ticket created by User #149: Menuka...', 'NEW_TICKET', 0, '2025-06-29 04:25:47', NULL),
(436, 145, 'New ticket created by User #149: Menuka...', 'NEW_TICKET', 0, '2025-06-29 04:25:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
CREATE TABLE IF NOT EXISTS `ticket` (
  `TicketID` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `AsipiyaSystemID` int DEFAULT NULL,
  `DateTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketCategoryID` int DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `Status` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Priority` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `FirstRespondedTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `LastRespondedTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `TicketDuration` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `SupervisorID` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `UserNote` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `DueDate` timestamp NULL DEFAULT NULL,
  `Resolution` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`TicketID`),
  KEY `UserId` (`UserId`),
  KEY `AsipiyaSystemID` (`AsipiyaSystemID`),
  KEY `TicketCategoryID` (`TicketCategoryID`),
  KEY `fk_supervisor` (`SupervisorID`(250)),
  KEY `TicketID` (`TicketID`)
) ENGINE=MyISAM AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`TicketID`, `UserId`, `AsipiyaSystemID`, `DateTime`, `TicketCategoryID`, `Description`, `Status`, `Priority`, `FirstRespondedTime`, `LastRespondedTime`, `TicketDuration`, `SupervisorID`, `UserNote`, `DueDate`, `Resolution`, `Reason`) VALUES
(77, 25, 9, '2025-06-26 08:19:44', 11, 'euyodipoewk9wur48woiejf;l', 'Resolved', 'Medium', '2025-06-26 08:19:44', '2025-06-27 11:20:06', NULL, '26', NULL, NULL, NULL, NULL),
(68, 25, 9, '2025-06-25 08:54:51', 16, 'sahiihdciuwshiuahiujowkoJIUDHUDU', 'Open', 'Medium', '2025-06-25 08:54:51', '2025-06-25 11:04:01', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(69, 23, 7, '2025-06-25 11:36:45', 12, 'hfhjkza,;,aojxiuxdhlkdx,nshgxkja .', 'Open', 'Medium', '2025-06-25 11:36:45', '2025-06-25 11:54:01', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(70, 23, 13, '2025-06-25 11:37:26', 13, 'yuzjknkamzyw8kz;q/', 'Open', 'Medium', '2025-06-25 11:37:26', '2025-06-25 12:01:28', NULL, '24,26,27,28', NULL, NULL, NULL, NULL),
(71, 25, 13, '2025-06-25 11:37:53', 12, 'fygnlkmak9u8upoqza', 'Open', 'Medium', '2025-06-25 11:37:53', '2025-06-25 13:10:32', NULL, '27,26,24', NULL, NULL, NULL, NULL),
(72, 23, 9, '2025-06-26 03:24:40', 11, 'AHUSSUHJKSNKAUsSYI', 'Open', 'Medium', '2025-06-26 03:24:40', '2025-06-27 10:32:14', NULL, '27', NULL, NULL, NULL, NULL),
(73, 23, 9, '2025-06-26 03:24:56', 14, '7dywadijwkajudyyaiudoisajoko', 'Pending', 'Medium', '2025-06-26 03:24:56', '2025-06-26 03:24:56', NULL, NULL, NULL, NULL, NULL, NULL),
(74, 23, 9, '2025-06-26 03:25:18', 11, 'jasjkx,m,s ,c', 'Reject', 'Medium', '2025-06-26 06:52:07', '2025-06-26 03:25:18', NULL, NULL, NULL, NULL, NULL, 'JDUYD8U'),
(75, 25, 9, '2025-06-26 03:25:40', 11, 'aQRSTQ7YSK', 'In Progress', 'Medium', '2025-06-26 03:25:40', '2025-06-26 03:45:54', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(76, 25, 9, '2025-06-26 03:26:07', 12, 'TWHAIKMLDMLK', 'Open', 'Medium', '2025-06-26 03:26:07', '2025-06-26 03:41:32', NULL, '24,26,27', NULL, NULL, NULL, NULL),
(78, 33, 13, '2025-06-27 05:49:25', 12, 'hii', 'Resolved', 'Medium', '2025-06-27 05:49:25', '2025-06-28 18:01:15', NULL, '24,26', NULL, NULL, NULL, NULL),
(79, 33, 9, '2025-06-28 18:13:44', 12, 'MS.RANDULA', 'Pending', 'Medium', '2025-06-28 18:13:44', '2025-06-28 18:13:44', NULL, NULL, NULL, NULL, NULL, NULL),
(80, 149, 6, '2025-06-29 04:25:47', 3, 'Menuka', 'Pending', 'Medium', '2025-06-29 04:25:47', '2025-06-29 04:25:47', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticketcategory`
--

DROP TABLE IF EXISTS `ticketcategory`;
CREATE TABLE IF NOT EXISTS `ticketcategory` (
  `TicketCategoryID` int NOT NULL AUTO_INCREMENT,
  `Description` varchar(45) DEFAULT NULL,
  `CategoryName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`TicketCategoryID`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketcategory`
--

INSERT INTO `ticketcategory` (`TicketCategoryID`, `Description`, `CategoryName`, `Status`) VALUES
(2, 'System bug', 'Bug', 1),
(3, 'New feature suggestion', 'Feature Request', 1),
(4, 'Tech-related problem', 'Technical Issue', 1),
(5, 'Help with account', 'Account Support', 1),
(6, 'UI layout issue', 'UI/UX Issue', 1),
(7, 'External service error', 'Integration Issue', 1),
(8, 'Security risk report', 'Security Concern', 1),
(9, 'Data export or delete', 'Data Request', 1),
(10, 'Role or access issue', 'Access Permission', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ticketchat`
--

DROP TABLE IF EXISTS `ticketchat`;
CREATE TABLE IF NOT EXISTS `ticketchat` (
  `TicketChatID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int DEFAULT NULL,
  `Type` varchar(45) DEFAULT NULL,
  `Note` varchar(45) DEFAULT NULL,
  `UserCustomerID` varchar(45) DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  `Path` text,
  `Role` varchar(50) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TicketChatID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketchat`
--

INSERT INTO `ticketchat` (`TicketChatID`, `TicketID`, `Type`, `Note`, `UserCustomerID`, `UserID`, `Path`, `Role`, `CreatedAt`) VALUES
(7, 64, 'text', 'hi', NULL, 146, NULL, 'Supervisor', '2025-06-20 16:51:47');

-- --------------------------------------------------------

--
-- Table structure for table `ticketlog`
--

DROP TABLE IF EXISTS `ticketlog`;
CREATE TABLE IF NOT EXISTS `ticketlog` (
  `TicketLogID` int NOT NULL AUTO_INCREMENT,
  `TicketID` int DEFAULT NULL,
  `DateTime` varchar(45) DEFAULT NULL,
  `Type` varchar(45) DEFAULT NULL,
  `Description` text,
  `Note` text,
  `UserID` int DEFAULT NULL,
  `OldValue` varchar(255) DEFAULT NULL,
  `NewValue` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TicketLogID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketlog`
--

INSERT INTO `ticketlog` (`TicketLogID`, `TicketID`, `DateTime`, `Type`, `Description`, `Note`, `UserID`, `OldValue`, `NewValue`) VALUES
(18, 62, '2025-06-20 12:05:33', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 120, NULL, NULL),
(17, 66, '2025-06-19 16:22:57', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 120, NULL, NULL),
(16, 63, '2025-06-19 16:21:53', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 146, NULL, NULL),
(15, 55, '2025-06-19 15:57:26', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 120, NULL, NULL),
(19, 66, '2025-06-20 15:55:09', 'COMMENT', 'Comment added by MS.Sasindu Perera', 'hii', 120, NULL, NULL),
(20, 64, '2025-06-20 15:57:11', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 120, NULL, NULL),
(21, 64, '2025-06-20 16:02:47', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 146, NULL, NULL),
(22, 64, '2025-06-20 16:51:54', 'COMMENT', 'Comment added by Anjali Wijesinghe	', 'j', 146, NULL, NULL),
(23, 63, '2025-06-20 16:55:48', 'COMMENT', 'Comment added by Anjali Wijesinghe	', 'j', 146, NULL, NULL),
(24, 64, '2025-06-20 17:21:19', 'COMMENT', 'Comment added by Anjali Wijesinghe	', 'jk', 146, NULL, NULL),
(25, 64, '2025-06-20 17:21:45', 'COMMENT', 'Comment added by Anjali Wijesinghe	', 'plz updated', 146, NULL, NULL),
(26, 64, '2025-06-20 17:33:09', 'COMMENT', 'Comment added by Anjali Wijesinghe	', 'j', 146, NULL, NULL),
(27, 55, '2025-06-21 17:32:12', 'COMMENT', '@Ms.Ishara Jayasooriya good morning', NULL, 145, NULL, NULL),
(28, 55, '2025-06-21 17:33:01', 'COMMENT', 'hii @Dilshan Fernando', NULL, 145, NULL, NULL),
(29, 55, '2025-06-21 17:33:32', 'COMMENT', '@MS.Sasindu Perera new ticket', NULL, 145, NULL, NULL),
(30, 55, '2025-06-21 17:36:03', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 120, NULL, NULL),
(31, 63, '2025-06-21 17:40:16', 'COMMENT', 'plz check @MS.Sasindu Perera', NULL, 145, NULL, NULL),
(32, 63, '2025-06-21 17:40:28', 'COMMENT', 'plz chec @MS.Sasindu Perera', NULL, 145, NULL, NULL),
(33, 63, '2025-06-21 17:41:20', 'COMMENT', 'plz cgecked now @Dilshan Fernando', NULL, 145, NULL, NULL),
(34, 63, '2025-06-21 17:41:32', 'COMMENT', '@Anjali Wijesinghe	 HII', NULL, 145, NULL, NULL),
(35, 63, '2025-06-21 17:42:17', 'COMMENT', '@Anjali Wijesinghe', NULL, 145, NULL, NULL),
(36, 64, '2025-06-21 18:56:44', 'SUPERVISOR_ASSIGN', 'Supervisor assigned', NULL, 146, NULL, NULL),
(37, 66, '2025-06-21 19:03:11', 'PRIORITY_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Priority changed from Low to Medium', NULL, 121, 'Low', 'Medium'),
(38, 66, '2025-06-21 19:03:31', 'STATUS_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Status changed from Resolved to Open', NULL, 121, 'Resolved', 'Open'),
(39, 66, '2025-06-21 19:07:05', 'PRIORITY_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Priority changed from Medium to High', NULL, 121, 'Medium', 'High'),
(40, 57, '2025-06-21 19:12:18', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '146'),
(41, 57, '2025-06-21 19:12:18', 'STATUS_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(42, 66, '2025-06-21 19:14:51', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, '120', '146'),
(43, 61, '2025-06-21 19:15:11', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '146'),
(44, 61, '2025-06-21 19:15:11', 'STATUS_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(45, 66, '2025-06-21 19:16:02', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, '146', '120'),
(46, 66, '2025-06-21 19:17:05', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, '120', '146'),
(47, 66, '2025-06-21 19:21:15', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, '146', '120'),
(48, 60, '2025-06-21 19:34:38', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '146'),
(49, 60, '2025-06-21 19:34:38', 'STATUS_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(50, 59, '2025-06-21 19:35:59', 'SUPERVISOR_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', NULL, 146, NULL, '120'),
(51, 59, '2025-06-21 19:35:59', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from Pending to Open', NULL, 146, 'Pending', 'Open'),
(52, 59, '2025-06-21 19:35:59', 'PRIORITY_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Priority changed from Medium to High', NULL, 146, 'Medium', 'High'),
(53, 66, '2025-06-21 19:40:49', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from Pending to Open', NULL, 146, 'Pending', 'Open'),
(54, 66, '2025-06-21 19:43:24', 'SUPERVISOR_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, '120', '146'),
(55, 66, '2025-06-21 19:43:24', 'STATUS_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Status changed from Open to In Progress', NULL, 121, 'Open', 'In Progress'),
(56, 66, '2025-06-21 19:43:24', 'PRIORITY_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Priority changed from High to Low', NULL, 121, 'High', 'Low'),
(57, 64, '2025-06-21 19:50:45', 'STATUS_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Status changed from Pending to In Progress', NULL, 121, 'Pending', 'In Progress'),
(58, 64, '2025-06-21 19:51:23', 'PRIORITY_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Priority changed from High to Low', NULL, 121, 'High', 'Low'),
(59, 61, '2025-06-21 19:53:36', 'STATUS_CHANGE', 'Ms.Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(60, 55, '2025-06-21 20:09:27', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Pending to In Progress', NULL, 145, 'Pending', 'In Progress'),
(61, 66, '2025-06-21 20:15:33', 'SUPERVISOR_CHANGE', 'Dilshan Fernando	 (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 145, '146', '120'),
(62, 66, '2025-06-21 20:16:12', 'PRIORITY_CHANGE', 'Dilshan Fernando	 (Admin) Priority changed from Low to Medium', NULL, 145, 'Low', 'Medium'),
(63, 60, '2025-06-21 20:58:47', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Pending to Open', NULL, 145, 'Pending', 'Open'),
(64, 60, '2025-06-21 20:59:25', 'COMMENT', '@MS.Sasindu Perera', NULL, 145, NULL, NULL),
(65, 63, '2025-06-21 21:03:49', 'COMMENT', '@Ms.Ishara Jayasooriya hii', NULL, 145, NULL, NULL),
(66, 60, '2025-06-21 21:05:45', 'COMMENT', 'employes highring @MS.Sasindu Perera', NULL, 145, NULL, NULL),
(67, 60, '2025-06-21 21:05:58', 'COMMENT', 'hii @MS.Sasindu Perera', NULL, 145, NULL, NULL),
(68, 60, '2025-06-21 21:06:08', 'COMMENT', 'hi @Dilshan Fernando', NULL, 145, NULL, NULL),
(69, 60, '2025-06-21 21:11:03', 'COMMENT', '@MS.Sasindu Perera', NULL, 145, NULL, NULL),
(70, 60, '2025-06-21 21:12:15', 'COMMENT', 'this comment feture succesfully added @Ishara Jayasooriya', NULL, 145, NULL, NULL),
(71, 55, '2025-06-23 08:26:21', 'COMMENT', 'new massage @Sasindu Perera', NULL, 145, NULL, NULL),
(72, 66, '2025-06-23 08:31:45', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from In Progress to Open', NULL, 145, 'In Progress', 'Open'),
(73, 57, '2025-06-23 11:35:19', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Pending to Open', NULL, 145, 'Pending', 'Open'),
(74, 59, '2025-06-23 11:38:12', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Pending to Open', NULL, 145, 'Pending', 'Open'),
(75, 58, '2025-06-23 11:42:55', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Pending to Open', NULL, 145, 'Pending', 'Open'),
(76, 67, '2025-06-23 11:56:19', 'SUPERVISOR_CHANGE', 'Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '120'),
(77, 67, '2025-06-23 11:56:19', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(78, 68, '2025-06-23 12:06:06', 'SUPERVISOR_CHANGE', 'Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '120'),
(79, 68, '2025-06-23 12:06:06', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(80, 68, '2025-06-23 12:08:08', 'PRIORITY_CHANGE', 'Ishara Jayasooriya (Admin) Priority changed from Medium to High', NULL, 121, 'Medium', 'High'),
(81, 69, '2025-06-23 12:22:12', 'SUPERVISOR_CHANGE', 'Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '120'),
(82, 69, '2025-06-23 12:22:12', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(83, 70, '2025-06-23 12:33:18', 'SUPERVISOR_CHANGE', 'Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '120'),
(84, 70, '2025-06-23 12:33:18', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(85, 71, '2025-06-23 13:11:07', 'SUPERVISOR_CHANGE', 'Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', NULL, 121, NULL, '120'),
(86, 71, '2025-06-23 13:11:07', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Pending to Open', NULL, 121, 'Pending', 'Open'),
(87, 57, '2025-06-23 14:46:46', 'COMMENT', 'hi @Sasindu Perera', NULL, 121, NULL, NULL),
(88, 72, '2025-06-23 15:23:33', 'SUPERVISOR_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', NULL, 146, NULL, '146'),
(89, 72, '2025-06-23 15:23:33', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from Pending to In Progress', NULL, 146, 'Pending', 'In Progress'),
(90, 73, '2025-06-23 17:13:13', 'SUPERVISOR_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', NULL, 146, NULL, '120'),
(91, 73, '2025-06-23 17:13:13', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from Pending to In Progress', NULL, 146, 'Pending', 'In Progress'),
(92, 73, '2025-06-23 17:13:13', 'PRIORITY_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Priority changed from Medium to Low', NULL, 146, 'Medium', 'Low'),
(93, 73, '2025-06-23 17:24:01', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from In Progress to Resolved', 'Updated by Unknown User', 146, 'In Progress', 'Resolved'),
(94, 73, '2025-06-23 17:24:01', 'PRIORITY_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Priority changed from Low to Medium', 'Updated by Unknown User', 146, 'Low', 'Medium'),
(95, 69, '2025-06-23 17:26:30', 'SUPERVISOR_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by Unknown User', 146, '120', '146'),
(96, 69, '2025-06-23 17:26:30', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from Pending to Open', 'Updated by Unknown User', 146, 'Pending', 'Open'),
(97, 69, '2025-06-23 17:26:30', 'PRIORITY_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Priority changed from Medium to Low', 'Updated by Unknown User', 146, 'Medium', 'Low'),
(98, 73, '2025-06-23 17:30:36', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from Resolved to Open', 'Updated by Unknown User', 146, 'Resolved', 'Open'),
(99, 74, '2025-06-23 17:40:22', 'SUPERVISOR_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 146, NULL, '146'),
(100, 74, '2025-06-23 17:40:22', 'STATUS_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Status changed from Pending to In Progress', 'Updated by null', 146, 'Pending', 'In Progress'),
(101, 74, '2025-06-23 17:40:22', 'PRIORITY_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Priority changed from Medium to Low', 'Updated by null', 146, 'Medium', 'Low'),
(102, 75, '2025-06-23 17:46:47', 'SUPERVISOR_CHANGE', 'Dilshan Fernando	 (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 145, NULL, '120'),
(103, 75, '2025-06-23 17:46:47', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Pending to In Progress', 'Updated by null', 145, 'Pending', 'In Progress'),
(104, 75, '2025-06-23 17:46:47', 'PRIORITY_CHANGE', 'Dilshan Fernando	 (Admin) Priority changed from Medium to Low', 'Updated by null', 145, 'Medium', 'Low'),
(105, 57, '2025-06-23 17:47:53', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 145', 145, 'Open', 'In Progress'),
(106, 75, '2025-06-23 17:48:31', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from In Progress to Open', 'Status updated by User ID: 145', 145, 'In Progress', 'Open'),
(107, 58, '2025-06-23 18:10:27', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 145', 145, 'Open', 'In Progress'),
(108, 58, '2025-06-23 18:10:30', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-06-14', NULL, 145, NULL, '2025-06-14'),
(109, 58, '2025-06-23 18:10:44', 'DUE_DATE_CHANGE', 'Due date changed from Sat Jun 14 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-06-05', NULL, 145, '2025-06-14 00:00:00.000', '2025-06-05'),
(110, 58, '2025-06-23 18:12:51', 'STATUS_CHANGE', 'Dilshan Fernando	 (Admin) Status changed from In Progress to Open', 'Status updated by User ID: 145', 145, 'In Progress', 'Open'),
(111, 58, '2025-06-23 18:13:00', 'DUE_DATE_CHANGE', 'Due date changed from Thu Jun 05 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-06-03', NULL, 145, '2025-06-05 00:00:00.000', '2025-06-03'),
(112, 58, '2025-06-23 18:13:23', 'COMMENT', 'hii @Sasindu Perera', NULL, 145, NULL, NULL),
(113, 58, '2025-06-23 18:29:44', 'COMMENT', 'hi @Sasindu Perera', NULL, 145, NULL, NULL),
(114, 76, '2025-06-23 19:01:57', 'SUPERVISOR_CHANGE', 'Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 121, NULL, '120'),
(115, 76, '2025-06-23 19:01:57', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Pending to Open', 'Updated by null', 121, 'Pending', 'Open'),
(116, 76, '2025-06-23 19:03:59', 'SUPERVISOR_CHANGE', 'Ishara Jayasooriya (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 121, '120', '146'),
(117, 76, '2025-06-23 19:03:59', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Pending to Open', 'Updated by null', 121, 'Pending', 'Open'),
(118, 76, '2025-06-23 19:05:12', 'SUPERVISOR_CHANGE', 'Anjali Wijesinghe	 (Supervisor) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 146, '146', '120'),
(119, 76, '2025-06-23 19:07:35', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Open to In Progress', 'Status updated by User ID: 121', 121, 'Open', 'In Progress'),
(120, 76, '2025-06-23 19:08:03', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from In Progress to Open', 'Updated by null', 121, 'In Progress', 'Open'),
(121, 76, '2025-06-23 19:08:34', 'DUE_DATE_CHANGE', 'Due date changed from null to 2025-06-05', NULL, 121, NULL, '2025-06-05'),
(122, 76, '2025-06-23 19:08:44', 'DUE_DATE_CHANGE', 'Due date changed from Thu Jun 05 2025 00:00:00 GMT+0530 (India Standard Time) to 2025-06-03', NULL, 121, '2025-06-05 00:00:00.000', '2025-06-03'),
(123, 76, '2025-06-23 19:12:15', 'COMMENT', 'its better improvement @Sasindu Perera', NULL, 121, NULL, NULL),
(124, 76, '2025-06-23 19:47:36', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Open to Resolved', 'Status updated by User ID: 121', 121, 'Open', 'Resolved'),
(125, 76, '2025-06-23 19:47:50', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Resolved to In Progress', 'Status updated by User ID: 121', 121, 'Resolved', 'In Progress'),
(126, 66, '2025-06-24 08:58:12', 'COMMENT', 'in the ew user @Saman Edirimuni', NULL, 121, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `userid`
--

DROP TABLE IF EXISTS `userid`;
CREATE TABLE IF NOT EXISTS `userid` (
  `UserId` int NOT NULL AUTO_INCREMENT,
  `UserName` varchar(45) DEFAULT NULL,
  `Email` varchar(45) DEFAULT NULL,
  `ContactNo` varchar(45) DEFAULT NULL,
  `ClientID` int DEFAULT NULL,
  `Branch` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`UserId`),
  KEY `ClientID` (`ClientID`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comment_reply` FOREIGN KEY (`ReplyToCommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE;

--
-- Constraints for table `evidence`
--
ALTER TABLE `evidence`
  ADD CONSTRAINT `fk_evidence_ticket` FOREIGN KEY (`ComplaintID`) REFERENCES `ticket` (`TicketID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `appuser` (`UserId`) ON DELETE CASCADE;
--
-- Database: `wonder_map`
--
CREATE DATABASE IF NOT EXISTS `wonder_map` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `wonder_map`;

-- --------------------------------------------------------

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ;

-- --------------------------------------------------------

--
-- Table structure for table `special_points`
--

DROP TABLE IF EXISTS `special_points`;
CREATE TABLE IF NOT EXISTS `special_points` (
  `point_id` int NOT NULL AUTO_INCREMENT,
  `trail_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `lat` decimal(9,6) DEFAULT NULL,
  `lng` decimal(9,6) DEFAULT NULL,
  PRIMARY KEY (`point_id`),
  KEY `trail_id` (`trail_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `special_points`
--

INSERT INTO `special_points` (`point_id`, `trail_id`, `name`, `lat`, `lng`) VALUES
(1, 1, 'Ruwanwelisaya', 8.349170, 80.388480),
(2, 1, 'Sri Maha Bodhiya', 8.347890, 80.390120);

-- --------------------------------------------------------

--
-- Table structure for table `trails`
--

DROP TABLE IF EXISTS `trails`;
CREATE TABLE IF NOT EXISTS `trails` (
  `trail_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `short_description` text,
  `start_lat` decimal(9,6) DEFAULT NULL,
  `start_lng` decimal(9,6) DEFAULT NULL,
  `end_lat` decimal(9,6) DEFAULT NULL,
  `end_lng` decimal(9,6) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `trail_date` date DEFAULT NULL,
  `trail_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`trail_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `trails`
--

INSERT INTO `trails` (`trail_id`, `user_id`, `name`, `category`, `short_description`, `start_lat`, `start_lng`, `end_lat`, `end_lng`, `video_url`, `photo_url`, `trail_date`, `trail_time`, `created_at`) VALUES
(1, 1, 'Anuradhapura Heritage Trail', 'Hiking', 'Explore ancient landmarks in Anuradhapura.', 8.345678, 80.388765, 8.351234, 80.394321, 'videos/anuradhapura_trail.mp4', '\"C:\\Users\\user\\Downloads\\රියුගා ගීතය (1).jpg\"', '2025-06-12', '10:00:00', '2025-06-10 10:56:52'),
(2, 2, 'AMBULUWAWA', 'Walking', 'Explore ancient landmarks in  ambuluwawa.', 8.345678, 80.388765, 8.351234, 80.394321, 'videos/ambuluwawa_trail.mp4', 'images/anuradhapura_photo.jpg', '2025-06-12', '10:00:00', '2025-06-10 05:26:52');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `bio` text,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `role`, `created_at`, `profile_image_url`, `bio`) VALUES
(9, 'nethmitk33@gmail.com', 'SURESH@gmail.com', '$2a$10$kULYCHoJTwxRyogvCprIAO/nwc7vOeE2h8clrN1Gxj723Tw9uqCoa', 'user', '2025-06-26 06:52:54', NULL, NULL),
(10, 'nethmitffk33@gmail.com', 'nethmitffk33@gmail.com', '$2a$10$PvxzdSPCMMakhEQrsu7lmOm.twqH3JpvsBUHEfEDn6trmzGzR0GL2', 'user', '2025-06-26 07:42:39', NULL, NULL),
(11, 'user1', 'user1@gmail.com', '$2a$10$9wcOa1NMsD3R/SFnHfon6eQZdjmu4I/TPM2EGZAFPSwrFIOyZrqRq', 'user', '2025-06-26 07:43:29', NULL, NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
