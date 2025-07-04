// routes/chatNotificationRoutes.js

import express from 'express';
import { getUnreadChatCount, markChatNotificationsAsRead } from '../controllers/chatNotificationController.js';

const router = express.Router();

// Get unread chat notifications count for a specific ticket
router.get('/notifications/chat/count/:userId/:ticketId', getUnreadChatCount);

// Mark chat notifications as read for a specific ticket and user
router.put('/notifications/chat/read/:userId/:ticketId', markChatNotificationsAsRead);

export default router;
