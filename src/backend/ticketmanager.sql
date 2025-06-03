-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 02, 2025 at 10:45 AM
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
) ENGINE=MyISAM AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appuser`
--

INSERT INTO `appuser` (`UserID`, `FullName`, `Email`, `Password`, `Role`, `Phone`, `ProfileImagePath`) VALUES
(60, 'MS.HASHINI DILHARA', 'Hashii@gmail.com', 'mk332f%A', 'User', '07789658327', NULL),
(68, 'MS.RANDULA', 'NETHTK33@gmail.com', '$2b$10$jNJxt/Kji.E037GPAr.tqeiY0rI1LBFbhQRGTO', 'User', '0777858521', NULL),
(73, 'MS.Hashini dilhara THALIKORALGE', 'hashi@gmail.com', '$2b$10$NdSBIv9BfPi9O4FW7345oe9EnZV4N3jnQ17xXRcL2wx5.Kz/AvC0.', 'Admin', '0761211070', NULL),
(74, 'MS.Hashini dilhara', 'NETH@gmail.com', '$2b$10$bnpRzsMxhANxCWlNqKRgJ.IzSycWdE61X2sr7Aim4xbkppQnl4MCa', 'Admin', '0761211070', NULL),
(1, 'MS ADMIN', 'admin@gmail.com', '$2b$10$nKotY.VxJn/XnXh3D5LV/umb6h1NrmSNkt0.ImSPob.Wpw2GN3Y4C', 'Admin', '0778569203', NULL),
(78, 'MS user', 'user@gmail.com', '$2b$10$0BbmVwxjKlhDgjSxvvmUm.iMLDoKkKrJtySILMc8o/0kA6VZw5nzO', 'User', '0761211070', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asipiyasystem`
--

