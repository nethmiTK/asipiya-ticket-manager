 -- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 25, 2025 at 03:32 PM
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
-- Database: `ticketmanager`
--

-- --------------------------------------------------------

--
-- Table structure for table `appuser`
--

CREATE TABLE `appuser` (
  `UserId` int(11) NOT NULL,
  `FullName` varchar(45) DEFAULT NULL,
  `Email` varchar(45) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `Role` varchar(45) DEFAULT NULL,
  `Phone` varchar(45) DEFAULT NULL,
  `ProfileImagePath` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appuser`
--

INSERT INTO `appuser` (`UserId`, `FullName`, `Email`, `password`, `Role`, `Phone`, `ProfileImagePath`) VALUES
(26, 'Gunathilaka', 'gunathilaka@gmail.com', '$2b$10$UA/k02LBELO47/r3igJB4uLJeubKkdDgkPT1mw8inrdGyni23yTi2', 'User', '0785432123', NULL),
(27, 'Kamal', 'kamal@gmail.com', '$2b$10$wW5UqcPMt5ZDEpPOFqYN5eEzuGj6LzKoSKHjVMNuKR.YVh3f2AUVK', 'User', '0760543267', NULL),
(28, 'Sunil', 'sunil@gmail.com', '$2b$10$EloQPSrQz69dm8GPTOKWruvxnjJ7hq9uOQA5oF0EDjYarmJeyrBIm', 'User', '0765234325', NULL),
(29, 'Ravindu SK', 'ravindu@gmail.com', '$2b$10$12sHAPpoZmPuuWctlnIQHu2xq.68qNK7EoajeKqcU2EOCrNEF83N.', 'Admin', '0785437654', NULL),
(30, 'Saman Edirimuni', 'samanedirimuni@gmai.com', '$2b$10$gjsHTd9N5VPM7RCMQW8N4ui4fZjGobJUfXBkoYbFgM1unFbtBat.u', 'Supervisor', '0769543565', NULL),
(31, 'Anuhas', 'anuhas@gmail.com', '$2b$10$otgl/RGQlLcsg.WZofD3M.kfbWtKmdy0wIsntIKuir9/NG1i0G/ru', 'Supervisor', '0770945367', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `asipiyasystem`
--

CREATE TABLE `asipiyasystem` (
  `AsipiyaSystemID` int(11) NOT NULL,
  `SystemName` varchar(255) NOT NULL,
  `Description` varchar(45) DEFAULT NULL,
  `Status` tinyint(1) DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `asipiyasystem`
--

INSERT INTO `asipiyasystem` (`AsipiyaSystemID`, `SystemName`, `Description`, `Status`) VALUES
(10, 'Asipiya ERP', 'Asipiya Business Management System centralize', 1),
(9, 'Asipiya Leasing App', 'Asipiya Leasing System offers a simplified, s', 1),
(8, 'Asipiya Pawning', 'Asipiya Pawning System boosts efficiency with', 1),
(7, 'Microfinance Solution', 'Asipiya Microfinance System offers seamless m', 1);

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `ClientID` int(11) NOT NULL,
  `CompanyName` varchar(45) DEFAULT NULL,
  `ContactNo` varchar(45) DEFAULT NULL,
  `ContactPersonEmail` varchar(45) DEFAULT NULL,
  `MobileNo` varchar(45) DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `CommentID` int(11) NOT NULL,
  `TicketID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `CommentText` text NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT current_timestamp(),
  `Mentions` text DEFAULT NULL,
  `ReplyToCommentID` int(11) DEFAULT NULL,
  `AttachmentFilePath` varchar(255) DEFAULT NULL,
  `AttachmentFileName` varchar(255) DEFAULT NULL,
  `AttachmentFileType` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comment_likes`
--

CREATE TABLE `comment_likes` (
  `LikeID` int(11) NOT NULL,
  `CommentID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evidence`
--

CREATE TABLE `evidence` (
  `EvidenceID` int(11) NOT NULL,
  `Description` text DEFAULT NULL,
  `FilePath` varchar(255) DEFAULT NULL,
  `ComplaintID` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evidence`
--

INSERT INTO `evidence` (`EvidenceID`, `Description`, `FilePath`, `ComplaintID`) VALUES
(62, 'Provides assistance with system-related issues encountered while using the Asipiya Microfinance Solution. This includes troubleshooting errors, resolving functionality problems, and offering guidance on using features related to pawning, leasing, transactions, reporting, and account management. The goal is to ensure smooth and uninterrupted operation for users and staff.', 'uploads/evidenceFiles-1750664585429-958304163.png', 90),
(63, 'test kamal', 'uploads/evidenceFiles-1750849961574-131425472.png', 93),
(64, 'rkakndnn', 'uploads/evidenceFiles-1750851668833-30633680.png', 94);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `NotificationID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Message` text NOT NULL,
  `Type` varchar(50) NOT NULL,
  `IsRead` tinyint(1) DEFAULT 0,
  `CreatedAt` timestamp NULL DEFAULT current_timestamp(),
  `TicketLogID` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`NotificationID`, `UserID`, `Message`, `Type`, `IsRead`, `CreatedAt`, `TicketLogID`) VALUES
