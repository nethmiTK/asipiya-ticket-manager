// routes/attachmentRoutes.js

import express from 'express';
import { uploadAttachment, addAttachment, attachmentUpload } from '../controllers/attachmentController.js';

const router = express.Router();

// Upload attachment with file
router.post('/tickets/:ticketId/attachments/upload', attachmentUpload.single('file'), uploadAttachment);

// Add attachment without file (URL-based)
router.post('/tickets/:ticketId/attachments', addAttachment);

export default router;