DROP TABLE IF EXISTS `asipiyasystem`;
CREATE TABLE IF NOT EXISTS `asipiyasystem` (
  `AsipiyaSystemID` int NOT NULL AUTO_INCREMENT,
  `SystemName` varchar(255) NOT NULL,
  `Description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`AsipiyaSystemID`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `asipiyasystem`
--

INSERT INTO `asipiyasystem` (`AsipiyaSystemID`, `SystemName`, `Description`) VALUES
(1, 'Billing System', 'Inventory System'),
(2, 'Inventory Control', 'HR Management System'),
(3, '', 'Sales Dashboard'),
(4, '', 'System A'),
(5, '', 'System B'),
(6, 'EDUCATION SYSTEM', 'ONLINE LIBRARY'),
(7, 'hi', 'hi'),
(8, 'finatiol system', 'fination things'),
(9, 'mk', 'mk');

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `ClientID` int NOT NULL AUTO_INCREMENT,
  `CompanyName` varchar(45) DEFAULT NULL,
  `ContactNo` varchar(45) DEFAULT NULL,
  `ContactPerson` varchar(45) DEFAULT NULL,
  `MobileNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ClientID`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`ClientID`, `CompanyName`, `ContactNo`, `ContactPerson`, `MobileNo`) VALUES
(1, 'ABC Pvt Ltd', '0112345678', 'John Doe', '0711111111'),
(2, 'XYZ Enterprises', '0118765432', 'Jane Smith', '0722222222'),
(3, 'TechNova Ltd', '0111234567', 'John Perera', '0779876543'),
(4, 'CodeHouse Pvt Ltd', '0117654321', 'Nimal Raj', '0773456789');

-- --------------------------------------------------------

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
CREATE TABLE IF NOT EXISTS `evidence` (
  `EvidenceID` int NOT NULL AUTO_INCREMENT,
  `Description` text,
  `FilePath` varchar(45) DEFAULT NULL,
  `ComplaintID` int DEFAULT NULL,
  PRIMARY KEY (`EvidenceID`),
  KEY `fk_evidence_ticket` (`ComplaintID`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `evidence`
--

INSERT INTO `evidence` (`EvidenceID`, `Description`, `FilePath`, `ComplaintID`) VALUES
(1, 'Screenshot of the error', 'uploads/evidence1.png', 1),
(2, 'Log file attached', 'uploads/logs1.txt', 2),
(3, 'Video evidence', 'uploads/video1.mp4', 3),
(4, 'Screenshot of error', '/files/error1.png', 1),
(5, 'Email complaint thread', '/files/email.txt', 2);

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
  PRIMARY KEY (`TicketID`),
  KEY `UserId` (`UserId`),
  KEY `AsipiyaSystemID` (`AsipiyaSystemID`),
  KEY `TicketCategoryID` (`TicketCategoryID`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`TicketID`, `UserId`, `AsipiyaSystemID`, `DateTime`, `TicketCategoryID`, `Description`, `Status`, `Priority`, `FirstRespondedTime`, `LastRespondedTime`, `TicketDuration`, `UserNote`) VALUES
(17, 1, 1, '2025-05-28 11:29:25', 2, 'Login issue on Asipiya portal', 'Open', 'High', NULL, NULL, NULL, 'User unable to login after password reset.'),
(2, 1, 101, '2025-05-28 04:30:00', 1, 'System crash issue', 'Open', 'High', '2025-05-28 10:30:00', NULL, NULL, 'User reported system crash'),
(3, 2, 102, '2025-05-27 08:30:00', 2, 'Login issue', 'In Progress', 'Medium', '2025-05-27 14:15:00', '2025-05-27 15:00:00', '1 hour', 'User unable to login'),
(4, 3, 103, '2025-05-26 03:30:00', 3, 'Network issue', 'Closed', 'Low', '2025-05-26 09:30:00', '2025-05-26 10:00:00', '30 minutes', 'Network connectivity restored'),
(5, 1, 1, '2025-05-28 04:30:00', 1, 'System crash issue', 'Open', 'High', '2025-05-28 10:30:00', NULL, NULL, 'User reported system crash'),
(6, 2, 2, '2025-05-27 08:30:00', 2, 'Login issue', 'In Progress', 'Medium', '2025-05-27 14:15:00', '2025-05-27 15:00:00', '1 hour', 'User unable to login'),
(7, 1, 3, '2025-05-26 03:30:00', 3, 'Network issue', 'Closed', 'Low', '2025-05-26 09:30:00', '2025-05-26 10:00:00', '30 minutes', 'Network connectivity restored'),
(18, 1, 1, '2025-05-29 03:57:01', 1, 'Login not working', 'Open', 'High', '2025-05-29 10:00:00', NULL, NULL, 'Please check ASAP'),
(19, 2, 2, '2025-05-28 03:57:01', 2, 'Printer offline', 'In Progress', 'Medium', '2025-05-28 09:45:00', '2025-05-28 10:30:00', '0d 0h 45m', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticketcategory`
--

DROP TABLE IF EXISTS `ticketcategory`;
CREATE TABLE IF NOT EXISTS `ticketcategory` (
  `TicketCategoryID` int NOT NULL AUTO_INCREMENT,
  `Description` varchar(45) DEFAULT NULL,
  `CategoryName` varchar(255) NOT NULL,
  PRIMARY KEY (`TicketCategoryID`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketcategory`
--

INSERT INTO `ticketcategory` (`TicketCategoryID`, `Description`, `CategoryName`) VALUES
(1, 'Software Issue', 'Application Bug'),
(2, 'Login Problem', 'Printer Issue'),
(3, 'Network Trouble', ''),
(4, 'Software Issue', ''),
(5, 'Hardware Failure', ''),
(6, 'PLZ ENHANSED SPEED AND  CONNECTIVITY CHECK', 'SPPED APPLICATION');

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
  PRIMARY KEY (`TicketChatID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketchat`
--

INSERT INTO `ticketchat` (`TicketChatID`, `TicketID`, `Type`, `Note`, `UserCustomerID`, `UserID`, `Path`) VALUES
(1, 1, 'Text', 'Investigating the issue', 'abc_user1', 1, ''),
(2, 2, 'File', 'Attached log file', 'xyz_user2', 2, 'uploads/log.txt'),
(3, 3, 'Text', 'Issue resolved', 'abc_user1', 1, ''),
(4, 1, 'Message', 'Investigating issue', 'U1001', 1, NULL),
(5, 2, 'File', 'Attached log file', 'U1002', 2, '/uploads/log.txt');

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
  PRIMARY KEY (`TicketLogID`),
  KEY `TicketID` (`TicketID`),
  KEY `UserID` (`UserID`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketlog`
--

INSERT INTO `ticketlog` (`TicketLogID`, `TicketID`, `DateTime`, `Type`, `Description`, `Note`, `UserID`) VALUES
(1, 1, '2025-05-28 10:30:00', 'Response', 'Agent responded to issue', 'Investigating', 2),
(2, 2, '2025-05-27 14:20:00', 'Update', 'Asked for user credentials', 'Requested more info', 2),
(3, 3, '2025-05-26 10:00:00', 'Close', 'Issue resolved', 'Confirmed by user', 2),
(4, 1, '2025-05-29 10:00:00', 'Response', 'Checked login error', 'No bug found yet', 1),
(5, 2, '2025-05-28 10:30:00', 'Update', 'Printer connected', 'Issue might be resolved', 2);

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
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `userid`
--

INSERT INTO `userid` (`UserId`, `UserName`, `Email`, `ContactNo`, `ClientID`, `Branch`) VALUES
(1, 'abc_user1', 'abc1@abc.com', '0701111111', 1, 'Colombo'),
(2, 'xyz_user2', 'xyz2@xyz.com', '0702222222', 2, 'Galle'),
(3, 'UserA', 'usera@company.com', '0711234567', 1, 'Colombo'),
(4, 'UserB', 'userb@company.com', '0722345678', 2, 'Kandy');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
