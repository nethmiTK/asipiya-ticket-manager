import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getMessages, postMessage, postUserMessage, getUserMessages, downloadFile, markMessagesAsSeen } from '../controllers/chatController.js';

const router = express.Router();

// --- Multer Configuration for Chat File Uploads ---
const chatUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('src/backend/uploads', 'profile_images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: chatUploadStorage });

// --- Chat Routes ---
const passIO = (handler) => (req, res) => handler(req, res, req.io);

router.get("/messages/:ticketId", getMessages);
router.post("/ticketchat", upload.single("file"), passIO(postMessage));
router.post("/ticketchatUser", upload.single("file"), passIO(postUserMessage));
router.get("/ticketchatUser/:ticketID", getUserMessages);
router.get("/download/:filename", downloadFile);
router.post("/ticketchat/markSeen", passIO(markMessagesAsSeen));

export default router;