import { createTicketLog, createNotification } from '../utils/notificationUtils.js';

// Get filtered tickets
export const getFilteredTickets = async (req, res) => {
  const { type, system, company } = req.query;
  
  let whereClause = [];
  const params = [];
  const today = new Date().toISOString().split('T')[0];
  
  // Add type-based filtering
  if (type) {
    switch (type) {
      case 'open':
        whereClause.push("t.Status = 'Open'");
        break;
      case 'today':
        whereClause.push(`DATE(t.DateTime) = ?`);
        params.push(today);
        break;
      case 'pending':
        whereClause.push("t.Status = 'Pending'");
        break;
      case 'high':
        whereClause.push("t.Priority = 'High'");
        break;
      case 'resolved':
        whereClause.push("t.Status = 'Resolved'");
        break;
    }
  }

  // Add system filtering
  if (system) {
    whereClause.push("s.SystemName = ?");
    params.push(system);
  }

  // Add company filtering
  if (company) {
    whereClause.push("c.CompanyName = ?");
    params.push(company);
  }

  const query = `
    SELECT 
      t.*,
      au.FullName as UserName,
      au.Email as UserEmail,
      c.CompanyName,
      s.SystemName,
      tc.CategoryName
    FROM ticket t
    LEFT JOIN appuser au ON t.UserId = au.UserID
    LEFT JOIN client c ON au.UserID = c.UserID
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
    ${whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : ''}
    ORDER BY t.DateTime DESC
  `;

  try {
    req.db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching tickets:', err);
        return res.status(500).json({ error: 'Failed to fetch tickets' });
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
    const { ticketId } = req.params;
    const { status, userId } = req.body;

    // Get current ticket and user details
    const getDetailsQuery = `
        SELECT 
            t.Status, 
            t.UserId as ticketUserId,
            t.SupervisorID,
            au.FullName as updaterName,
            au_creator.FullName as creatorName
        FROM ticket t
        LEFT JOIN appuser au ON au.UserID = ?
        LEFT JOIN appuser au_creator ON au_creator.UserID = t.UserId
        WHERE t.TicketID = ?
    `;
    
    try {
        const [details] = await new Promise((resolve, reject) => {
            req.db.query(getDetailsQuery, [userId, ticketId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!details) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        const oldStatus = details.Status;
        const ticketUserId = details.ticketUserId;
        const updaterName = details.updaterName;

        // Update the ticket status
        const updateQuery = "UPDATE ticket SET Status = ?, LastRespondedTime = NOW() WHERE TicketID = ?";
        
        await new Promise((resolve, reject) => {
            req.db.query(updateQuery, [status, ticketId], (err, result) => {
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

        const description = `Status changed from ${oldStatus} to ${status}`;
        const note = `Updated by ${updaterName}`;

        const [logResult] = await new Promise((resolve, reject) => {
            req.db.query(
                logQuery,
                [ticketId, 'STATUS_CHANGE', description, userId, oldStatus, status, note],
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
                `Your ticket #${ticketId} status has been updated from ${oldStatus} to ${status} by ${updaterName}`,
                'STATUS_UPDATE',
                logResult.insertId
            );

            // If status changed to "In Progress", notify about supervisor assignment
            if (status === 'In Progress' && details.SupervisorID) {
                await createNotification(
                    ticketUserId,
                    `Your ticket #${ticketId} is now being processed.`,
                    'TICKET_IN_PROCESS',
                    logResult.insertId
                );

                // Notify supervisor
                await createNotification(
                    details.SupervisorID,
                    `Ticket #${ticketId} has been moved to In Progress status. Please review it.`,
                    'TICKET_NEEDS_ATTENTION',
                    logResult.insertId
                );
            }

            // If status changed to "Resolved"
            if (status === 'Resolved') {
                await createNotification(
                    ticketUserId,
                    `Your ticket #${ticketId} has been marked as resolved by ${updaterName}. Please review the resolution.`,
                    'TICKET_RESOLVED',
                    logResult.insertId
                );
            }
        } catch (error) {
            console.error("Error creating notifications:", error);
        }

        res.json({ 
            message: "Ticket status updated successfully",
            logId: logResult.insertId
        });
    } catch (error) {
        console.error("Error updating ticket status:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update ticket status (from index.js)
export const updateTicketStatusFromIndex = async (req, res) => {
  const { id } = req.params;
  const { status, reason, userId } = req.body; // Added userId to track who performed the action
  const now = new Date();
  const firstRespondedTimeValue = now;

  try {
    // First, get the ticket details including the creator
    const getTicketQuery = 'SELECT UserId as ticketCreatorId, Status as oldStatus FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      req.db.query(getTicketQuery, [id], (err, results) => {
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
      req.db.query(sql, [status, firstRespondedTimeValue, reason, id], (err, result) => {
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
          req.db.query(getRejectorNameQuery, [userId], (err, results) => {
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

// Get all tickets (from index.js)
export const getAllTickets = async (req, res) => {
  const query = `
    SELECT t.TicketID, c.Email AS UserEmail, s.Description AS System, tc.Description AS Category, t.Status, t.Priority, t.DateTime
    FROM ticket t
    LEFT JOIN appuser c ON t.UserId = c.UserID
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID;
  `;

  req.db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
};