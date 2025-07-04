// Mark messages as seen
export const markMessagesAsSeen = async (req, res, io) => {
  const { TicketID, Role } = req.body;
  if (!TicketID || !Role) return res.status(400).json({ error: "TicketID and Role required" });

  // First, get the current user's ID based on the role and ticket
  let getUserIdQuery;
  let getUserIdParams;

  if (Role === 'User' || Role === 'Client') {
    getUserIdQuery = `SELECT UserId as UserID FROM ticket WHERE TicketID = ?`;
    getUserIdParams = [TicketID];
  } else if (Role === 'Admin' || Role === 'Supervisor') {
    getUserIdQuery = `
      SELECT DISTINCT au.UserID 
      FROM appuser au 
      LEFT JOIN ticket t ON FIND_IN_SET(au.UserID, t.SupervisorID) > 0 OR au.Role = 'Admin'
      WHERE t.TicketID = ? AND (au.Role = 'Admin' OR au.Role = 'Supervisor')
    `;
    getUserIdParams = [TicketID];
  }

  // Update chat messages as seen
  const sql = `
    UPDATE ticketchat
    SET Seen = 1
    WHERE TicketID = ? AND Role != ? AND Seen = 0
  `;

  try {
    req.db.query(sql, [TicketID, Role], (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update seen status" });

      // Now update related notifications as read
      if (Role === 'User' || Role === 'Client') {
        // User/Client is marking admin/supervisor messages as seen
        const updateNotificationsSql = `
          UPDATE notifications 
          SET IsRead = TRUE 
          WHERE TicketLogID = ? 
          AND Type = 'NEW_CHAT_MESSAGE' 
          AND UserID = (SELECT UserId FROM ticket WHERE TicketID = ?)
          AND IsRead = FALSE
        `;

        req.db.query(updateNotificationsSql, [TicketID, TicketID], (notifErr, notifResult) => {
          if (notifErr) {
            console.error('Error updating chat notifications:', notifErr);
          } else {
            console.log(`Updated ${notifResult.affectedRows} chat notifications as read for ticket ${TicketID}`);

            // Get the user ID to emit notification update
            req.db.query(getUserIdQuery, getUserIdParams, (userErr, userResults) => {
              if (!userErr && userResults.length > 0) {
                const userId = userResults[0].UserID;
                // Emit notification count update to the user
                io.emit(`notification-update-${userId}`, {
                  ticketId: TicketID,
                  type: 'CHAT_NOTIFICATIONS_READ',
                  updatedCount: notifResult.affectedRows
                });
              }
            });
          }
        });
      } else if (Role === 'Admin' || Role === 'Supervisor') {
        // Admin/Supervisor is marking user messages as seen
        const updateNotificationsSql = `
          UPDATE notifications 
          SET IsRead = TRUE 
          WHERE TicketLogID = ? 
          AND Type = 'NEW_CHAT_MESSAGE' 
          AND UserID IN (
            SELECT DISTINCT au.UserID 
            FROM appuser au 
            LEFT JOIN ticket t ON FIND_IN_SET(au.UserID, t.SupervisorID) > 0 OR au.Role = 'Admin'
            WHERE t.TicketID = ? AND (au.Role = 'Admin' OR au.Role = 'Supervisor')
          )
          AND IsRead = FALSE
        `;

        req.db.query(updateNotificationsSql, [TicketID, TicketID], (notifErr, notifResult) => {
          if (notifErr) {
            console.error('Error updating chat notifications:', notifErr);
          } else {
            console.log(`Updated ${notifResult.affectedRows} chat notifications as read for ticket ${TicketID}`);

            // Get all admin/supervisor user IDs to emit notification updates
            req.db.query(getUserIdQuery, getUserIdParams, (userErr, userResults) => {
              if (!userErr && userResults.length > 0) {
                userResults.forEach(user => {
                  io.emit(`notification-update-${user.UserID}`, {
                    ticketId: TicketID,
                    type: 'CHAT_NOTIFICATIONS_READ',
                    updatedCount: notifResult.affectedRows
                  });
                });
              }
            });
          }
        });
      }

      // Emit the original messagesSeen event
      io.to(String(TicketID)).emit("messagesSeen", { TicketID, Role });
      res.status(200).json({ message: "Messages marked as seen." });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark messages as seen for specific user
export const markMessagesAsSeenByUser = async (req, res, io) => {
  const { TicketID, Role, UserID } = req.body;
  if (!TicketID || !Role || !UserID) {
    return res.status(400).json({ error: "TicketID, Role, and UserID are required" });
  }

  // Update chat messages as seen
  const sql = `
    UPDATE ticketchat
    SET Seen = 1
    WHERE TicketID = ? AND Role != ? AND Seen = 0
  `;

  try {
    req.db.query(sql, [TicketID, Role], (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update seen status" });

      // Update notifications as read for the specific user
      const updateNotificationsSql = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE TicketLogID = ? 
        AND Type = 'NEW_CHAT_MESSAGE' 
        AND UserID = ?
        AND IsRead = FALSE
      `;

      req.db.query(updateNotificationsSql, [TicketID, UserID], (notifErr, notifResult) => {
        if (notifErr) {
          console.error('Error updating chat notifications:', notifErr);
        } else {
          console.log(`Updated ${notifResult.affectedRows} chat notifications as read for user ${UserID}, ticket ${TicketID}`);

          // Emit notification count update to the specific user
          io.emit(`notification-update-${UserID}`, {
            ticketId: TicketID,
            type: 'CHAT_NOTIFICATIONS_READ',
            updatedCount: notifResult.affectedRows
          });
        }
      });

      // Emit the original messagesSeen event
      io.to(String(TicketID)).emit("messagesSeen", { TicketID, Role });
      res.status(200).json({
        message: "Messages marked as seen.",
        chatUpdated: result.affectedRows > 0
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 