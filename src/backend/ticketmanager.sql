 -- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 30, 2025 at 03:29 AM
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

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `AddTicketComment`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `AddTicketComment` (IN `p_TicketID` INT, IN `p_UserID` INT, IN `p_CommentText` TEXT, IN `p_Mentions` TEXT)   BEGIN
    INSERT INTO comments (TicketID, UserID, CommentText, Mentions)
    VALUES (p_TicketID, p_UserID, p_CommentText, p_Mentions);
END$$

DELIMITER ;

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
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--
 
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
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(73, 88, 'uploads/comment_attachments/comment-1751175980804-670160827.mp4', 'WhatsApp Video 2025-06-28 at 23.28.34_363f7247.mp4', 'video/mp4');

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
) ENGINE=MyISAM AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evidence`
--
 
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
) ENGINE=MyISAM AUTO_INCREMENT=372 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--
 
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
) ENGINE=MyISAM AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(81, 36, 9, '2025-06-30 03:22:29', 12, 'Menuka', 'In Progress', 'Low', '2025-06-30 03:22:29', '2025-06-30 03:22:55', NULL, '23,24', NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(135, 73, '2025-06-30 08:53:41', 'PRIORITY_CHANGE', 'supervisor (Supervisor) Priority changed from Medium to Medium', 'Updated by null', 35, 'Medium', 'Medium');

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
