import db from '../config/db.js';
import { createNotification, createTicketLog } from '../utils/notificationUtils.js';

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason, userId } = req.body; // Added userId to track who performed the action
  const now = new Date();
  const firstRespondedTimeValue = now;

  try {
    // First, get the ticket details including the creator
    const getTicketQuery = 'SELECT UserId as ticketCreatorId, Status as oldStatus FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      db.query(getTicketQuery, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (ticketResult.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticketCreatorId = ticketResult[0].ticketCreatorId;
    const oldStatus = ticketResult[0].oldStatus;

    // Update the ticket status
    const sql = 'UPDATE ticket SET Status = ?, FirstRespondedTime = ?, Reason = ? WHERE TicketID = ?';
    await new Promise((resolve, reject) => {
      db.query(sql, [status, firstRespondedTimeValue, reason, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Create ticket log
    const logDescription = `${status.toLowerCase()} ticket: ${reason}`;
    const logType = status === 'Rejected' ? 'TICKET_REJECTED' : 'STATUS_CHANGE';

    const logResult = await createTicketLog(
      id,
      logType,
      logDescription,
      userId,
      oldStatus,
      status,
      reason // Keep reason in note for specific rejection detail
    );

    // Send notification to the ticket creator
    if (ticketCreatorId && status === 'Rejected') {
      // Get the name of the person who rejected the ticket
      let rejectorName = 'System';
      if (userId) {
        const getRejectorNameQuery = 'SELECT FullName FROM appuser WHERE UserID = ?';
        const rejectorResult = await new Promise((resolve, reject) => {
          db.query(getRejectorNameQuery, [userId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        if (rejectorResult.length > 0) {
          rejectorName = rejectorResult[0].FullName;
        }
      }

      const notificationMessage = `Your ticket #${id} has been rejected by ${rejectorName}. Reason: ${reason}`;

      await createNotification(
        ticketCreatorId,
        notificationMessage,
        'TICKET_REJECTED',
        logResult.insertId
      );
    }

    res.status(200).json({
      message: status === 'Rejected' ? 'Ticket rejected successfully' : 'Ticket status updated successfully',
      status: 'success'
    });

  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Error updating the ticket status' });
  }
};
