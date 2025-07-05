import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to detect image files
function isImageFile(filename) {
  if (!filename) return false;
  const ext = path.extname(filename).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].includes(ext);
}

// Helper function to create chat notifications
const createChatNotification = async (db, io, ticketId, senderUserId, senderRole, messageContent, messageType) => {
  try {
    if (senderRole === 'Admin' || senderRole === 'Supervisor') {
      // Admin/Supervisor sending to User
      const ticketQuery = `
        SELECT t.UserId as UserID, au.FullName as UserName, 
               sender.FullName as SenderName
        FROM ticket t 
        LEFT JOIN appuser au ON t.UserId = au.UserID
        LEFT JOIN appuser sender ON sender.UserID = ?
        WHERE t.TicketID = ?
      `;

      db.query(ticketQuery, [senderUserId, ticketId], (err, ticketResults) => {
        if (err) {
          console.error('Error fetching ticket details for notification:', err);
          return;
        }

        if (ticketResults.length === 0) {
          console.log('Ticket not found for notification');
          return;
        }

        const ticket = ticketResults[0];
        const recipientUserId = ticket.UserID;
        const senderName = ticket.SenderName || 'Unknown';

        // Don't send notification to the same user who sent the message
        if (recipientUserId === senderUserId) {
          return;
        }

        // Create notification message based on message type
        let notificationMessage;
        if (messageType === 'file') {
          notificationMessage = `${senderName} sent you a file in ticket #${ticketId}`;
        } else {
          // Truncate message if it's too long
          const truncatedContent = messageContent.length > 50
            ? messageContent.substring(0, 50) + '...'
            : messageContent;
          notificationMessage = `${senderName}: ${truncatedContent} (Ticket #${ticketId})`;
        }      // Insert notification
        const notificationQuery = `
        INSERT INTO notifications (UserID, Message, Type, IsRead, CreatedAt, TicketLogID)
        VALUES (?, ?, ?, FALSE, NOW(), ?)
      `;

        db.query(notificationQuery, [
          recipientUserId,
          notificationMessage,
          'NEW_CHAT_MESSAGE',
          ticketId  // Store TicketID in TicketLogID field for chat messages
        ], (notifErr, notifResult) => {
          if (notifErr) {
            console.error('Error creating chat notification:', notifErr);
          } else {
            console.log(`Chat notification created for user ${recipientUserId} about ticket ${ticketId}`);

            // Emit notification to the user via socket if they're online
            io.emit(`notification-${recipientUserId}`, {
              notificationId: notifResult.insertId,
              message: notificationMessage,
              type: 'NEW_CHAT_MESSAGE',
              ticketId: ticketId,
              createdAt: new Date().toISOString()
            });
          }
        });
      });

    } else if (senderRole === 'User' || senderRole === 'Client') {
      // User/Client sending to Admin/Supervisors
      const supervisorQuery = `
        SELECT t.SupervisorID, sender.FullName as SenderName
        FROM ticket t
        LEFT JOIN appuser sender ON sender.UserID = ?
        WHERE t.TicketID = ?
      `;

      db.query(supervisorQuery, [senderUserId, ticketId], (err, supervisorResults) => {
        if (err) {
          console.error('Error fetching supervisors for notification:', err);
          return;
        }

        if (supervisorResults.length === 0) {
          console.log('No supervisors found for ticket');
          return;
        }

        const senderName = supervisorResults[0].SenderName || 'User';
        const supervisorIDsString = supervisorResults[0].SupervisorID;

        // Parse supervisor IDs from comma-separated string
        let supervisorIds = [];
        if (supervisorIDsString) {
          supervisorIds = supervisorIDsString.split(',').map(id => id.trim()).filter(id => id);
        }

        // Also get all admins
        const adminQuery = `SELECT UserID FROM appuser WHERE Role = 'Admin'`;

        db.query(adminQuery, (adminErr, adminResults) => {
          if (adminErr) {
            console.error('Error fetching admins for notification:', adminErr);
            return;
          }

          // Combine supervisors and admins
          const allRecipients = [...supervisorIds];
          adminResults.forEach(admin => {
            if (!allRecipients.includes(admin.UserID.toString())) {
              allRecipients.push(admin.UserID.toString());
            }
          });

          // Send notifications to all recipients
          allRecipients.forEach(recipientId => {
            // Don't send notification to the same user who sent the message
            if (recipientId == senderUserId) {
              return;
            }

            // Create notification message based on message type
            let notificationMessage;
            if (messageType === 'file') {
              notificationMessage = `${senderName} sent a file in ticket #${ticketId}`;
            } else {
              // Truncate message if it's too long
              const truncatedContent = messageContent.length > 50
                ? messageContent.substring(0, 50) + '...'
                : messageContent;
              notificationMessage = `${senderName}: ${truncatedContent} (Ticket #${ticketId})`;
            }

            // Insert notification
            const notificationQuery = `
              INSERT INTO notifications (UserID, Message, Type, IsRead, CreatedAt, TicketLogID)
              VALUES (?, ?, ?, FALSE, NOW(), ?)
            `;

            db.query(notificationQuery, [
              recipientId,
              notificationMessage,
              'NEW_CHAT_MESSAGE',
              ticketId  // Store TicketID in TicketLogID field for chat messages
            ], (notifErr, notifResult) => {
              if (notifErr) {
                console.error('Error creating chat notification for supervisor/admin:', notifErr);
              } else {
                console.log(`Chat notification created for user ${recipientId} about ticket ${ticketId}`);

                // Emit notification to the supervisor/admin via socket if they're online
                io.emit(`notification-${recipientId}`, {
                  notificationId: notifResult.insertId,
                  message: notificationMessage,
                  type: 'NEW_CHAT_MESSAGE',
                  ticketId: ticketId,
                  createdAt: new Date().toISOString()
                });
              }
            });
          });
        });
      });
    }

  } catch (error) {
    console.error('Error in createChatNotification:', error);
  }
};

