// routes/evidenceRoutes.js
import express from 'express';
import {
  getAllEvidenceByTicketId,
  getEvidencePathsByTicketId
} from '../controllers/evidenceController.js';

const router = express.Router();

// GET full evidence info
router.get('/evidence/:ticketId', getAllEvidenceByTicketId);

// GET only FilePath
router.get('/evidence-paths/:ticketId', getEvidencePathsByTicketId);

export default router;
