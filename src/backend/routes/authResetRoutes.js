import express from 'express';
import { resetPassword } from '../controllers/authResetController.js';

const router = express.Router();

// POST /reset-password
router.post('/reset-password', resetPassword);

export default router;