export const getMessages = (req, res) => {
  const ticketId = req.params.ticketId;
  const db = req.db;
  const sql = `
    SELECT TicketChatID AS id, TicketID, Type, Note AS content,
           UserID, Path, Role, CreatedAt AS timestamp, Seen
    FROM ticketchat
    WHERE TicketID = ?
    ORDER BY CreatedAt ASC
  `;
  db.query(sql, [ticketId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch messages" });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formatted = rows.map(r => ({
      id: r.id,
      ticketid: r.TicketID,
      type: r.Type,
      content: r.content,
      userid: r.UserID,
      role: r.Role,
      timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : null,
      file: r.Path ? {
        name: path.basename(r.Path),
        url: `${baseUrl}/uploads/profile_images/${r.Path}`,
        isImage: isImageFile(r.Path),
      } : null,
      status: r.Seen ? "seen" : "✓",
    }));
    res.json(formatted);
  });
};

export const postMessage = (req, res, io) => {
  const { TicketID, Type, Note, UserID, Role } = req.body;
  const file = req.file;
  const db = req.db;

  console.log("Received chat message:", { TicketID, Type, Note, UserID, Role });

  if (!TicketID || !Note) {
    return res.status(400).json({ error: "TicketID and Note are required." });
  }

  const filePath = file ? file.filename : null;

  const sql = `
    INSERT INTO ticketchat (TicketID, Type, Note, UserID, Role, Path)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    TicketID,
    Type || "text",
    Note,
    UserID || null,
    Role || null,
    filePath,
  ];

  console.log("Inserting chat message with values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const newMessage = {
      id: result.insertId,
      ticketid: TicketID,
      type: Type || "text",
      content: Note,
      userid: UserID || null,
      role: Role || null,
      timestamp: new Date().toISOString(),
      file: filePath
        ? {
          url: `${baseUrl}/uploads/profile_images/${filePath}`,
          isImage: isImageFile(filePath),
          name: file.originalname,
        }
        : null,
      status: "✓",
    };

    io.to(TicketID.toString()).emit("receiveTicketMessage", newMessage);

    createChatNotification(db, io, TicketID, UserID, Role, Note, Type || "text");

    res.status(201).json({
      message: "Chat message added",
      chatId: result.insertId,
      file: newMessage.file || null,
    });
  });
};

export const postUserMessage = (req, res, io) => {
  const { TicketID, Type, Note, UserID, Role } = req.body;
  const file = req.file;
  const db = req.db;

  if (!TicketID || !Note) {
    return res.status(400).json({ error: "TicketID and Note are required." });
  }

  const filePath = file ? file.filename : null;

  const sql = `
    INSERT INTO ticketchat (TicketID, Type, Note, UserID, Role, Path)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    TicketID,
    Type || "text",
    Note,
    UserID || null,
    Role || "User",
    filePath,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).json({ error: "Failed to save message." });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const newMessage = {
      id: result.insertId,
      ticketid: TicketID,
      type: Type || "text",
      content: Note,
      userid: UserID || null,
      role: Role || "User",
      timestamp: new Date().toISOString(),
      file: filePath
        ? {
          url: `${baseUrl}/uploads/profile_images/${filePath}`,
          isImage: isImageFile(filePath),
          name: file.originalname,
        }
        : null,
      status: "✓",
    };

    io.to(TicketID.toString()).emit("receiveTicketMessage", newMessage);

    createChatNotification(db, io, TicketID, UserID, Role || "User", Note, Type || "text");

    res.status(201).json({
      message: "Message saved",
      chatId: result.insertId,
      file: newMessage.file,
    });
  });
};

