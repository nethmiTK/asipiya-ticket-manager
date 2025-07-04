import db from '../config/db.js';

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
