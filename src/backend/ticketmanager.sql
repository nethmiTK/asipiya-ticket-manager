-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 05, 2025 at 02:43 AM
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
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `SystemName` varchar(255) NOT NULL,
  `Description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`AsipiyaSystemID`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `CompanyName` varchar(45) DEFAULT NULL,
  `ContactNo` varchar(45) DEFAULT NULL,
  `ContactPerson` varchar(45) DEFAULT NULL,
  `MobileNo` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ClientID`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `client`
--
 
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
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `evidence`
--

 

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
) ENGINE=MyISAM AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticket`
--
 

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
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketcategory`
--

 

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
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticketlog`
--
 

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
  `IsRead` boolean DEFAULT FALSE,
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `TicketLogID` int DEFAULT NULL,
  PRIMARY KEY (`NotificationID`),
  KEY `UserID` (`UserID`),
  KEY `TicketLogID` (`TicketLogID`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
 

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
