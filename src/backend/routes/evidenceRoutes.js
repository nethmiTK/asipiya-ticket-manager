// routes/evidenceRoutes.js
import express from 'express';
import {
  getAllEvidenceByTicketId,
  getEvidencePathsByTicketId,
  downloadEvidenceFile
} from '../controllers/evidenceController.js';

const router = express.Router();

// GET full evidence info
router.get('/evidence/:ticketId', getAllEvidenceByTicketId);
router.get('/download/:filename', downloadEvidenceFile);
router.get('/evidence-paths/:ticketId', getEvidencePathsByTicketId);

export default router;
