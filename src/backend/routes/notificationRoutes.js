import express from 'express';
import {
    getUnreadNotificationsCount,
    getUserNotifications,
    markNotificationsAsRead,
    markAllNotificationsAsRead,
    sendStatusUpdateNotifications,
    sendResolutionUpdateNotifications,
    sendDueDateUpdateNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// Get unread notifications count
router.get('/count/:id', getUnreadNotificationsCount);

// Get user's notifications
router.get('/:userId', getUserNotifications);

// Mark notifications as read
router.put('/read', markNotificationsAsRead);

// Mark all notifications as read for a user
router.put('/read-all/:userId', markAllNotificationsAsRead);

// Send status update notifications
router.post('/status-update', sendStatusUpdateNotifications);

// Send resolution update notifications
router.post('/resolution-update', sendResolutionUpdateNotifications);

// Send due date update notifications
router.post('/due-date-update', sendDueDateUpdateNotifications);

export default router; 