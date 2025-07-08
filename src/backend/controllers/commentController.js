import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createNotification, createTicketLog } from '../utils/notificationUtils.js';

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Multer Configuration for Comment Attachments ---
const commentAttachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'comment_attachments');
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

// Get all comments for a ticket
export const getTicketComments = async (req, res) => {
  const { ticketId } = req.params;
  const { userId } = req.query; // Get userId from query parameters

  try {
    // First get all comments for the ticket
    const commentsQuery = `
      SELECT 
        c.CommentID, 
        c.CommentText, 
        c.CreatedAt, 
        c.Mentions, 
        c.ReplyToCommentID, 
        u.FullName,
        u.ProfileImagePath, 
        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.CommentID = c.CommentID) as LikesCount, 
        ${userId ? `(SELECT COUNT(*) FROM comment_likes cl WHERE cl.CommentID = c.CommentID AND cl.UserID = ${db.escape(userId)})` : '0'} as UserHasLiked, 
        ru.FullName as RepliedToUserName 
      FROM comments c
      JOIN appuser u ON c.UserID = u.UserID
      LEFT JOIN comments rc ON c.ReplyToCommentID = rc.CommentID 
      LEFT JOIN appuser ru ON rc.UserID = ru.UserID 
      WHERE c.TicketID = ?
      ORDER BY c.CreatedAt ASC
    `;

    const [comments] = await db.promise().query(commentsQuery, [ticketId]);

    // Get all attachments for these comments
    const commentIds = comments.map(c => c.CommentID);
    let attachments = [];

    if (commentIds.length > 0) {
      const attachmentsQuery = `
        SELECT 
          CommentID,
          FilePath as AttachmentFilePath,
          FileName as AttachmentFileName,
          FileType as AttachmentFileType
        FROM comment_attachments 
        WHERE CommentID IN (${commentIds.map(() => '?').join(',')})
      `;

      const [attachmentResults] = await db.promise().query(attachmentsQuery, commentIds);
      attachments = attachmentResults;
    }

    // Group attachments by comment ID and add them to comments
    const commentsWithAttachments = comments.map(comment => {
      const commentAttachments = attachments.filter(att => att.CommentID === comment.CommentID);

      // For backward compatibility, if there's an attachment, add the first one as single properties
      let formattedComment = { ...comment };
      if (commentAttachments.length > 0) {
        const firstAttachment = commentAttachments[0];
        formattedComment.AttachmentFilePath = firstAttachment.AttachmentFilePath;
        formattedComment.AttachmentFileName = firstAttachment.AttachmentFileName;
        formattedComment.AttachmentFileType = firstAttachment.AttachmentFileType;
        formattedComment.AttachmentFullUrl = `http://localhost:5000/${firstAttachment.AttachmentFilePath.replace(/\\/g, '/')}`;
      }

      // Add all attachments as an array for complete access
      formattedComment.attachments = commentAttachments.map(att => ({
        filePath: att.AttachmentFilePath,
        fileName: att.AttachmentFileName,
        fileType: att.AttachmentFileType,
        fullUrl: `http://localhost:5000/${att.AttachmentFilePath.replace(/\\/g, '/')}`
      }));

      return formattedComment;
    });

    res.json(commentsWithAttachments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Get mentionable users for a ticket
export const getMentionableUsers = (req, res) => {
  const { ticketId } = req.query;

  if (!ticketId) {
    return res.status(400).json({ error: 'Ticket ID is required' });
  }

  // Query to get all admins and the supervisor(s) assigned to the specific ticket
  const sql = `
    SELECT DISTINCT u.UserID, u.FullName, u.Role, u.ProfileImagePath 
    FROM appuser u
    WHERE u.Role = 'Admin'
    
    UNION
    
    SELECT DISTINCT u.UserID, u.FullName, u.Role, u.ProfileImagePath 
    FROM appuser u
    INNER JOIN ticket t ON FIND_IN_SET(u.UserID, t.SupervisorID) > 0
    WHERE t.TicketID = ? AND u.Role = 'Supervisor'
    
    ORDER BY Role DESC, FullName ASC
  `;

  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error('Error fetching mentionable users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
};

// Like a comment
export const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const sql = 'INSERT IGNORE INTO comment_likes (CommentID, UserID) VALUES (?, ?)'; // IGNORE prevents duplicate likes
    const [result] = await db.promise().query(sql, [commentId, userId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Comment liked successfully.' });
    } else {
      res.status(200).json({ message: 'Comment already liked by this user.' });
    }
  } catch (err) {
    console.error('Error liking comment:', err);
    res.status(500).json({ message: 'Failed to like comment.', error: err.message });
  }
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body; // userId sent in body for DELETE

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const sql = 'DELETE FROM comment_likes WHERE CommentID = ? AND UserID = ?';
    const [result] = await db.promise().query(sql, [commentId, userId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Comment unliked successfully.' });
    } else {
      res.status(404).json({ message: 'Like not found for this comment and user.' });
    }
  } catch (err) {
    console.error('Error unliking comment:', err);
    res.status(500).json({ message: 'Failed to unlike comment.', error: err.message });
  }
};

// Check if a user has liked a comment
export const hasUserLikedComment = async (req, res) => {
  const { commentId, userId } = req.params;

  try {
    const sql = 'SELECT COUNT(*) as count FROM comment_likes WHERE CommentID = ? AND UserID = ?';
    const [rows] = await db.promise().query(sql, [commentId, userId]);
    const hasLiked = rows[0].count > 0;
    res.status(200).json({ hasLiked });
  } catch (err) {
    console.error('Error checking like status:', err);
    res.status(500).json({ message: 'Failed to check like status.', error: err.message });
  }
};

// Add a comment to a ticket
export const addComment = async (req, res) => {
  const { ticketId } = req.params;
  let { userId, comment, mentionedUserIds, replyToCommentId } = req.body; // Added replyToCommentId

  try {
    // Process mentions: Extract mentioned user IDs
    let processedMentions = [];

    if (mentionedUserIds && typeof mentionedUserIds === 'string') {
      const mentionedIds = mentionedUserIds.split(',').map(id => id.trim());
      
      for (const id of mentionedIds) {
        if (id === 'all-admins') {
          // Special case: "All Admins" mention - get all admin user IDs
          try {
            const [adminUsers] = await db.promise().query(
              'SELECT UserID FROM appuser WHERE Role = ?', 
              ['Admin']
            );
            const adminIds = adminUsers.map(admin => admin.UserID);
            processedMentions.push(...adminIds);
            console.log('All Admins mentioned - notifying admin users:', adminIds);
          } catch (adminQueryError) {
            console.error('Error fetching admin users for "All Admins" mention:', adminQueryError);
          }
        } else {
          // Regular user mention
          const numericId = parseInt(id);
          if (!isNaN(numericId)) {
            processedMentions.push(numericId);
          }
        }
      }
      
      // Remove duplicates
      processedMentions = [...new Set(processedMentions)];
    }

    // IMPORTANT: Storing the original comment text (including @mentions) in CommentText for display.
    // The mentioned user IDs are still separately stored in the Mentions column.

    const sql = `
      INSERT INTO comments (TicketID, UserID, CommentText, Mentions, ReplyToCommentID)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await db.promise().query(sql, [
      ticketId,
      userId,
      comment.trim(), // Store original comment text
      processedMentions.length > 0 ? processedMentions.join(',') : null, // Store only user IDs
      replyToCommentId || null
    ]);

    const newCommentId = result[0].insertId;

    // Handle multiple file attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const attachmentFilePath = path.join('uploads', 'comment_attachments', file.filename).replace(/\\/g, '/');
        const attachmentFileName = file.originalname;
        const attachmentFileType = file.mimetype;

        const attachmentSql = `
          INSERT INTO comment_attachments (CommentID, FilePath, FileName, FileType)
          VALUES (?, ?, ?, ?)
        `;
        await db.promise().query(attachmentSql, [
          newCommentId,
          attachmentFilePath,
          attachmentFileName,
          attachmentFileType
        ]);
      }
    }

    // IMPORTANT: Log and notify asynchronously after sending success response
    // This ensures the frontend gets a success message even if logging/notifications fail.
    // Errors in this section will be logged on the server but won't block the frontend response.
    res.status(201).json({
      message: 'Comment added successfully',
      commentId: newCommentId
    });

    // Perform logging and notifications AFTER sending the response
    try {
      // Add to ticketlog
      const logSql = `
        INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID) 
        VALUES (?, NOW(), 'COMMENT', ?, ?)
      `;
      // Fetch user's name for the log description
      const [userResult] = await db.promise().query('SELECT FullName FROM appuser WHERE UserID = ?', [userId]);
      const userName = userResult.length > 0 ? userResult[0].FullName : 'Unknown User';

      const logDescription = `added a comment: "${comment.substring(0, 100)}..."`; // Use original comment for log description
      await createTicketLog(ticketId, 'COMMENT', logDescription, userId, null, null, null); // Use createTicketLog

      // Notify mentioned users
      if (processedMentions.length > 0) {
        const wasAllAdminsMentioned = mentionedUserIds && mentionedUserIds.includes('all-admins');
        
        for (const mentionedUserId of processedMentions) {
          // Exclude the user who made the comment from receiving a mention notification for their own comment
          if (mentionedUserId !== parseInt(userId)) { // Ensure userId is compared as a number
            const notificationMessage = wasAllAdminsMentioned && mentionedUserId !== parseInt(userId) 
              ? `All Admins were mentioned in a comment on ticket #${ticketId} by ${userName}`
              : `You were mentioned in a comment on ticket #${ticketId} by ${userName}`;
              
            await createNotification(
              mentionedUserId,
              notificationMessage,
              'MENTION',
              newCommentId // Link notification to the new comment
            );
          }
        }
      }
    } catch (logOrNotifyError) {
      console.error('Error during post-comment logging or notification:', logOrNotifyError);
      // Do not send an error response to frontend here, as the comment itself was saved.
    }

  } catch (err) {
    console.error('Error adding comment (main flow):', err);
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};
