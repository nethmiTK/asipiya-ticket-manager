// routes/commentAttachmentRoutes.js

import express from 'express';
import { 
  uploadCommentAttachment, 
  getCommentAttachments, 
  deleteCommentAttachment, 
  commentAttachmentUpload 
} from '../controllers/commentAttachmentController.js';

const router = express.Router();

// Upload comment attachment
router.post('/comments/attachments/upload', commentAttachmentUpload.single('file'), uploadCommentAttachment);

// Get comment attachments by comment ID
router.get('/comments/:commentId/attachments', getCommentAttachments);

// Delete comment attachment
router.delete('/comments/attachments/:attachmentId', deleteCommentAttachment);

export default router;
