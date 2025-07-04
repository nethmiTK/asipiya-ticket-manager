import express from 'express';
import {
  getTicketComments,
  getMentionableUsers,
  likeComment,
  unlikeComment,
  hasUserLikedComment,
  addComment,
  commentAttachmentUpload
} from '../controllers/commentController.js';

const router = express.Router();

// Get all comments for a ticket
router.get('/tickets/:ticketId/comments', getTicketComments);

// Get mentionable users for a ticket
router.get('/mentionable-users', getMentionableUsers);

// Like a comment
router.post('/comments/:commentId/like', likeComment);

// Unlike a comment
router.delete('/comments/:commentId/like', unlikeComment);

// Check if a user has liked a comment
router.get('/comments/:commentId/hasLiked/:userId', hasUserLikedComment);

// Add comment to ticket
router.post('/tickets/:ticketId/comments', commentAttachmentUpload.array('file', 10), addComment);

export default router;
