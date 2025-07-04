// Get unread notifications count
export const getUnreadNotificationsCount = async (req, res) => {
  const userId = req.params.id;
  const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE UserID = ? AND IsRead = FALSE
    `;

  try {
    req.db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching notification count:', err);
        return res.status(500).json({ error: 'Failed to fetch notification count' });
      }
      res.json({ count: results[0].count });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  const query = `
        SELECT
            n.NotificationID,
            n.UserID,
            n.Message,
            n.Type,
            n.IsRead,
            n.CreatedAt,
            CASE 
                WHEN n.Type = 'NEW_CHAT_MESSAGE' THEN n.TicketLogID
                ELSE tl.TicketID 
            END AS TicketID,
            tl.UserID AS SourceUserID,
            au.FullName AS SourceUserFullName,
            au.ProfileImagePath AS SourceUserProfileImagePath
        FROM
            notifications n
        LEFT JOIN
            ticketlog tl ON n.TicketLogID = tl.TicketLogID AND n.Type != 'NEW_CHAT_MESSAGE'
        LEFT JOIN
            appuser au ON tl.UserID = au.UserID
        WHERE
            n.UserID = ?
        ORDER BY
            n.CreatedAt DESC;
    `;

  try {
    req.db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notifications as read
export const markNotificationsAsRead = async (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ error: 'Notification IDs array is required' });
  }

  const query = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE NotificationID IN (?)
    `;

  try {
    req.db.query(query, [notificationIds], (err, result) => {
      if (err) {
        console.error('Error marking notifications as read:', err);
        return res.status(500).json({ error: 'Failed to mark notifications as read' });
      }
      res.json({ message: 'Notifications marked as read', updatedCount: result.affectedRows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE UserID = ? AND IsRead = FALSE
    `;

  try {
    req.db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error marking all notifications as read:', err);
        return res.status(500).json({ error: 'Failed to mark all notifications as read' });
      }
      res.json({ message: 'All notifications marked as read', updatedCount: result.affectedRows });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send status update notifications
export const sendStatusUpdateNotifications = async (req, res) => {
  try {
    const { ticketId, updatedByUserId, oldStatus, newStatus } = req.body;

    // Get ticket information
    const ticketQuery = 'SELECT * FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      req.db.query(ticketQuery, [ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (ticketResult.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult[0];

    // Get updater name
    const updaterQuery = 'SELECT FullName FROM appuser WHERE UserID = ?';
    const updaterResult = await new Promise((resolve, reject) => {
      req.db.query(updaterQuery, [updatedByUserId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const updaterName = updaterResult.length > 0 ? updaterResult[0].FullName : 'Admin';

    // Get all admins
    const admins = await getUsersByRoles(['Admin']);

    // Get assigned supervisors for this ticket
    const supervisorQuery = `
            SELECT DISTINCT appuser.UserID 
            FROM ticket_supervisors 
            JOIN appuser ON ticket_supervisors.SupervisorUserID = appuser.UserID 
            WHERE ticket_supervisors.TicketID = ?
        `;
    const supervisors = await new Promise((resolve, reject) => {
      req.db.query(supervisorQuery, [ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Combine admins and supervisors, excluding the updater
    const allRecipients = [...admins, ...supervisors].filter(user => user.UserID != updatedByUserId);

    // Create notifications for all recipients
    const message = `Ticket #${ticketId} status has been updated from ${oldStatus} to ${newStatus} by ${updaterName}`;
    const notifications = allRecipients.map(user =>
      createNotification(user.UserID, message, 'STATUS_UPDATE', null, ticketId)
    );

    await Promise.all(notifications);

    res.json({ message: 'Status update notifications sent successfully' });
  } catch (error) {
    console.error('Error sending status update notifications:', error);
    res.status(500).json({ error: 'Failed to send status update notifications' });
  }
};

// Send resolution update notifications
export const sendResolutionUpdateNotifications = async (req, res) => {
  try {
    const { ticketId, updatedByUserId, resolutionText } = req.body;

    // Get ticket information
    const ticketQuery = 'SELECT * FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      req.db.query(ticketQuery, [ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (ticketResult.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult[0];

    // Get updater name
    const updaterQuery = 'SELECT FullName FROM appuser WHERE UserID = ?';
    const updaterResult = await new Promise((resolve, reject) => {
      req.db.query(updaterQuery, [updatedByUserId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const updaterName = updaterResult.length > 0 ? updaterResult[0].FullName : 'Admin';

    // Get all admins
    const admins = await getUsersByRoles(['Admin']);

    // Get assigned supervisors for this ticket
    const supervisorQuery = `
            SELECT DISTINCT appuser.UserID 
            FROM ticket_supervisors 
            JOIN appuser ON ticket_supervisors.SupervisorUserID = appuser.UserID 
            WHERE ticket_supervisors.TicketID = ?
        `;
    const supervisors = await new Promise((resolve, reject) => {
      req.db.query(supervisorQuery, [ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Combine admins and supervisors, excluding the updater
    const allRecipients = [...admins, ...supervisors].filter(user => user.UserID != updatedByUserId);

    // Create notifications for all recipients
    const message = `Ticket #${ticketId} resolution updated by ${updaterName}: ${resolutionText}`;
    const notifications = allRecipients.map(user =>
      createNotification(user.UserID, message, 'RESOLUTION_UPDATE', null, ticketId)
    );

    await Promise.all(notifications);

    res.json({ message: 'Resolution update notifications sent successfully' });
  } catch (error) {
    console.error('Error sending resolution update notifications:', error);
    res.status(500).json({ error: 'Failed to send resolution update notifications' });
  }
};

// Send due date update notifications
export const sendDueDateUpdateNotifications = async (req, res) => {
  try {
    const { ticketId, updatedByUserId, oldDueDate, newDueDate } = req.body;

    // Get ticket information
    const ticketQuery = 'SELECT * FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      req.db.query(ticketQuery, [ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (ticketResult.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult[0];

    // Get updater name
    const updaterQuery = 'SELECT FullName FROM appuser WHERE UserID = ?';
    const updaterResult = await new Promise((resolve, reject) => {
      req.db.query(updaterQuery, [updatedByUserId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const updaterName = updaterResult.length > 0 ? updaterResult[0].FullName : 'Admin';

    // Get all admins
    const admins = await getUsersByRoles(['Admin']);

    // Get assigned supervisors for this ticket
    const supervisorQuery = `
            SELECT DISTINCT appuser.UserID 
            FROM ticket_supervisors 
            JOIN appuser ON ticket_supervisors.SupervisorUserID = appuser.UserID 
            WHERE ticket_supervisors.TicketID = ?
        `;
    const supervisors = await new Promise((resolve, reject) => {
      req.db.query(supervisorQuery, [ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Combine admins and supervisors, excluding the updater
    const allRecipients = [...admins, ...supervisors].filter(user => user.UserID != updatedByUserId);

    // Create notifications for all recipients
    const oldDateStr = oldDueDate ? new Date(oldDueDate).toLocaleDateString() : 'None';
    const newDateStr = newDueDate ? new Date(newDueDate).toLocaleDateString() : 'None';
    const message = `Ticket #${ticketId} due date updated by ${updaterName} from ${oldDateStr} to ${newDateStr}`;
    const notifications = allRecipients.map(user =>
      createNotification(user.UserID, message, 'DUE_DATE_UPDATE', null, ticketId)
    );

    await Promise.all(notifications);

    res.json({ message: 'Due date update notifications sent successfully' });
  } catch (error) {
    console.error('Error sending due date update notifications:', error);
    res.status(500).json({ error: 'Failed to send due date update notifications' });
  }
}; 