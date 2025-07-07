// routes/evidenceRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getAllEvidenceByTicketId,
  getEvidencePathsByTicketId,
  uploadEvidence,
  downloadEvidence
} from '../controllers/evidenceController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/backend/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload_evidence = multer({ storage: storage });

// GET full evidence info
router.get('/evidence/:ticketId', getAllEvidenceByTicketId);

// GET only FilePath
router.get('/evidence-paths/:ticketId', getEvidencePathsByTicketId);

// POST upload evidence files (API route)
router.post('/upload_evidence', upload_evidence.array('evidenceFiles'), uploadEvidence);

// GET download evidence file
router.get('/download_evidence/:filename', downloadEvidence);

export default router;
