import express from 'express';
import { markMessagesAsSeen, markMessagesAsSeenByUser } from '../controllers/chatController.js';

const router = express.Router();

// Mark messages as seen
router.post("/markSeen", (req, res) => {
    markMessagesAsSeen(req, res, req.app.get('io'));
});

// Enhanced mark messages as seen with specific user ID
router.post("/markSeen/user", (req, res) => {
    markMessagesAsSeenByUser(req, res, req.app.get('io'));
});

export default router; 