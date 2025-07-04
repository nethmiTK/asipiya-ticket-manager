// controllers/chatNotificationController.js

import db from '../config/db.js';

// Get unread chat notifications count for a specific ticket
export const getUnreadChatCount = (req, res) => {
  const { userId, ticketId } = req.params;
  const query = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE UserID = ?
    AND TicketLogID = ?  /* For chat messages, TicketLogID stores TicketID */
    AND Type = 'NEW_CHAT_MESSAGE'
    AND IsRead = FALSE;
  `;

  db.query(query, [userId, ticketId], (err, results) => {
    if (err) {
      console.error('Error fetching unread chat notification count:', err);
      return res.status(500).json({ error: 'Failed to fetch unread chat notification count' });
    }
    res.json({ count: results[0].count });
  });
};

// Mark chat notifications as read for a specific ticket and user
export const markChatNotificationsAsRead = (req, res) => {
  const { userId, ticketId } = req.params;

  const query = `
    UPDATE notifications
    SET IsRead = TRUE
    WHERE UserID = ?
    AND TicketLogID = ?  /* For chat messages, TicketLogID stores TicketID */
    AND Type = 'NEW_CHAT_MESSAGE'
    AND IsRead = FALSE;
  `;

  db.query(query, [userId, ticketId], (err, result) => {
    if (err) {
      console.error('Error marking chat notifications as read:', err);
      return res.status(500).json({ error: 'Failed to mark chat notifications as read' });
    }
    res.json({ message: 'Chat notifications marked as read', updatedCount: result.affectedRows });
  });
};
