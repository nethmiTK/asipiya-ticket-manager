import express from 'express';
import { forgotPassword } from '../controllers/authPasswordController.js';

const router = express.Router();

// POST /forgot-password
router.post('/forgot-password', forgotPassword);

export default router;