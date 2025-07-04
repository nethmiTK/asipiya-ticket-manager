// controllers/commentAttachmentController.js

import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for comment attachments
const commentAttachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads', 'comment_attachments');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const commentAttachmentUpload = multer({
  storage: commentAttachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload comment attachment
export const uploadCommentAttachment = async (req, res) => {
  const { ticketId, commentId, userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!ticketId || !commentId || !userId) {
    return res.status(400).json({ message: "TicketId, CommentId, and UserId are required" });
  }

  try {
    const filePath = file.path;
    const fileName = file.originalname;
    const fileSize = file.size;
    const fileType = file.mimetype;

    // Save attachment info to database (you may need to create a comment_attachments table)
    const insertAttachmentQuery = `
      INSERT INTO comment_attachments (TicketID, CommentID, UserID, FileName, FilePath, FileSize, FileType, UploadedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await new Promise((resolve, reject) => {
      db.query(insertAttachmentQuery, [ticketId, commentId, userId, fileName, filePath, fileSize, fileType], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      message: "Comment attachment uploaded successfully",
      attachment: {
        id: result.insertId,
        name: fileName,
        path: filePath,
        size: fileSize,
        type: fileType
      }
    });
  } catch (error) {
    console.error("Error uploading comment attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get comment attachments
export const getCommentAttachments = async (req, res) => {
  const { commentId } = req.params;

  try {
    const query = `
      SELECT 
        AttachmentID as id,
        FileName as name,
        FilePath as path,
        FileSize as size,
        FileType as type,
        UploadedAt as uploadedAt
      FROM comment_attachments 
      WHERE CommentID = ?
      ORDER BY UploadedAt DESC
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [commentId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching comment attachments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete comment attachment
export const deleteCommentAttachment = async (req, res) => {
  const { attachmentId } = req.params;
  const { userId } = req.body;

  try {
    // Get attachment details first
    const getAttachmentQuery = `SELECT FilePath FROM comment_attachments WHERE AttachmentID = ?`;
    
    const [attachment] = await new Promise((resolve, reject) => {
      db.query(getAttachmentQuery, [attachmentId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.FilePath)) {
      fs.unlinkSync(attachment.FilePath);
    }

    // Delete from database
    const deleteQuery = `DELETE FROM comment_attachments WHERE AttachmentID = ?`;
    
    await new Promise((resolve, reject) => {
      db.query(deleteQuery, [attachmentId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    res.json({ message: "Comment attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