export const getUserMessages = (req, res) => {
  const ticketID = req.params.ticketID;
  const db = req.db;
  if (!ticketID) return res.status(400).json({ error: "TicketID is required." });

  const sql = `
    SELECT TicketChatID AS id, TicketID, Type, Note AS content, 
           UserID, Path, Role, CreatedAt AS timestamp
    FROM ticketchat
    WHERE TicketID = ?
    ORDER BY CreatedAt ASC
  `;

  db.query(sql, [ticketID], (err, results) => {
    if (err) {
      console.error("DB fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch messages." });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const formatted = results.map((msg) => ({
      id: msg.id,
      ticketid: msg.TicketID,
      type: msg.Type,
      content: msg.content,
      userid: msg.UserID,
      role: msg.Role,
      timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null,
      file: msg.Path
        ? {
          url: `${baseUrl}/uploads/profile_images/${msg.Path}`,
          isImage: isImageFile(msg.Path),
          name: path.basename(msg.Path),
        }
        : null,
      status: "✓",
    }));

    res.status(200).json(formatted);
  });
};

export const downloadFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads/profile_images/", filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(404).send("File not found.");
    }
  });
};

export const markMessagesAsSeen = async (req, res, io) => {
  const { TicketID, Role } = req.body;
  const db = req.db;
  const query = util.promisify(db.query).bind(db);

  if (!TicketID || !Role) return res.status(400).json({ error: "TicketID and Role required" });

  try {
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

    const sql = `
      UPDATE ticketchat
      SET Seen = 1
      WHERE TicketID = ? AND Role != ? AND Seen = 0
    `;

    await query(sql, [TicketID, Role]);

    if (Role === 'User' || Role === 'Client') {
      const updateNotificationsSql = `
        UPDATE notifications
        SET IsRead = TRUE
        WHERE TicketLogID = ?
        AND Type = 'NEW_CHAT_MESSAGE'
        AND UserID = (SELECT UserId FROM ticket WHERE TicketID = ?)
        AND IsRead = FALSE
      `;
      const notifResult = await query(updateNotificationsSql, [TicketID, TicketID]);
      console.log(`Updated ${notifResult.affectedRows} chat notifications as read for ticket ${TicketID}`);
      
      const userResults = await query(getUserIdQuery, getUserIdParams);
      if (userResults.length > 0) {
        const userId = userResults[0].UserID;
        io.emit(`notification-update-${userId}`, {
          ticketId: TicketID,
          type: 'CHAT_NOTIFICATIONS_READ',
          updatedCount: notifResult.affectedRows
        });
      }
    } else if (Role === 'Admin' || Role === 'Supervisor') {
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
      const notifResult = await query(updateNotificationsSql, [TicketID, TicketID]);
      console.log(`Updated ${notifResult.affectedRows} chat notifications as read for ticket ${TicketID}`);

      const userResults = await query(getUserIdQuery, getUserIdParams);
      if (userResults.length > 0) {
        userResults.forEach(user => {
          io.emit(`notification-update-${user.UserID}`, {
            ticketId: TicketID,
            type: 'CHAT_NOTIFICATIONS_READ',
            updatedCount: notifResult.affectedRows
          });
        });
      }
    }

    io.to(String(TicketID)).emit("messagesSeen", { TicketID, Role });
    res.status(200).json({ message: "Messages marked as seen." });

  } catch (err) {
    console.error('Error in markMessagesAsSeen:', err);
    res.status(500).json({ error: "Failed to update seen status" });
  }
};