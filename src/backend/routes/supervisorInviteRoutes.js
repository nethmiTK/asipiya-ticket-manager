import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { inviteSupervisor, uploadEvidence } from '../controllers/supervisorInviteController.js';

const router = express.Router();

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for evidence uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
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

// Invite supervisor endpoint
router.post('/invite-supervisor', inviteSupervisor);

// Upload evidence files
router.post('/upload_evidence', upload_evidence.array('evidenceFiles'), uploadEvidence);

export default router;