(165, 29, 'New ticket created by User #27: rkakndnn...', 'NEW_TICKET', 0, '2025-06-25 11:41:08', NULL),
(164, 30, 'You have been assigned to ticket #93. Status: In Progress, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 11:14:10', NULL),
(163, 30, 'Ticket #93 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 11:14:10', 90),
(162, 27, 'Your ticket #93 status has been changed from Pending to In Progress.', 'STATUS_UPDATE', 0, '2025-06-25 11:14:10', 90),
(161, 27, 'The supervisor for your ticket #93 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 11:14:10', 89),
(160, 29, 'New ticket created by User #27: test kamal...', 'NEW_TICKET', 0, '2025-06-25 11:12:41', NULL),
(159, 30, 'You have been assigned to ticket #92. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 07:06:13', NULL),
(158, 30, 'Ticket #92 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 07:06:13', 88),
(157, 26, 'Your ticket #92 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 07:06:13', 88),
(156, 26, 'The supervisor for your ticket #92 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 07:06:13', 87),
(155, 29, 'New ticket created by User #26: test1232...', 'NEW_TICKET', 0, '2025-06-25 07:04:09', NULL),
(154, 31, 'You have been assigned to ticket #91. Status: Open, Priority: Medium.', 'SUPERVISOR_ASSIGNED', 0, '2025-06-25 05:41:44', NULL),
(153, 31, 'Ticket #91 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 05:41:44', 86),
(152, 26, 'Your ticket #91 status has been changed from Pending to Open.', 'STATUS_UPDATE', 0, '2025-06-25 05:41:44', 86),
(151, 26, 'The supervisor for your ticket #91 has changed from unassigned to Unknown Supervisor.', 'SUPERVISOR_UPDATED', 0, '2025-06-25 05:41:44', 85),
(150, 29, 'New ticket created by User #26: testfff...', 'NEW_TICKET', 0, '2025-06-25 05:37:58', NULL),
(149, 29, 'New ticket created by User #26: Provides assistance with system-related issues enc...', 'NEW_TICKET', 0, '2025-06-23 07:43:05', NULL),
(148, 29, 'New ticket created by User #26: Test1...', 'NEW_TICKET', 0, '2025-06-23 07:32:41', NULL),
(147, 31, 'New ticket category added: Leasing System Issues', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:31:47', NULL),
(146, 30, 'New ticket category added: Leasing System Issues', 'NEW_CATEGORY_ADDED', 1, '2025-06-23 07:31:47', NULL),
(145, 29, 'New ticket category added: Leasing System Issues', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:31:47', NULL),
(144, 31, 'New ticket category added: Pawning System Issues', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:31:25', NULL),
(143, 30, 'New ticket category added: Pawning System Issues', 'NEW_CATEGORY_ADDED', 1, '2025-06-23 07:31:25', NULL),
(142, 29, 'New ticket category added: Pawning System Issues', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:31:25', NULL),
(141, 31, 'New ticket category added: Software Issues', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:31:04', NULL),
(140, 30, 'New ticket category added: Software Issues', 'NEW_CATEGORY_ADDED', 1, '2025-06-23 07:31:04', NULL),
(139, 29, 'New ticket category added: Software Issues', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:31:04', NULL),
(138, 31, 'New ticket category added: Technical Support', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:30:44', NULL),
(137, 30, 'New ticket category added: Technical Support', 'NEW_CATEGORY_ADDED', 1, '2025-06-23 07:30:44', NULL),
(135, 31, 'New system added: Asipiya ERP', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:23:03', NULL),
(136, 29, 'New ticket category added: Technical Support', 'NEW_CATEGORY_ADDED', 0, '2025-06-23 07:30:44', NULL),
(134, 30, 'New system added: Asipiya ERP', 'NEW_SYSTEM_ADDED', 1, '2025-06-23 07:23:03', NULL),
(133, 29, 'New system added: Asipiya ERP', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:23:03', NULL),
(132, 31, 'New system added: Asipiya Leasing App', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:22:00', NULL),
(131, 30, 'New system added: Asipiya Leasing App', 'NEW_SYSTEM_ADDED', 1, '2025-06-23 07:22:00', NULL),
(130, 29, 'New system added: Asipiya Leasing App', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:22:00', NULL),
(129, 31, 'New system added: Asipiya Pawning', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:21:03', NULL),
(128, 30, 'New system added: Asipiya Pawning', 'NEW_SYSTEM_ADDED', 1, '2025-06-23 07:21:03', NULL),
(127, 29, 'New system added: Asipiya Pawning', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:21:03', NULL),
(126, 31, 'New system added: Microfinance Solution', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:18:28', NULL),
(125, 30, 'New system added: Microfinance Solution', 'NEW_SYSTEM_ADDED', 1, '2025-06-23 07:18:28', NULL),
(124, 29, 'New system added: Microfinance Solution', 'NEW_SYSTEM_ADDED', 0, '2025-06-23 07:18:28', NULL),
(123, 29, 'New User registered: Anuhas (anuhas@gmail.com)', 'NEW_USER_REGISTRATION', 1, '2025-06-23 07:05:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `TicketID` int(11) NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  `AsipiyaSystemID` int(11) DEFAULT NULL,
  `DateTime` timestamp NOT NULL DEFAULT current_timestamp(),
  `TicketCategoryID` int(11) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `Status` varchar(45) DEFAULT NULL,
  `Priority` varchar(45) DEFAULT NULL,
  `FirstRespondedTime` varchar(45) DEFAULT NULL,
  `LastRespondedTime` varchar(45) DEFAULT NULL,
  `TicketDuration` varchar(45) DEFAULT NULL,
  `UserNote` text DEFAULT NULL,
  `SupervisorID` text DEFAULT NULL,
  `DueDate` timestamp NULL DEFAULT NULL,
  `Resolution` varchar(255) DEFAULT NULL,
  `Reason` text DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`TicketID`, `UserId`, `AsipiyaSystemID`, `DateTime`, `TicketCategoryID`, `Description`, `Status`, `Priority`, `FirstRespondedTime`, `LastRespondedTime`, `TicketDuration`, `UserNote`, `SupervisorID`, `DueDate`, `Resolution`, `Reason`) VALUES
(90, 26, 7, '2025-06-23 07:43:05', 8, 'Provides assistance with system-related issues encountered while using the Asipiya Microfinance Solution. This includes troubleshooting errors, resolving functionality problems, and offering guidance on using features related to pawning, leasing, transactions, reporting, and account management. The goal is to ensure smooth and uninterrupted operation for users and staff.', 'In Progress', 'High', '2025-06-23 13:15:14', '2025-06-23 13:15:14', NULL, NULL, '30', NULL, NULL, NULL),
(91, 26, 7, '2025-06-25 05:37:58', 9, 'testfff', 'Open', 'Medium', '2025-06-25 11:11:44', '2025-06-25 11:11:44', NULL, NULL, '31', NULL, NULL, NULL),
(92, 26, 7, '2025-06-25 07:04:09', 8, 'test1232', 'Open', 'Medium', '2025-06-25 12:36:13', '2025-06-25 12:36:13', NULL, NULL, '30', NULL, NULL, NULL),
(93, 27, 8, '2025-06-25 11:12:41', 8, 'test kamal', 'In Progress', 'Medium', '2025-06-25 16:44:10', '2025-06-25 16:44:10', NULL, NULL, '30', NULL, NULL, NULL),
(94, 27, 9, '2025-06-25 11:41:08', 9, 'rkakndnn', 'Pending', 'Medium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticketcategory`
--

CREATE TABLE `ticketcategory` (
  `TicketCategoryID` int(11) NOT NULL,
  `CategoryName` varchar(255) DEFAULT NULL,
  `Description` varchar(45) DEFAULT NULL,
  `Status` tinyint(1) DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketcategory`
--

INSERT INTO `ticketcategory` (`TicketCategoryID`, `CategoryName`, `Description`, `Status`) VALUES
(10, 'Pawning System Issues', 'Errors or questions regarding pawning feature', 1),
(8, 'Technical Support', 'Assistance with general technical problems or', 1),
(9, 'Software Issues', 'Problems related to software features or func', 1),
(11, 'Leasing System Issues', 'Support for leasing process and contract mana', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ticketchat`
--

CREATE TABLE `ticketchat` (
  `TicketChatID` int(11) NOT NULL,
  `TicketID` int(11) DEFAULT NULL,
  `Type` varchar(45) DEFAULT NULL,
  `Note` varchar(255) DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  `Path` text DEFAULT NULL,
  `Role` varchar(50) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketchat`
--

INSERT INTO `ticketchat` (`TicketChatID`, `TicketID`, `Type`, `Note`, `UserID`, `Path`, `Role`, `CreatedAt`) VALUES
(423, 90, 'text', 'Hi, I’m facing an issue when trying to generate the transaction report for pawning accounts. It shows a “Data fetch failed” error. Can you help?', 26, NULL, 'User', '2025-06-23 11:44:03'),
(424, 90, 'text', 'Hi! Sure, I’ll help you with that. Could you please tell me which branch and date range you\'re using when this error appears?', 30, NULL, 'Supervisor', '2025-06-23 11:44:28'),
(425, 90, 'text', 'I’m from the Galle branch. I selected the date range from June 1st to June 20th.', 26, NULL, 'User', '2025-06-23 11:44:57'),
(426, 90, 'text', 'Thanks for the details. I just checked - this seems to be related to a timeout in the reporting module. Can you try generating the report in a smaller date range first, like 5 days?', 30, NULL, 'Supervisor', '2025-06-23 11:45:39'),
(427, 90, 'text', 'Okay, I tried June 1st to June 5th and it worked fine. So it’s a range issue?', 26, NULL, 'User', '2025-06-23 11:46:20'),
(428, 90, 'text', 'Yes, exactly. We’ve noticed some lag in the system when processing larger date ranges with high transaction volume. We\'re already working on optimizing it. For now, breaking it into smaller chunks will help. Also, I’ll log this for a permanent fix.', 30, NULL, 'Supervisor', '2025-06-23 11:46:55'),
(429, 90, 'text', 'Understood. Thanks for the quick support! Please keep me updated if there’s a system update.', 26, NULL, 'User', '2025-06-23 11:47:21'),
(430, 90, 'text', 'Definitely. I’ll notify all branch users once the fix is deployed. Let me know if you need help with anything else.', 30, NULL, 'Supervisor', '2025-06-23 11:48:03'),
(630, 92, 'text', 'halloo', 26, NULL, 'User', '2025-06-25 13:26:46'),
(629, 92, 'text', 'hii', 26, NULL, 'User', '2025-06-25 13:26:08'),
(627, 92, 'text', 'hii', 30, NULL, 'Supervisor', '2025-06-25 13:21:04'),
(628, 92, 'text', 'hii', 30, NULL, 'Supervisor', '2025-06-25 13:26:06'),
(626, 92, 'file', 'issue-tracking.png', 26, 'undefined-1750852734263.png', 'User', '2025-06-25 11:58:54'),
(625, 92, 'text', 'hii', 26, NULL, 'User', '2025-06-25 11:58:37');

-- --------------------------------------------------------

--
-- Table structure for table `ticketlog`
--

CREATE TABLE `ticketlog` (
  `TicketLogID` int(11) NOT NULL,
  `TicketID` int(11) DEFAULT NULL,
  `DateTime` varchar(45) DEFAULT NULL,
  `Type` varchar(45) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `Note` text DEFAULT NULL,
  `UserID` int(11) DEFAULT NULL,
  `OldValue` varchar(255) DEFAULT NULL,
  `NewValue` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticketlog`
--

INSERT INTO `ticketlog` (`TicketLogID`, `TicketID`, `DateTime`, `Type`, `Description`, `Note`, `UserID`, `OldValue`, `NewValue`) VALUES
(85, 91, '2025-06-25 11:11:44', 'SUPERVISOR_CHANGE', 'Ravindu SK (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 29, NULL, '31'),
(86, 91, '2025-06-25 11:11:44', 'STATUS_CHANGE', 'Ravindu SK (Admin) Status changed from Pending to Open', 'Updated by null', 29, 'Pending', 'Open'),
(87, 92, '2025-06-25 12:36:13', 'SUPERVISOR_CHANGE', 'Ravindu SK (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 29, NULL, '30'),
(88, 92, '2025-06-25 12:36:13', 'STATUS_CHANGE', 'Ravindu SK (Admin) Status changed from Pending to Open', 'Updated by null', 29, 'Pending', 'Open'),
(89, 93, '2025-06-25 16:44:10', 'SUPERVISOR_CHANGE', 'Ravindu SK (Admin) Supervisor changed from unassigned to Unknown Supervisor', 'Assigned by null', 29, NULL, '30'),
(90, 93, '2025-06-25 16:44:10', 'STATUS_CHANGE', 'Ravindu SK (Admin) Status changed from Pending to In Progress', 'Updated by null', 29, 'Pending', 'In Progress');

-- --------------------------------------------------------

--
-- Table structure for table `userid`
--

CREATE TABLE `userid` (
  `UserId` int(11) NOT NULL,
  `UserName` varchar(45) DEFAULT NULL,
  `Email` varchar(45) DEFAULT NULL,
  `ContactNo` varchar(45) DEFAULT NULL,
  `ClientID` int(11) DEFAULT NULL,
  `Branch` varchar(45) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appuser`
--
ALTER TABLE `appuser`
  ADD PRIMARY KEY (`UserId`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `asipiyasystem`
--
ALTER TABLE `asipiyasystem`
  ADD PRIMARY KEY (`AsipiyaSystemID`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`ClientID`),
  ADD KEY `fk_user` (`UserID`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`CommentID`),
  ADD KEY `fk_comment_ticket` (`TicketID`),
  ADD KEY `fk_comment_user` (`UserID`),
  ADD KEY `fk_comment_reply` (`ReplyToCommentID`);

--
-- Indexes for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`LikeID`),
  ADD UNIQUE KEY `uq_comment_user_like` (`CommentID`,`UserID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `evidence`
--
ALTER TABLE `evidence`
  ADD PRIMARY KEY (`EvidenceID`),
  ADD KEY `fk_evidence_ticket` (`ComplaintID`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`NotificationID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `TicketLogID` (`TicketLogID`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`TicketID`),
  ADD KEY `UserId` (`UserId`),
  ADD KEY `AsipiyaSystemID` (`AsipiyaSystemID`),
  ADD KEY `TicketCategoryID` (`TicketCategoryID`),
  ADD KEY `fk_supervisor` (`SupervisorID`(250));

--
-- Indexes for table `ticketcategory`
--
ALTER TABLE `ticketcategory`
  ADD PRIMARY KEY (`TicketCategoryID`);

--
-- Indexes for table `ticketchat`
--
ALTER TABLE `ticketchat`
  ADD PRIMARY KEY (`TicketChatID`),
  ADD KEY `TicketID` (`TicketID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `ticketlog`
--
ALTER TABLE `ticketlog`
  ADD PRIMARY KEY (`TicketLogID`),
  ADD KEY `TicketID` (`TicketID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `userid`
--
ALTER TABLE `userid`
  ADD PRIMARY KEY (`UserId`),
  ADD KEY `ClientID` (`ClientID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appuser`
--
ALTER TABLE `appuser`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `asipiyasystem`
--
ALTER TABLE `asipiyasystem`
  MODIFY `AsipiyaSystemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `ClientID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `CommentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `comment_likes`
--
ALTER TABLE `comment_likes`
  MODIFY `LikeID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evidence`
--
ALTER TABLE `evidence`
  MODIFY `EvidenceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `NotificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `TicketID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `ticketcategory`
--
ALTER TABLE `ticketcategory`
  MODIFY `TicketCategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `ticketchat`
--
ALTER TABLE `ticketchat`
  MODIFY `TicketChatID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=631;

--
-- AUTO_INCREMENT for table `ticketlog`
--
ALTER TABLE `ticketlog`
  MODIFY `TicketLogID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `userid`
--
ALTER TABLE `userid`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comment_reply` FOREIGN KEY (`ReplyToCommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE;

--
-- Constraints for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`CommentID`) REFERENCES `comments` (`CommentID`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `appuser` (`UserId`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `appuser` (`UserId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
