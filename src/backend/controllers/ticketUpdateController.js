import db from '../config/db.js';
import { createNotification, createTicketLog } from '../utils/notificationUtils.js';

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  const { ticketId } = req.params;
  const { status, userId } = req.body; // <-- userId must be sent from frontend

  // 1. Get old status and ticket creator/supervisor info
  const getTicketInfoQuery = 'SELECT Status, UserId as ticketCreatorId, SupervisorID FROM ticket WHERE TicketID = ?';
  db.query(getTicketInfoQuery, [ticketId], async (err, results) => {
    if (err || results.length === 0) {
      console.error('Error fetching ticket info for status update:', err);
      return res.status(500).json({ message: 'Error fetching ticket details' });
    }
    const oldStatus = results[0].Status;
    const ticketCreatorId = results[0].ticketCreatorId;
    const supervisorId = results[0].SupervisorID;

    // 2. Update ticket status
    db.query('UPDATE ticket SET Status = ?, LastRespondedTime = NOW() WHERE TicketID = ?', [status, ticketId], async (err2) => {
      if (err2) {
        console.error('Error updating status:', err2);
        return res.status(500).json({ message: 'Error updating status' });
      }

      // 3. Log the status change
      const desc = `Status changed from ${oldStatus} to ${status}`;
      const logType = 'STATUS_CHANGE';
      const logNote = `Status updated by User ID: ${userId}`;

      try {
        const logResult = await createTicketLog(
          ticketId,
          logType,
          `changed status from ${oldStatus} to ${status}`,
          userId,
          oldStatus,
          status,
          null // The note is now handled by createTicketLog's userName prepending
        );

        // 4. Send notifications
        // Get updater's name for notifications
        const getUpdaterNameQuery = 'SELECT FullName FROM appuser WHERE UserID = ?';
        const [updaterNameResult] = await new Promise((resolve, reject) => {
          db.query(getUpdaterNameQuery, [userId], (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        });
        const updaterName = updaterNameResult && updaterNameResult.length > 0 ? updaterNameResult[0].FullName : 'Unknown User';

        // Notify ticket creator
        if (ticketCreatorId) {
          await createNotification(
            ticketCreatorId,
            `Your ticket #${ticketId} status has been changed from ${oldStatus} to ${status}${updaterName ? ` by ${updaterName}` : ''}`,
            'STATUS_UPDATE',
            logResult.insertId
          );
        }

        // Notify supervisor (if assigned and not the one who made the change)
        if (supervisorId && supervisorId != userId) { // Use != for comparison
          await createNotification(
            supervisorId,
            `Ticket #${ticketId} status has been changed from ${oldStatus} to ${status}${updaterName ? ` by ${updaterName}` : ''}`,
            'STATUS_UPDATE',
            logResult.insertId
          );
        }

        res.json({ message: 'Status updated and logged', logId: logResult.insertId });

      } catch (logOrNotificationError) {
        console.error('Error logging status change or sending notifications:', logOrNotificationError);
        res.status(500).json({ message: 'Status updated, but failed to log or send notifications.' });
      }
    });
  });
};

// Update ticket priority
export const updateTicketPriority = async (req, res) => {
  const { ticketId } = req.params;
  const { priority, userId } = req.body;

  // First get the current ticket and user details
  const getTicket = `
        SELECT 
            t.Priority,
            t.UserId as ticketUserId,
            t.SupervisorID,
            au.FullName as updatedByName,
            au_creator.FullName as creatorName
        FROM ticket t
        LEFT JOIN appuser au ON au.UserID = ?
        LEFT JOIN appuser au_creator ON au_creator.UserID = t.UserId
        WHERE t.TicketID = ?
    `;

  try {
    const [ticketResults] = await new Promise((resolve, reject) => {
      db.query(getTicket, [userId, ticketId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!ticketResults) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const oldPriority = ticketResults.Priority;
    const ticketUserId = ticketResults.ticketUserId;
    const updatedByName = ticketResults.updatedByName;

    // Update the ticket priority
    const updateQuery = "UPDATE ticket SET Priority = ?, LastRespondedTime = NOW() WHERE TicketID = ?";

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [priority, ticketId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Create ticket log entry
    const logQuery = `
            INSERT INTO ticketlog 
            (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue, Note)
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
        `;

    const description = `changed priority from ${oldPriority} to ${priority}`;

    const [logResult] = await new Promise((resolve, reject) => {
      db.query(
        logQuery,
        [ticketId, 'PRIORITY_CHANGE', description, userId, oldPriority, priority, null],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // Create notifications
    try {
      // Notify ticket creator
      await createNotification(
        ticketUserId,
        `Your ticket #${ticketId} priority has been changed from ${oldPriority} to ${priority}${updatedByName ? ` by ${updatedByName}` : ''}`,
        'PRIORITY_UPDATE',
        logResult.insertId
      );

      // If priority changed to High, notify supervisor
      if (priority === 'High' && ticketResults.SupervisorID) {
        await createNotification(
          ticketResults.SupervisorID,
          `Ticket #${ticketId} has been marked as High priority. Immediate attention required. ${updatedByName ? `Updated by ${updatedByName}` : ''}`,
          'HIGH_PRIORITY_ALERT',
          logResult.insertId
        );
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
    }

    res.json({
      message: "Ticket priority updated successfully",
      logId: logResult.insertId
    });
  } catch (error) {
    console.error("Error updating ticket priority:", error);
    res.status(500).json({ message: "Server error" });
  }
};
