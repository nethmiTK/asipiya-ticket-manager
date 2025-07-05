import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { uploadProfileImage, removeProfileImage } from '../controllers/profileImageController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer configuration
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads', 'profile_images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.params.id;
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${userId}-${Date.now()}.${fileExtension}`);
  }
});

const upload = multer({ storage: profileImageStorage });

router.post('/upload/:id', upload.single('profileImage'), uploadProfileImage);
router.delete('/image/:id', removeProfileImage);

export default router;