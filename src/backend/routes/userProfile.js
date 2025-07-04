import express from 'express';
import { getUserProfile, getAdminProfile, updateAdminProfile } from '../controllers/userProfileController.js';

const router = express.Router();

// Get user profile data
router.get('/api/user-profile/:userId', getUserProfile);

// Get admin profile endpoint 
router.get('/api/user/profile/:id', getAdminProfile);

// Update admin profile endpoint 
router.put('/api/user/profile/:id', updateAdminProfile);

export default router; 