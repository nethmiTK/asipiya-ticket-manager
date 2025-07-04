import express from 'express';
import { getUserProfile } from '../controllers/userProfileController.js';

const router = express.Router();

// Get user profile data
router.get('/api/user-profile/:userId', getUserProfile);

export default router; 