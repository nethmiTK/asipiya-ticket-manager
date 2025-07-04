// routes/profileRoutes.js

import express from 'express';
import { uploadProfileImage, deleteProfileImage, profileImageUpload } from '../controllers/profileController.js';

const router = express.Router();

// Upload profile image
router.post('/user/profile/upload/:id', profileImageUpload.single('profileImage'), uploadProfileImage);

// Delete profile image
router.delete('/user/profile/image/:id', deleteProfileImage);

export default router;
