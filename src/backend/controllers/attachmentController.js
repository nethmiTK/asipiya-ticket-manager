// controllers/attachmentController.js

import db from '../config/db.js';
import { createTicketLog, createNotification } from '../utils/notificationUtils.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads', 'attachments');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Add attachment with file upload
export const uploadAttachment = async (req, res) => {
  const { ticketId } = req.params;
  const { userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Get user details
  const getUserQuery = `
    SELECT 
      au.FullName as uploaderName,
      t.UserId as ticketUserId,
      t.SupervisorID
    FROM appuser au
    LEFT JOIN ticket t ON t.TicketID = ?
    WHERE au.UserID = ?
  `;

  try {
    const [userResults] = await new Promise((resolve, reject) => {
      db.query(getUserQuery, [ticketId, userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!userResults) {
      return res.status(404).json({ message: "User or ticket not found" });
    }

    const uploaderName = userResults.uploaderName;
    const filePath = file.path;
    const fileName = file.originalname;
    const fileSize = file.size;
    const fileType = file.mimetype;

    const description = `uploaded file "${fileName}"`;
    const fileDetails = JSON.stringify({
      name: fileName,
      size: fileSize,
      type: fileType,
      path: filePath
    });

    const [logResult] = await createTicketLog(
      ticketId,
      'ATTACHMENT',
      description,
      userId,
      null,
      fileDetails,
      `File size: ${Math.round(fileSize / 1024)}KB`
    );

    // Update LastRespondedTime
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE ticket SET LastRespondedTime = NOW() WHERE TicketID = ?",
        [ticketId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // Create notifications
    try {
      // Notify ticket creator if attachment is from someone else
      if (userId !== userResults.ticketUserId) {
        await createNotification(
          userResults.ticketUserId,
          `New file "${fileName}" attached to ticket #${ticketId} by ${uploaderName}`,
          'NEW_ATTACHMENT',
          logResult.insertId
        );
      }

      // Notify supervisor if exists and attachment is from ticket creator
      if (userResults.SupervisorID && userId === userResults.ticketUserId) {
        await createNotification(
          userResults.SupervisorID,
          `Ticket creator attached a file "${fileName}" to ticket #${ticketId}`,
          'CREATOR_ATTACHMENT',
          logResult.insertId
        );
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
    }

    res.json({
      message: "File uploaded successfully",
      file: {
        name: fileName,
        path: filePath,
        size: fileSize,
        type: fileType
      },
      logId: logResult.insertId
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add attachment without file upload (for URL-based attachments)
export const addAttachment = async (req, res) => {
  const { ticketId } = req.params;
  const { fileName, fileUrl, userId } = req.body;

  try {
    // Create log entry for the attachment
    const logResult = await createTicketLog(
      ticketId,
      'ATTACHMENT',
      `added an attachment: ${fileName}`,
      userId,
      null,
      fileUrl
    );

    // Get ticket creator ID for notification
    const getTicket = "SELECT UserId as ticketUserId FROM ticket WHERE TicketID = ?";
    const [ticketResult] = await new Promise((resolve, reject) => {
      db.query(getTicket, [ticketId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (ticketResult) {
      try {
        await createNotification(
          ticketResult.ticketUserId,
          `New attachment added to your ticket #${ticketId}`,
          'NEW_ATTACHMENT',
          logResult.insertId
        );
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    }

    res.json({ message: "Attachment added successfully" });
  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
