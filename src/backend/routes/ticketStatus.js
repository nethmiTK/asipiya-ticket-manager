import express from 'express';
const router = express.Router();

// Get filtered tickets
router.get('/api/tickets/filter', async (req, res) => {
  const { type } = req.query;
  
  let whereClause = '';
  const today = new Date().toISOString().split('T')[0];
  
  switch (type) {
    case 'open':
      whereClause = "WHERE t.Status = 'Open'";
      break;
    case 'today':
      whereClause = `WHERE DATE(t.DateTime) = '${today}'`;
      break;
    case 'pending':
      whereClause = "WHERE t.Status = 'Pending'";
      break;
    case 'high':
      whereClause = "WHERE t.Priority = 'High'";
      break;
    case 'resolved':
      whereClause = "WHERE t.Status = 'Resolved'";
      break;
    default:
      whereClause = '';
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
    ${whereClause}
    ORDER BY t.DateTime DESC
  `;

  try {
    req.db.query(query, (err, results) => {
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
});

// Update ticket status
router.put('/:ticketId', async (req, res) => {
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
});

export default router; 