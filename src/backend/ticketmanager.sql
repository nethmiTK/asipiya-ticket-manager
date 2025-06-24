-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 23, 2025 at 02:32 PM
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
-- Database: `ticketmanager`
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
  `FullName` varchar(45) DEFAULT NULL,
  `Email` varchar(45) DEFAULT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` varchar(45) DEFAULT NULL,
  `Phone` varchar(45) DEFAULT NULL,
  `ProfileImagePath` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appuser`
--

INSERT INTO `appuser` (`UserID`, `FullName`, `Email`, `Password`, `Role`, `Phone`, `ProfileImagePath`) VALUES
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
  KEY `fk_comment_reply` (`ReplyToCommentID`),
  CONSTRAINT `fk_comment_reply` FOREIGN KEY (`ReplyToCommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`CommentID`, `TicketID`, `UserID`, `CommentText`, `CreatedAt`, `Mentions`, `ReplyToCommentID`, `AttachmentFilePath`, `AttachmentFileName`, `AttachmentFileType`) VALUES
(1, 55, 121, '@hi', '2025-06-21 11:02:14', '@hi', NULL, NULL, NULL, NULL),
(2, 55, 121, '@MS.Sasindu Perera plz check this', '2025-06-21 11:11:25', '@MS', 1, NULL, NULL, NULL),
(3, 55, 121, '@Anjali Wijesinghe	 plz report give me .', '2025-06-21 11:12:29', '@Anjali Wijesinghe	 plz report give me ', 2, NULL, NULL, NULL),
(4, 55, 121, 'hi @Ms.Ishara Jayasooriya', '2025-06-21 11:15:16', '@Ms', 1, NULL, NULL, NULL),
(5, 55, 121, 'plz hecked it @Dilshan Fernando', '2025-06-21 11:15:56', '@Dilshan Fernando	 ', 1, NULL, NULL, NULL),
(6, 55, 121, '@Ms.Ishara Jayasooriya  plz check this', '2025-06-21 11:22:08', '@Ms', 1, NULL, NULL, NULL),
(7, 55, 121, '@Dilshan Fernando	 hi', '2025-06-21 11:26:53', '@Dilshan Fernando	 hi\n', 1, NULL, NULL, NULL),
(8, 55, 121, '@gy', '2025-06-21 11:27:18', '@gy', 1, NULL, NULL, NULL),
(9, 55, 121, '@Anjali Wijesinghe	 hi', '2025-06-21 11:27:32', '@Anjali Wijesinghe	 hi', 2, NULL, NULL, NULL),
(10, 55, 121, '@MS.Sasindu Perera hi', '2025-06-21 11:41:49', '@MS', 1, NULL, NULL, NULL),
(11, 55, 121, 'hii @MS.Sasindu Perera', '2025-06-21 11:42:01', '@MS', 1, NULL, NULL, NULL),
(12, 55, 121, '@Dilshan Fernando', '2025-06-21 11:42:26', '@Dilshan Fernando	 ', 1, NULL, NULL, NULL),
(13, 55, 121, 'hi @Dilshan Fernando', '2025-06-21 11:42:43', '@Dilshan Fernando	 ', 1, NULL, NULL, NULL),
(14, 55, 145, '@Ms.Ishara Jayasooriya good morning', '2025-06-21 12:02:12', '@Ms', 1, NULL, NULL, NULL),
(15, 55, 145, 'hii @Dilshan Fernando', '2025-06-21 12:03:01', '@Dilshan Fernando	 ', 1, NULL, NULL, NULL),
(16, 55, 145, '@MS.Sasindu Perera new ticket', '2025-06-21 12:03:32', '@MS', 1, NULL, NULL, NULL),
(17, 63, 145, 'plz check @MS.Sasindu Perera', '2025-06-21 12:10:16', '@MS', 1, NULL, NULL, NULL),
(18, 63, 145, 'plz chec @MS.Sasindu Perera', '2025-06-21 12:10:28', '@MS', 1, NULL, NULL, NULL),
(19, 63, 145, 'plz cgecked now @Dilshan Fernando', '2025-06-21 12:11:20', '@Dilshan Fernando	 ', 1, NULL, NULL, NULL),
(20, 63, 145, '@Anjali Wijesinghe	 HII', '2025-06-21 12:11:32', '@Anjali Wijesinghe	 HII', 2, NULL, NULL, NULL),
(21, 63, 145, '@Anjali Wijesinghe', '2025-06-21 12:12:17', '@Anjali Wijesinghe	 ', 2, NULL, NULL, NULL),
(22, 60, 145, '@MS.Sasindu Perera', '2025-06-21 15:29:25', '@MS', 1, NULL, NULL, NULL),
(23, 63, 145, '@Ms.Ishara Jayasooriya hii', '2025-06-21 15:33:49', '@Ms', 1, NULL, NULL, NULL),
(24, 60, 145, 'employes highring @MS.Sasindu Perera', '2025-06-21 15:35:45', '@MS', 1, NULL, NULL, NULL),
(25, 60, 145, 'hii @MS.Sasindu Perera', '2025-06-21 15:35:58', '@MS', 1, NULL, NULL, NULL),
(26, 60, 145, 'hi @Dilshan Fernando', '2025-06-21 15:36:08', '@Dilshan Fernando	 ', 1, NULL, NULL, NULL),
(27, 60, 145, '@MS.Sasindu Perera', '2025-06-21 15:41:03', '@MS', 1, NULL, NULL, NULL),
(28, 60, 145, 'this comment feture succesfully added @Ishara Jayasooriya', '2025-06-21 15:42:15', '@Ishara Jayasooriya ', 1, NULL, NULL, NULL),
(29, 55, 145, 'new massage @Sasindu Perera', '2025-06-23 02:56:21', '@Sasindu Perera ', 2, NULL, NULL, NULL),
(30, 57, 121, 'hi @Sasindu Perera', '2025-06-23 09:16:46', '@Sasindu Perera ', 1, NULL, NULL, NULL),
(31, 58, 145, 'hii @Sasindu Perera', '2025-06-23 12:43:23', '@Sasindu Perera ', 2, NULL, NULL, NULL),
(32, 58, 145, 'hi @Sasindu Perera', '2025-06-23 12:59:44', '@Sasindu Perera ', 2, NULL, NULL, NULL),
(33, 76, 121, 'its better improvement @Sasindu Perera', '2025-06-23 13:42:15', '@Sasindu Perera ', 1, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(30, 'improved the inventory ui black mode not working..', 'uploads/evidenceFiles-1750685476233-545976013.png', 76);

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
) ENGINE=MyISAM AUTO_INCREMENT=430 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(429, 120, 'Ticket #76 status has been changed from Resolved to In Progress', 'STATUS_UPDATE', 0, '2025-06-23 14:17:50', 125);

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
  `Description` text,
  `Status` varchar(45) DEFAULT NULL,
  `Priority` varchar(45) DEFAULT NULL,
  `FirstRespondedTime` varchar(45) DEFAULT NULL,
  `LastRespondedTime` varchar(45) DEFAULT NULL,
  `TicketDuration` varchar(45) DEFAULT NULL,
  `UserNote` text,
  `SupervisorID` int DEFAULT NULL,
  `DueDate` timestamp NULL DEFAULT NULL,
  `Resolution` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`TicketID`),
  KEY `UserId` (`UserId`),
  KEY `AsipiyaSystemID` (`AsipiyaSystemID`),
  KEY `TicketCategoryID` (`TicketCategoryID`),
  KEY `fk_supervisor` (`SupervisorID`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`TicketID`, `UserId`, `AsipiyaSystemID`, `DateTime`, `TicketCategoryID`, `Description`, `Status`, `Priority`, `FirstRespondedTime`, `LastRespondedTime`, `TicketDuration`, `UserNote`, `SupervisorID`, `DueDate`, `Resolution`) VALUES
(55, 119, 4, '2025-06-19 10:25:02', 2, 'System crash when clicking submit button.', 'In Progress', 'High', '2025-06-19 15:57:26', '2025-06-21 20:09:27', NULL, NULL, 120, '2025-06-27 18:30:00', 'THIS IS URGENT..'),
(56, 151, 5, '2025-06-19 10:39:02', 10, 'User unable to login due to password error.', 'Reject', 'High', '2025-06-19 22:57:14.643', NULL, NULL, NULL, 120, NULL, NULL),
(57, 151, 6, '2025-06-19 10:39:23', 5, 'Unable to generate monthly sales report.\n\n', 'In Progress', 'High', '2025-06-21 19:12:18', '2025-06-23 17:47:53', NULL, NULL, 120, NULL, NULL),
(58, 150, 7, '2025-06-19 10:39:52', 8, 'Email notifications not being sent.\n\n', 'Open', 'High', '2025-06-23 11:42:55', '2025-06-23 18:12:51', NULL, NULL, 120, '2025-06-02 18:30:00', 'its confirm'),
(59, 150, 5, '2025-06-19 10:40:12', 6, 'Unable to upload profile picture.\n\n', 'Open', 'High', '2025-06-21 19:35:59', '2025-06-23 11:38:12', NULL, NULL, 120, NULL, NULL),
(60, 150, 8, '2025-06-19 10:40:30', 7, 'Search function returns incorrect results.\n\n', 'Open', 'High', '2025-06-21 19:34:38', '2025-06-21 20:58:47', NULL, NULL, 120, NULL, NULL),
(61, 150, 9, '2025-06-19 10:40:54', 7, 'System is slow during peak hours.\n\n', 'Open', 'High', '2025-06-21 19:15:11', '2025-06-21 19:53:36', NULL, NULL, 120, NULL, NULL),
(62, 149, 10, '2025-06-19 10:41:21', 7, 'Account locked after multiple failed login attempts.\n\n', 'Resolved', 'High', '2025-06-20 12:05:33', '2025-06-20 12:05:33', NULL, NULL, 120, NULL, 'its email recovery checked now'),
(63, 149, 8, '2025-06-19 10:41:43', 9, 'Need access to admin panel for reports.\n\n', 'Open', 'High', '2025-06-19 16:21:53', '2025-06-19 16:21:53', NULL, NULL, 120, '2025-06-19 18:30:00', 'PLZ CHECKED'),
(64, 149, 11, '2025-06-19 10:42:14', 9, 'Missing data in user activity logs.\n\n', 'In Progress', 'Low', '2025-06-20 15:57:11', '2025-06-21 19:52:41', NULL, NULL, 120, '2025-06-20 18:30:00', NULL),
(65, 119, 9, '2025-06-19 10:42:51', 3, 'Cannot export data to CSV format.\n\n', 'Reject', 'High', '2025-06-20 12:05:20.637', NULL, NULL, NULL, 120, NULL, NULL),
(66, 152, 7, '2025-06-19 10:44:52', 8, 'User unable to update contact information.\n\n', 'Open', 'Medium', '2025-06-19 16:22:57', '2025-06-23 08:31:45', NULL, NULL, 120, '2025-06-06 18:30:00', 'its email recovry checked it'),
(67, 152, 5, '2025-06-23 06:26:07', 4, 'ji', 'Open', 'Medium', '2025-06-23 11:56:19', '2025-06-23 11:56:19', NULL, NULL, 120, NULL, NULL),
(68, 152, 5, '2025-06-23 06:35:51', 3, 'hii', 'Open', 'High', '2025-06-23 12:06:06', '2025-06-23 12:08:08', NULL, NULL, 120, NULL, NULL),
(69, 153, 5, '2025-06-23 06:51:57', 5, 'its tracking root eroor', 'Open', 'Low', '2025-06-23 12:22:12', '2025-06-23 17:26:30', NULL, NULL, 146, NULL, NULL),
(70, 153, 7, '2025-06-23 06:59:16', 5, 'mko', 'Open', 'Medium', '2025-06-23 12:33:18', '2025-06-23 12:33:18', NULL, NULL, 120, NULL, NULL),
(71, 154, 8, '2025-06-23 07:40:41', 8, 'hello', 'Open', 'Medium', '2025-06-23 13:11:06', '2025-06-23 13:11:06', NULL, NULL, 120, NULL, NULL),
(72, 153, 10, '2025-06-23 08:03:42', 4, 'check', 'In Progress', 'Medium', '2025-06-23 15:23:33', '2025-06-23 15:23:33', NULL, NULL, 146, NULL, NULL),
(73, 155, 5, '2025-06-23 10:10:48', 3, 'not availble system count', 'Open', 'Medium', '2025-06-23 17:13:13', '2025-06-23 17:30:36', NULL, NULL, 120, NULL, NULL),
(74, 155, 5, '2025-06-23 12:09:59', 6, 'this color is white theme..plz its convert dark mode', 'In Progress', 'Low', '2025-06-23 17:40:22', '2025-06-23 17:40:22', NULL, NULL, 146, NULL, NULL),
(75, 155, 9, '2025-06-23 12:16:12', 4, 'plz check that ', 'Open', 'Low', '2025-06-23 17:46:47', '2025-06-23 17:52:53', NULL, NULL, 120, NULL, NULL),
(76, 156, 6, '2025-06-23 13:31:16', 3, 'improved the inventory ui black mode not working..', 'In Progress', 'Medium', '2025-06-23 19:01:57', '2025-06-23 19:47:50', NULL, NULL, 120, '2025-06-02 18:30:00', 'its good step now');

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
) ENGINE=MyISAM AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(125, 76, '2025-06-23 19:47:50', 'STATUS_CHANGE', 'Ishara Jayasooriya (Admin) Status changed from Resolved to In Progress', 'Status updated by User ID: 121', 121, 'Resolved', 'In Progress');

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
  ADD CONSTRAINT `fk_comment_ticket` FOREIGN KEY (`TicketID`) REFERENCES `ticket` (`TicketID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comment_user` FOREIGN KEY (`UserID`) REFERENCES `appuser` (`UserID`) ON DELETE CASCADE,
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
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `appuser` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `fk_supervisor` FOREIGN KEY (`SupervisorID`) REFERENCES `appuser` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------

--
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
CREATE TABLE IF NOT EXISTS `comment_likes` (
  `LikeID` INT NOT NULL AUTO_INCREMENT,
  `CommentID` INT NOT NULL,
  `UserID` INT NOT NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LikeID`),
  UNIQUE KEY `uq_comment_user_like` (`CommentID`, `UserID`),
  FOREIGN KEY (`CommentID`) REFERENCES `comments`(`CommentID`) ON DELETE CASCADE,
  FOREIGN KEY (`UserID`) REFERENCES `appuser`(`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB;
