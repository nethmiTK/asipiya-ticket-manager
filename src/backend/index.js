import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import crypto from 'crypto';
import util from 'util';
import ticketLogRoutes from './routes/ticketLog.js';
import userProfileRoutes from './routes/userProfile.js';
import http from 'http';
import { Server } from 'socket.io';
import db from './config/db.js';
import supervisorRoutes from './routes/supervisorRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import authLoginRoutes from './routes/authLoginRoutes.js'; 
import authPasswordRoutes from './routes/authPasswordRoutes.js';
import authResetRoutes from './routes/authResetRoutes.js';

import systemRoutes from './routes/systemRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import supervisorAssignRoutes from './routes/supervisorAssignRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import { sendNotificationsByRoles, createNotification, createTicketLog } from './utils/notificationUtils.js';
import notificationRoutes from './routes/notificationRoutes.js';
 import evidenceRoutes from './routes/evidenceRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import ticketUpdateRoutes from './routes/ticketUpdateRoutes.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Add middleware to pass db connection to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Configure routes
app.use('/api/ticket-logs', ticketLogRoutes);
app.use('/', userProfileRoutes);
app.use('/supervisor', supervisorRoutes);
app.use('/api/invite', inviteRoutes);

//evidence uploads
app.use("/uploads", express.static("uploads"));
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const query = util.promisify(db.query).bind(db);

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

// --- Multer Configuration for Profile Images ---
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'profile_images');
    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.params.id;
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${userId}-${Date.now()}.${fileExtension}`);
  }
});

const upload = multer({ storage: profileImageStorage });

// --- Multer Configuration for Comment Attachments ---
const commentAttachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'comment_attachments');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const commentAttachmentUpload = multer({
  storage: commentAttachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

//  Define salt rounds for bcrypt hashing.
const saltRounds = 10;

// -------Register endpoint------- //

app.use(authRoutes); 

/*------------------------------------------*/

// API endpoint to fetch tickets
app.get('/api/tickets', (req, res) => {
  const query = `
    SELECT t.TicketID, c.Email AS UserEmail, s.Description AS System, tc.Description AS Category, t.Status, t.Priority, t.DateTime
    FROM ticket t
    LEFT JOIN appuser c ON t.UserId = c.UserID
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
});

// Login endpoint

app.use(authLoginRoutes);

/*---------------------------------------------*/

// Get admin  profile endpoint 
app.get('/api/user/profile/:id', (req, res) => {
  const userId = req.params.id;
  // Select all fields that the frontend profile form expects
  const query = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath FROM appuser WHERE UserID = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ message: 'Server error' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// Get admin profile update endpoint 
app.put('/api/user/profile/:id', async (req, res) => {
  const userId = req.params.id;
  const { FullName, Email, Phone, CurrentPassword, NewPassword } = req.body;

  try {
    // First get the current user data to verify password
    const getUserQuery = 'SELECT Password FROM appuser WHERE UserID = ?';
    const [user] = await db.promise().query(getUserQuery, [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If password change is requested
    if (CurrentPassword && NewPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(CurrentPassword, user[0].Password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(NewPassword, saltRounds);

      // Update all fields including password
      const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ?, Password = ? WHERE UserID = ?';
      await db.promise().query(updateQuery, [FullName, Email, Phone, hashedNewPassword, userId]);
    } else {
      // Update only non-password fields
      const updateQuery = 'UPDATE appuser SET FullName = ?, Email = ?, Phone = ? WHERE UserID = ?';
      await db.promise().query(updateQuery, [FullName, Email, Phone, userId]);
    }

    // Get updated user data
    const getUpdatedUserQuery = 'SELECT UserID, FullName, Email, Phone, Role, ProfileImagePath FROM appuser WHERE UserID = ?';
    const [updatedUser] = await db.promise().query(getUpdatedUserQuery, [userId]);

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: 'Failed to retrieve updated user data' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Add Multer middleware for profile image uploads
app.post(
  "/api/user/profile/upload/:id",
  upload.single("profileImage"),
  async (req, res) => {
    const userId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const imagePath = `profile_images/${req.file.filename}`; // Store relative path

    try {
      // Update the user's profile image path in the database
      const updateQuery =
        "UPDATE appuser SET ProfileImagePath = ? WHERE UserID = ?";
      await db.promise().query(updateQuery, [imagePath, userId]);

      res.status(200).json({
        message: "Profile image uploaded successfully",
        imagePath: imagePath, // Send back the relative path
      });
    } catch (error) {
      console.error("Error updating profile image path in DB:", error);
      res.status(500).json({ message: "Failed to update profile image." });
    }
  }
);

// Delete profile image endpoint
app.delete('/api/user/profile/image/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // Get the current image path to delete the file from the server
    const [results] = await db.promise().query('SELECT ProfileImagePath FROM appuser WHERE UserID = ?', [userId]);
    if (results.length > 0 && results[0].ProfileImagePath) {
      const filePath = path.join(__dirname, 'uploads', results[0].ProfileImagePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting old profile image file:', err);
          // Continue even if file deletion fails, as DB update is more critical
        }
      });
    }

    // Update the database to remove the profile image path
    const updateQuery = 'UPDATE appuser SET ProfileImagePath = NULL WHERE UserID = ?';
    await db.promise().query(updateQuery, [userId]);

    res.status(200).json({ message: 'Profile image removed successfully' });
  } catch (error) {
    console.error('Error removing profile image:', error);
    res.status(500).json({ message: 'Failed to remove profile image.' });
  }
});

/* ------------------------- Add Members ------------------------- */



/*---------------------- Invite User via Email ----------------------*/

// --- ADDED: FORGOT PASSWORD ENDPOINT ---

app.use('/', authPasswordRoutes);

/*----------------------------------------------*/

// --- ADDED: RESET PASSWORD ENDPOINT ---
app.use('/', authResetRoutes);

/*---------------------------------------------------------------------------------------*/
// Socket.io connection
io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("joinTicketRoom", (ticketID) => {
    socket.join(ticketID.toString());
    console.log(`Socket ${socket.id} joined room ${ticketID}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Helper to detect image files
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].includes(ext);
}

// Helper function to create chat notifications
const createChatNotification = async (ticketId, senderUserId, senderRole, messageContent, messageType) => {
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

// GET messages for ticket
app.get("/messages/:ticketId", (req, res) => {
  const ticketId = req.params.ticketId;
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
});


// POST message (text or file) - single endpoint for both user/admin
app.post("/ticketchat", upload.single("file"), (req, res) => {
  const { TicketID, Type, Note, UserID, Role } = req.body;
  const file = req.file;

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

    // Create notification for chat message if sent by admin/supervisor
    createChatNotification(TicketID, UserID, Role, Note, Type || "text");

    res.status(201).json({
      message: "Chat message added",
      chatId: result.insertId,
      file: newMessage.file || null,
    });
  });
});

// User-specific endpoints
app.post("/api/ticketchatUser", upload.single("file"), (req, res) => {
  const { TicketID, Type, Note, UserID, Role } = req.body;
  const file = req.file;

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

    // Create notification for chat message when users send messages to admins/supervisors
    createChatNotification(TicketID, UserID, Role || "User", Note, Type || "text");

    res.status(201).json({
      message: "Message saved",
      chatId: result.insertId,
      file: newMessage.file,
    });
  });
});

app.get("/api/ticketchatUser/:ticketID", (req, res) => {
  const ticketID = req.params.ticketID;
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
});

// File download endpoint
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/uploads/profile_images/", filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(404).send("File not found.");
    }
  });
});

// Mark messages as seen
app.post("/ticketchat/markSeen", (req, res) => {
  const { TicketID, Role } = req.body;
  if (!TicketID || !Role) return res.status(400).json({ error: "TicketID and Role required" });

  // First, get the current user's ID based on the role and ticket
  let getUserIdQuery;
  let getUserIdParams;

  if (Role === 'User' || Role === 'Client') {
    getUserIdQuery = `SELECT UserId as UserID FROM ticket WHERE TicketID = ?`;
    getUserIdParams = [TicketID];
  } else if (Role === 'Admin' || Role === 'Supervisor') {
    // For admin/supervisor, we need to get their user ID from session or request
    // For now, we'll mark all admin/supervisor notifications for this ticket as read
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

  db.query(sql, [TicketID, Role], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update seen status" });

    // Now update related notifications as read
    if (Role === 'User' || Role === 'Client') {
      // User/Client is marking admin/supervisor messages as seen
      // So mark notifications sent TO this user as read
      const updateNotificationsSql = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE TicketLogID = ? 
        AND Type = 'NEW_CHAT_MESSAGE' 
        AND UserID = (SELECT UserId FROM ticket WHERE TicketID = ?)
        AND IsRead = FALSE
      `;

      db.query(updateNotificationsSql, [TicketID, TicketID], (notifErr, notifResult) => {
        if (notifErr) {
          console.error('Error updating chat notifications:', notifErr);
        } else {
          console.log(`Updated ${notifResult.affectedRows} chat notifications as read for ticket ${TicketID}`);

          // Get the user ID to emit notification update
          db.query(getUserIdQuery, getUserIdParams, (userErr, userResults) => {
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
      // So mark notifications sent TO admins/supervisors as read
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

      db.query(updateNotificationsSql, [TicketID, TicketID], (notifErr, notifResult) => {
        if (notifErr) {
          console.error('Error updating chat notifications:', notifErr);
        } else {
          console.log(`Updated ${notifResult.affectedRows} chat notifications as read for ticket ${TicketID}`);

          // Get all admin/supervisor user IDs to emit notification updates
          db.query(getUserIdQuery, getUserIdParams, (userErr, userResults) => {
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
});

// Enhanced mark messages as seen with specific user ID
app.post("/ticketchat/markSeen/user", (req, res) => {
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

  db.query(sql, [TicketID, Role], (err, result) => {
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

    db.query(updateNotificationsSql, [TicketID, UserID], (notifErr, notifResult) => {
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
});

/*-------------------------------Fetch Requests-----------------------------------------*/
// Route: Get tickets assigned to a specific supervisor

// Get tickets assigned to a specific supervisor (by UserID in appuser)
app.get("/tickets", (req, res) => {
  const { supervisorId, role } = req.query;

  // Role is required
  if (!role) {
    return res.status(400).json({ error: "User role is required" });
  }

  // Admin: Return all tickets
  if (role === "Admin") {
    const sql = `SELECT 
                    t.*, 
                    asys.SystemName AS AsipiyaSystemName, 
                    u.FullName AS UserName
                    FROM ticket t
                    LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
                    LEFT JOIN appuser u ON t.UserId = u.UserID`;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching all tickets:", err);
        return res.status(500).json({ error: "Error fetching tickets" });
      }
      return res.json(results);
    });
  }

  // Supervisor: Return only their tickets
  else if (role === "Supervisor") {
    if (!supervisorId) {
      return res.status(400).json({ error: "Supervisor ID is required for supervisors" });
    }

    const sql = `SELECT 
                        t.*, 
                        asys.SystemName AS AsipiyaSystemName, 
                        u.FullName AS UserName
                        FROM ticket t
                        LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
                        LEFT JOIN appuser u ON t.UserId = u.UserID
                        WHERE t.SupervisorID = ?`;

    db.query(sql, [supervisorId], (err, results) => {
      if (err) {
        console.error("Error fetching supervisor's tickets:", err);
        return res.status(500).json({ error: "Error fetching tickets" });
      }
      return res.json(results);
    });
  }

  // If the role is invalid
  else {
    return res.status(400).json({ error: "Invalid role specified" });
  }
});

app.get("/getting/tickets", (req, res) => {
  const { supervisorId, systemId } = req.query;

  let sql = `
    SELECT 
      t.*, 
      asys.SystemName AS AsipiyaSystemName, 
      u.FullName AS UserName
    FROM ticket t
    LEFT JOIN asipiyasystem asys ON t.AsipiyaSystemID = asys.AsipiyaSystemID
    LEFT JOIN appuser u ON t.UserId = u.UserID
    WHERE 1 = 1
  `;

  const params = [];

  if (supervisorId && supervisorId !== "all") {
    const supId = parseInt(supervisorId, 10);
    if (isNaN(supId)) {
      return res.status(400).json({ error: "Invalid supervisor ID" });
    }
    sql += " AND FIND_IN_SET(?, t.SupervisorID)";
    params.push(supId);
  }

  if (systemId && systemId !== "all") {
    const sysId = parseInt(systemId, 10);
    if (isNaN(sysId)) {
      return res.status(400).json({ error: "Invalid system ID" });
    }
    sql += " AND t.AsipiyaSystemID = ?";
    params.push(sysId);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching tickets:", err);
      return res.status(500).json({ error: "Error fetching tickets" });
    }
    res.json(results);
  });
});


app.put('/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { status, dueDate, resolution } = req.body;

  // Build the SET clause dynamically
  const fields = [];
  const values = [];

  if (status !== undefined) {
    fields.push("Status = ?");
    values.push(status);
  }

  if (dueDate !== undefined) {
    fields.push("DueDate = ?");
    values.push(dueDate);
  }

  if (resolution !== undefined) {
    fields.push("Resolution = ?");
    values.push(resolution);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields provided to update." });
  }

  const sql = `UPDATE ticket SET ${fields.join(', ')} WHERE TicketID = ?`;
  values.push(id); // Add id to the end of values array for WHERE clause

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Failed to update ticket:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Ticket updated successfully" });
  });
});
//--------------------------------
app.get("/evidence/:ticketId", (req, res) => {
  const { ticketId } = req.params;

  const sql = "SELECT FilePath FROM evidence WHERE ComplaintID = ?";
  db.query(sql, [ticketId], (err, result) => {
    if (err) {
      console.error("Error fetching evidence:", err);
      return res.status(500).json({ error: "Failed to fetch evidence" });
    }
    res.json(result);
  });
});

app.get("/supervisors", (req, res) => {
  const sql = "SELECT UserID, FullName FROM appuser WHERE Role = 'Supervisor'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching supervisors:", err);
      return res.status(500).json({ error: "Error fetching supervisors" });
    }
    res.json(results);
  });
});

app.get("/asipiyasystems", (req, res) => {
  const sql = "SELECT AsipiyaSystemID, SystemName FROM asipiyasystem";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching systems:", err);
      return res.status(500).json({ error: "Error fetching systems" });
    }
    res.json(results);
  });
});

//nope
app.get("/tickets", (req, res) => {
  const query = `
    SELECT * 
    FROM ticket 
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching tickets for supervisor:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(results);
  });
});

// Add this to your existing Node.js/Express backend
app.put('/tickets/accept/:ticketID', (req, res) => {
  const { ticketID } = req.params;

  db.query('UPDATE ticket SET Status = "Accepted" WHERE TicketID = ?', [ticketID], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.json({ message: "Ticket accepted successfully" });
  });
});

/*---------------------------------------------------------------------------------------*/



//View ticket details
app.get('/api/ticket_view/:id', (req, res) => {
  const ticketId = req.params.id;

  const ticketQuery = `
    SELECT 
      t.TicketID,
      u.FullName AS UserName,
      u.Email AS UserEmail,    
      s.SystemName,
      c.CategoryName,
      t.Description,
      t.DateTime,
      t.Status,
      t.Priority,
      t.FirstRespondedTime,
      t.LastRespondedTime,
      t.TicketDuration,
      t.UserNote,
      t.SupervisorID
    FROM ticket t
    JOIN appuser u ON t.UserId = u.UserID
    JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    WHERE t.TicketID = ?
  `;

  db.query(ticketQuery, [ticketId], (err, results) => {
    if (err) {
      console.error("Error in ticket_view query:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticket = results[0];

    // ✅ FIX: Use SupervisorID from DB result, not supervisor_id
    const supervisorIds = ticket.SupervisorID
      ? ticket.SupervisorID.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];

    if (supervisorIds.length === 0) {
      return res.status(200).json({ ...ticket, supervisor_id: [], supervisor_name: null });
    }

    const placeholders = supervisorIds.map(() => '?').join(',');
    const nameQuery = `SELECT UserID, FullName FROM appuser WHERE UserID IN (${placeholders})`;

    db.query(nameQuery, supervisorIds, (err, nameResults) => {
      if (err) {
        console.error("Error fetching supervisor names:", err);
        return res.status(500).json({ error: "Error fetching supervisor names" });
      }

      const fullNames = nameResults.map(row => row.FullName);

      // ✅ Append parsed supervisor info to response
      res.json({
        ...ticket,
        supervisor_id: supervisorIds,
        supervisor_name: fullNames.join(', '),
      });
    });
  });
});

// PUT: Update supervisors for a ticket
app.put("/update-supervisors/:id", async (req, res) => {
  const { id } = req.params;
  const { supervisorIds, currentUserId } = req.body; // Add currentUserId to get who is making the change

  console.log("Received ticket ID:", id);
  console.log("Received supervisor IDs:", supervisorIds);
  console.log("Current User ID:", currentUserId);

  // Validate input
  if (!Array.isArray(supervisorIds) || supervisorIds.length === 0) {
    return res.status(400).json({ error: "At least one supervisor is required." });
  }

  // Clean and format supervisor IDs
  const validSupervisorIds = supervisorIds
    .map(id => parseInt(id))
    .filter(id => !isNaN(id) && id > 0);

  if (validSupervisorIds.length === 0) {
    return res.status(400).json({ error: "No valid supervisor IDs provided." });
  }

  try {
    // Get current ticket data and old supervisors
    const getTicketQuery = `
      SELECT SupervisorID, UserId as ticketCreatorId 
      FROM ticket 
      WHERE TicketID = ?
    `;

    const currentTicketData = await new Promise((resolve, reject) => {
      db.query(getTicketQuery, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    if (!currentTicketData) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    const oldSupervisorIds = currentTicketData.SupervisorID
      ? currentTicketData.SupervisorID.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];

    const newSupervisorIds = validSupervisorIds;
    const ticketCreatorId = currentTicketData.ticketCreatorId;

    // Find added and removed supervisors
    const addedSupervisorIds = newSupervisorIds.filter(id => !oldSupervisorIds.includes(id));
    const removedSupervisorIds = oldSupervisorIds.filter(id => !newSupervisorIds.includes(id));

    console.log("Old supervisors:", oldSupervisorIds);
    console.log("New supervisors:", newSupervisorIds);
    console.log("Added supervisors:", addedSupervisorIds);
    console.log("Removed supervisors:", removedSupervisorIds);

    // Get current user information
    let currentUserName = 'System';
    let currentUserRole = 'System';
    if (currentUserId) {
      const getCurrentUserQuery = `SELECT FullName, Role FROM appuser WHERE UserID = ?`;
      const currentUserResult = await new Promise((resolve, reject) => {
        db.query(getCurrentUserQuery, [currentUserId], (err, results) => {
          if (err) reject(err);
          else resolve(results[0] || null);
        });
      });

      if (currentUserResult) {
        currentUserName = currentUserResult.FullName;
        currentUserRole = currentUserResult.Role;
      }
    }

    // Update the ticket table
    const supervisorIdString = validSupervisorIds.join(",");
    await new Promise((resolve, reject) => {
      db.query("UPDATE ticket SET SupervisorID = ? WHERE TicketID = ?", [supervisorIdString, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Get supervisor names for notifications
    const getSupervisorNamesQuery = `
      SELECT UserID, FullName 
      FROM appuser 
      WHERE UserID IN (${[...addedSupervisorIds, ...removedSupervisorIds].map(() => '?').join(',')})
    `;

    let supervisorNames = {};
    if (addedSupervisorIds.length > 0 || removedSupervisorIds.length > 0) {
      const nameResults = await new Promise((resolve, reject) => {
        db.query(getSupervisorNamesQuery, [...addedSupervisorIds, ...removedSupervisorIds], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      nameResults.forEach(supervisor => {
        supervisorNames[supervisor.UserID] = supervisor.FullName;
      });
    }

    // Create logs and notifications for changes
    if (addedSupervisorIds.length > 0) {
      const addedNames = addedSupervisorIds.map(id => supervisorNames[id] || `Supervisor ${id}`);
      const logDescription = `added supervisors: ${addedNames.join(', ')}`;

      const logResult = await createTicketLog(
        id,
        'SUPERVISOR_ADDED',
        logDescription,
        currentUserId,
        null, // No old value to display in log message
        null, // No new value to display in log message
        null // Let createTicketLog handle the note
      );

      // Notify ticket creator about added supervisors
      if (ticketCreatorId) {
        await createNotification(
          ticketCreatorId,
          `New supervisors added to your ticket #${id}: ${addedNames.join(', ')} by ${currentUserName}`,
          'SUPERVISOR_ADDED',
          logResult.insertId,
          id
        );
      }

      // Notify newly added supervisors
      for (const supervisorId of addedSupervisorIds) {
        await createNotification(
          supervisorId,
          `You have been assigned to ticket #${id} by ${currentUserName}`,
          'SUPERVISOR_ASSIGNED',
          logResult.insertId,
          id
        );
      }
    }

    if (removedSupervisorIds.length > 0) {
      const removedNames = removedSupervisorIds.map(id => supervisorNames[id] || `Supervisor ${id}`);
      const logDescription = `removed supervisors: ${removedNames.join(', ')}`;

      const logResult = await createTicketLog(
        id,
        'SUPERVISOR_REMOVED',
        logDescription,
        currentUserId,
        null, // No old value to display in log message
        null, // No new value to display in log message
        null // Let createTicketLog handle the note
      );

      // Notify ticket creator about removed supervisors
      if (ticketCreatorId) {
        await createNotification(
          ticketCreatorId,
          `Supervisors removed from your ticket #${id}: ${removedNames.join(', ')} by ${currentUserName}`,
          'SUPERVISOR_REMOVED',
          logResult.insertId,
          id
        );
      }

      // Notify removed supervisors
      for (const supervisorId of removedSupervisorIds) {
        await createNotification(
          supervisorId,
          `You have been removed from ticket #${id} by ${currentUserName}`,
          'SUPERVISOR_UNASSIGNED',
          logResult.insertId,
          id
        );
      }
    }

    console.log("Supervisors updated successfully");
    res.json({ message: "Supervisors updated successfully" });

  } catch (error) {
    console.error("Error updating supervisors:", error);
    res.status(500).json({ error: "Failed to update supervisors." });
  }
});





app.get('/api/supervisors', (req, res) => {
  const query = `
    SELECT UserID, FullName FROM appuser 
    WHERE Role IN ('supervisor')
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching supervisors:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("Supervisor result:", results); // Add this
    res.json(results); // Make sure it's just `results`, not wrapped in an object
  });
});

// Helper function to create a ticket log
const createTicketLog = async (ticketId, type, description, userId, oldValue, newValue, note = null) => {
  return new Promise(async (resolve, reject) => {
    let userName = 'System';
    if (userId) {
      try {
        const [userResult] = await db.promise().query('SELECT FullName FROM appuser WHERE UserID = ?', [userId]);
        if (userResult.length > 0) {
          userName = userResult[0].FullName;
        }
      } catch (userErr) {
        console.error("Error fetching user name for ticket log:", userErr);
        // Continue even if user name fetch fails
      }
    }

    const logQuery = `
            INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID, OldValue, NewValue, Note)
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
        `;

    const finalDescription = `${userName} ${description}`;
    const finalNote = note ? `${note} by ${userName}` : `Updated by ${userName}`;

    db.query(logQuery, [
      ticketId,
      type,
      finalDescription,
      userId,
      oldValue,
      newValue,
      finalNote
    ], (err, result) => {
      if (err) {
        console.error("Error creating ticket log:", err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

// In the status change handler:
app.put('/api/tickets/:ticketId/status', async (req, res) => {
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
});

// Update ticket priority
app.put('/api/tickets/:ticketId/priority', async (req, res) => {
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
});

// Add comment to ticket
app.post('/api/tickets/:ticketId/comments', commentAttachmentUpload.array('file', 10), async (req, res) => { // Changed to 'file' to match frontend
  const { ticketId } = req.params;
  let { userId, comment, mentionedUserIds, replyToCommentId } = req.body; // Added replyToCommentId

  try {
    // Process mentions: Extract mentioned user IDs
    let processedMentions = [];

    if (mentionedUserIds && typeof mentionedUserIds === 'string') {
      processedMentions = mentionedUserIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }

    // IMPORTANT: Storing the original comment text (including @mentions) in CommentText for display.
    // The mentioned user IDs are still separately stored in the Mentions column.

    const sql = `
      INSERT INTO comments (TicketID, UserID, CommentText, Mentions, ReplyToCommentID)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await db.promise().query(sql, [
      ticketId,
      userId,
      comment.trim(), // Store original comment text
      processedMentions.length > 0 ? processedMentions.join(',') : null, // Store only user IDs
      replyToCommentId || null
    ]);

    const newCommentId = result[0].insertId;

    // Handle multiple file attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const attachmentFilePath = path.join('uploads', 'comment_attachments', file.filename).replace(/\\/g, '/');
        const attachmentFileName = file.originalname;
        const attachmentFileType = file.mimetype;

        const attachmentSql = `
          INSERT INTO comment_attachments (CommentID, FilePath, FileName, FileType)
          VALUES (?, ?, ?, ?)
        `;
        await db.promise().query(attachmentSql, [
          newCommentId,
          attachmentFilePath,
          attachmentFileName,
          attachmentFileType
        ]);
      }
    }

    // IMPORTANT: Log and notify asynchronously after sending success response
    // This ensures the frontend gets a success message even if logging/notifications fail.
    // Errors in this section will be logged on the server but won't block the frontend response.
    res.status(201).json({
      message: 'Comment added successfully',
      commentId: newCommentId
    });

    // Perform logging and notifications AFTER sending the response
    try {
      // Add to ticketlog
      const logSql = `
        INSERT INTO ticketlog (TicketID, DateTime, Type, Description, UserID) 
        VALUES (?, NOW(), 'COMMENT', ?, ?)
      `;
      // Fetch user's name for the log description
      const [userResult] = await db.promise().query('SELECT FullName FROM appuser WHERE UserID = ?', [userId]);
      const userName = userResult.length > 0 ? userResult[0].FullName : 'Unknown User';

      const logDescription = `added a comment: "${comment.substring(0, 100)}..."`; // Use original comment for log description
      await createTicketLog(ticketId, 'COMMENT', logDescription, userId, null, null, null); // Use createTicketLog

      // Notify mentioned users
      if (processedMentions.length > 0) {
        for (const mentionedUserId of processedMentions) {
          // Exclude the user who made the comment from receiving a mention notification for their own comment
          if (mentionedUserId !== parseInt(userId)) { // Ensure userId is compared as a number
            await createNotification(
              mentionedUserId,
              `You were mentioned in a comment on ticket #${ticketId} by ${userName}`,
              'MENTION',
              newCommentId // Link notification to the new comment
            );
          }
        }
      }
    } catch (logOrNotifyError) {
      console.error('Error during post-comment logging or notification:', logOrNotifyError);
      // Do not send an error response to frontend here, as the comment itself was saved.
    }

  } catch (err) {
    console.error('Error adding comment (main flow):', err);
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload_evidence = multer({ storage: storage });

app.post("/upload_evidence", upload_evidence.array("evidenceFiles"), (req, res) => {
  const { ticketId, description } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  if (!ticketId) {
    return res.status(400).json({ message: "Ticket ID is required" });
  }

  const values = req.files.map((file) => [ticketId, file.path, description]);

  const insertEvidenceQuery = `
    INSERT INTO evidence (ComplaintID, FilePath, Description) VALUES ?
  `;

  db.query(insertEvidenceQuery, [values], (err, result) => {
    if (err) {
      console.error("Error inserting evidence:", err);
      return res.status(500).json({ message: "Error saving evidence" });
    }
    res
      .status(200)
      .json({
        message: "Evidence files uploaded",
        inserted: result.affectedRows,
      });
  });
});

//user ticket view
app.get("/userTickets", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const sql = `
    SELECT 
      t.TicketID AS id,
      t.Description AS description,
      t.Status AS status,
      a.SystemName AS system_name,
      c.CategoryName AS category,
      t.DateTime AS datetime,
      t.SupervisorID AS supervisor_id,
      u.FullName AS supervisor_name
    FROM ticket t
    JOIN asipiyasystem a ON t.AsipiyaSystemID = a.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    LEFT JOIN appUser u ON t.SupervisorID = u.UserID
    WHERE t.UserID = ?
    ORDER BY t.DateTime DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching tickets:", err);
      return res.status(500).json({ message: "Error fetching tickets" });
    }
    res.status(200).json(results);
  });
});

app.get("/userTicket/:ticketId", (req, res) => {
  const { ticketId } = req.params;
  const sql = `
    SELECT 
      t.TicketID AS id,
      t.Description AS description,
      t.Status AS status,
      a.SystemName AS system_name,
      c.CategoryName AS category,
      t.DateTime AS datetime,
      t.SupervisorID AS supervisor_id,
      t.LastRespondedTime
    FROM ticket t
    JOIN asipiyasystem a ON t.AsipiyaSystemID = a.AsipiyaSystemID
    JOIN ticketcategory c ON t.TicketCategoryID = c.TicketCategoryID
    WHERE t.TicketID = ?
  `;

  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error("Error fetching ticket:", err);
      return res.status(500).json({ message: "Error fetching ticket" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticket = results[0];
    const supervisorIds = ticket.supervisor_id
      ? ticket.supervisor_id.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];

    if (supervisorIds.length === 0) {
      return res.status(200).json({ ...ticket, supervisor_name: null });
    }

    const placeholders = supervisorIds.map(() => '?').join(',');
    const nameQuery = `SELECT UserID, FullName FROM appuser WHERE UserID IN (${placeholders})`;

    db.query(nameQuery, supervisorIds, (err, nameResults) => {
      if (err) {
        console.error("Error fetching supervisor names:", err);
        return res.status(500).json({ message: "Error fetching supervisor names" });
      }

      const names = nameResults.map(row => row.FullName);
      res.status(200).json({ ...ticket, supervisor_name: names.join(', ') });
    });
  });
});


//User view evidence by ticketId
app.get('/api/evidence/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM evidence WHERE ComplaintID = ?',
      [ticketId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching evidence:', err);
    res.status(500).json({ message: 'Failed to fetch evidence' });
  }
});

// API endpoint to fetch ticket counts
app.get('/api/tickets/counts', (req, res) => {
  const queries = {
    total: 'SELECT COUNT(*) AS count FROM ticket',
    open: "SELECT COUNT(*) AS count FROM ticket WHERE Status IN ('Open', 'In Progress') AND Status != 'Rejected'",
    today: "SELECT COUNT(*) AS count FROM ticket WHERE DATE(DateTime) = CURDATE()",
    highPriority: "SELECT COUNT(*) AS count FROM ticket WHERE Priority = 'High' AND Status != 'Rejected'",
    resolved: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Resolved'",
    pending: "SELECT COUNT(*) AS count FROM ticket WHERE Status = 'Pending'"
  };

  const results = {};
  let completed = 0;

  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, result) => {
      if (err) {
        console.error(`Error fetching ${key} count:`, err);
        return res.status(500).json({ error: `Failed to fetch ${key} ticket count` });
      }

      results[key] = result[0].count;
      completed++;

      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// API endpoint to fetch filtered tickets  
app.get('/api/tickets/filter', (req, res) => {
  const { type, company, system } = req.query; // <-- ADD company, system

  let baseQuery = `
        SELECT 
            t.TicketID,
            u.FullName AS UserName,
            c.CompanyName AS CompanyName,
            s.SystemName AS SystemName,
            t.Description,
            t.Status,
            t.Priority,
            t.DateTime
        FROM ticket t
        LEFT JOIN appuser u ON t.UserId = u.UserID
        LEFT JOIN client c ON u.Email = c.ContactPersonEmail
        LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    `;

  let whereClause = [];
  let orderClause = 'ORDER BY t.DateTime DESC';

  // Type-based filter
  switch (type) {
    case 'pending':
      whereClause.push("t.Status = 'Pending'");
      break;
    case 'open':
      whereClause.push("t.Status IN ('Open', 'In Progress') AND t.Status != 'Rejected'");
      break;
    case 'today':
      whereClause.push("DATE(t.DateTime) = CURDATE()");
      break;
    case 'high-priority':
      whereClause.push("t.Status != 'Rejected'");
      orderClause = "ORDER BY FIELD(t.Priority, 'High', 'Medium', 'Low'), t.DateTime DESC";
      break;
    case 'resolved':
      whereClause.push("t.Status = 'Resolved'");
      break;
  }

  // Company filter
  if (company && company !== 'all') {
    whereClause.push("c.CompanyName = " + db.escape(company));
  }
  // System filter
  if (system && system !== 'all') {
    whereClause.push("s.SystemName = " + db.escape(system));
  }

  const finalWhere = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
  const query = `${baseQuery} ${finalWhere} ${orderClause}`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching filtered tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
});

// API endpoint to fetch ticket status distribution
app.get('/api/tickets/status-distribution', (req, res) => {
  const query = `
        SELECT 
            SUM(CASE WHEN Priority = 'High' THEN 1 ELSE 0 END) AS high,
            SUM(CASE WHEN Priority = 'Medium' THEN 1 ELSE 0 END) AS medium,
            SUM(CASE WHEN Priority = 'Low' THEN 1 ELSE 0 END) AS low
        FROM ticket;
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching ticket status distribution:', err);
      res.status(500).json({ error: 'Failed to fetch ticket status distribution' });
      return;
    }

    res.json(results[0]);
  });
});

// API endpoint to fetch the last 6 ticket log activities
app.get('/api/tickets/recent-activities', (req, res) => {
  const query = `
        SELECT 
            tl.TicketID,
            tl.DateTime,
            tl.Type,
            tl.Description
        FROM ticketlog tl
        ORDER BY tl.DateTime DESC
        LIMIT 6
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching recent ticket log activities:', err);
      return res.status(500).json({ error: 'Failed to fetch recent ticket log activities' });
    }
    res.json(results);
  });
});

// API endpoint to fetch tickets
app.get('/api/tickets', (req, res) => {
  const query = `
        SELECT 
            t.TicketID, 
            u.FullName AS UserName, 
            t.Description, 
            t.Status, 
            t.Priority, 
            t.UserNote
        FROM 
            tickets t
        LEFT JOIN 
            appuser u 
        ON 
            t.UserID = u.UserID
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
});

// API endpoint to fetch ticket counts by system
app.get('/api/tickets/system-distribution', (req, res) => {
  const query = `
        SELECT 
            s.SystemName,
            COUNT(t.TicketID) as TicketCount
        FROM asipiyasystem s
        LEFT JOIN ticket t ON s.AsipiyaSystemID = t.AsipiyaSystemID
        GROUP BY s.SystemName
        ORDER BY TicketCount DESC;
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching ticket system distribution:', err);
      res.status(500).json({ error: 'Failed to fetch ticket system distribution' });
      return;
    }
    res.json(results);
  });
});

// Update endpoint for recent users
app.get('/api/users/recent', (req, res) => {
  const query = `
        SELECT DISTINCT 
            u.UserID,
            u.FullName,
            u.ProfileImagePath,
            EXISTS(
                SELECT 1 
                FROM ticket t 
                WHERE t.UserId = u.UserID 
                AND t.Status = 'Pending'
            ) as hasPendingTicket
        FROM appuser u
        WHERE u.Role = 'User'
        ORDER BY u.UserID DESC
        LIMIT 5
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching recent users:', err);
      return res.status(500).json({ error: 'Failed to fetch recent users' });
    }
    res.json(results);
  });
});

/*-------------------------------NOTIFICATIONS---------------------------------------------------*/

// API endpoint to get unread notifications count
app.get('/api/notifications/count/:id', (req, res) => {
  const userId = req.params.id;
  const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE UserID = ? AND IsRead = FALSE
    `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching notification count:', err);
      return res.status(500).json({ error: 'Failed to fetch notification count' });
    }
    res.json({ count: results[0].count });
  });
});

// API endpoint to get user's notifications
app.get('/api/notifications/:userId', (req, res) => {
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

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json(results);
  });
});

// API endpoint to mark notifications as read
app.put('/api/notifications/read', (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ error: 'Notification IDs array is required' });
  }

  const query = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE NotificationID IN (?)
    `;

  db.query(query, [notificationIds], (err, result) => {
    if (err) {
      console.error('Error marking notifications as read:', err);
      return res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
    res.json({ message: 'Notifications marked as read', updatedCount: result.affectedRows });
  });
});

// ADDED: API endpoint to mark all notifications for a user as read
app.put('/api/notifications/read-all/:userId', (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
        UPDATE notifications 
        SET IsRead = TRUE 
        WHERE UserID = ? AND IsRead = FALSE
    `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error marking all notifications as read:', err);
      return res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
    res.json({ message: 'All notifications marked as read', updatedCount: result.affectedRows });
  });
});

// API endpoint to send status update notifications to admins and supervisors
app.post('/api/notifications/status-update', async (req, res) => {
  try {
    const { ticketId, updatedByUserId, oldStatus, newStatus } = req.body;

    // Get ticket information
    const ticketQuery = 'SELECT * FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      db.query(ticketQuery, [ticketId], (err, result) => {
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
      db.query(updaterQuery, [updatedByUserId], (err, result) => {
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
      db.query(supervisorQuery, [ticketId], (err, result) => {
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
});

// API endpoint to send resolution update notifications to admins and supervisors
app.post('/api/notifications/resolution-update', async (req, res) => {
  try {
    const { ticketId, updatedByUserId, resolutionText } = req.body;

    // Get ticket information
    const ticketQuery = 'SELECT * FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      db.query(ticketQuery, [ticketId], (err, result) => {
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
      db.query(updaterQuery, [updatedByUserId], (err, result) => {
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
      db.query(supervisorQuery, [ticketId], (err, result) => {
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
});

// API endpoint to send due date update notifications to admins and supervisors
app.post('/api/notifications/due-date-update', async (req, res) => {
  try {
    const { ticketId, updatedByUserId, oldDueDate, newDueDate } = req.body;

    // Get ticket information
    const ticketQuery = 'SELECT * FROM ticket WHERE TicketID = ?';
    const ticketResult = await new Promise((resolve, reject) => {
      db.query(ticketQuery, [ticketId], (err, result) => {
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
      db.query(updaterQuery, [updatedByUserId], (err, result) => {
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
      db.query(supervisorQuery, [ticketId], (err, result) => {
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
});

/*------------------------------COUNT TICKETS----------------------------------------------------*/

// API endpoint to fetch ticket counts for a SPECIFIC USER
app.get('/api/user/tickets/counts/:userId', (req, res) => {
  const userId = req.params.userId;
  const queries = {
    total: 'SELECT COUNT(*) AS count FROM ticket WHERE Userid = ?',
    pending: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status = 'Pending'",
    resolved: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status IN ('Resolved', 'Rejected')",
    ongoing: "SELECT COUNT(*) AS count FROM ticket WHERE Userid = ? AND Status IN ('Open', 'In Progress')"
  };

  const results = {};
  const totalQueries = Object.keys(queries).length;

  const promises = Object.entries(queries).map(([key, query]) => {
    return new Promise((resolve, reject) => {
      db.query(query, [userId], (err, result) => {
        if (err) {
          console.error(`Error fetching user ${key} count:`, err);
          reject({ error: `Failed to fetch user ${key} ticket count` });
        } else {
          results[key] = result[0].count;
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json(results);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// API endpoint to fetch the last five activities for a SPECIFIC USER
app.get('/api/user/tickets/recent/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
        SELECT
            t.TicketID,
            t.Description,
            t.Status,
            t.Priority,
            t.DateTime,
            s.SystemName,       -- Added SystemName
            tc.CategoryName     -- Added CategoryName
        FROM ticket t
        LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
        LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
        WHERE t.UserId = ?
        ORDER BY t.DateTime DESC
        LIMIT 5
    `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user recent activities:', err);
      return res.status(500).json({ error: 'Failed to fetch user recent activities' });
    }
    res.json(results);
  });
});

/*----------------------------------------------------------------------------------*/

// Get user details by ID
app.get('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT 
      u.UserID,
      u.FullName,
      u.Email,
      u.Phone as ContactNo,
      u.ProfileImagePath,
      COUNT(t.TicketID) as TotalTickets,
      SUM(CASE WHEN t.Status = 'Closed' THEN 1 ELSE 0 END) as ClosedTickets,
      SUM(CASE WHEN t.Priority = 'High' THEN 1 ELSE 0 END) as HighPriorityTickets
    FROM appuser u
    LEFT JOIN ticket t ON u.UserID = t.UserId
    WHERE u.UserID = ?
    GROUP BY u.UserID
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Get user's tickets
app.get('/api/tickets/user/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT 
      t.TicketID,
      t.Description,
      t.Status,
      t.Priority,
      t.DateTime,
      t.TicketDuration as Duration,
      s.SystemName,
      tc.CategoryName
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID
    WHERE t.UserId = ?
    ORDER BY t.DateTime DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user tickets:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

/* ----------------------------------------------------------------------------------------------*/

// API endpoint to fetch tickets

app.get('/api/tickets', (req, res) => {
  const query = `
    SELECT t.TicketID, c.CompanyName AS Client, s.Description AS System, tc.Description AS Category, t.Status, t.Priority
    FROM ticket t
    LEFT JOIN client c ON t.UserId = c.ClientID
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN ticketcategory tc ON t.TicketCategoryID = tc.TicketCategoryID;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/pending_ticket', (req, res) => {
  const query = `
    SELECT 
      t.TicketID,
      s.SystemName AS SystemName,
      c.CompanyName AS CompanyName,
      u.FullName AS UserName,
      t.Status,
      t.DateTime
    FROM ticket t
    LEFT JOIN asipiyasystem s ON t.AsipiyaSystemID = s.AsipiyaSystemID
    LEFT JOIN appuser u ON t.UserId = u.UserID
    LEFT JOIN client c ON u.Email = c.ContactPersonEmail
    ORDER BY t.TicketID ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets' });
      return;
    }
    res.json(results);
  });
});


//Add systems
app.post('/api/systems', async (req, res) => {
  const { systemName, description, status } = req.body;

  const sql = 'INSERT INTO asipiyasystem (SystemName, Description , Status) VALUES (?, ?, ?)';
  db.query(sql, [systemName, description, status], async (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Send notification to supervisors, developers, and admins
    try {
      await sendNotificationsByRoles(
        ['Supervisor', 'Developer', 'Admin'],
        `New system added: ${systemName}`,
        'NEW_SYSTEM_ADDED'
      );
    } catch (error) {
      console.error('Error sending system registration notifications:', error);
    }

    res.status(200).json({ message: 'System registered successfully' });
  });
});

//View systems
app.get('/system_registration', (req, res) => {
  const sql = `
    SELECT
      s.*,
      CASE
        WHEN COUNT(t.TicketID) > 0 THEN 1
        ELSE 0
      END AS IsUsed
    FROM asipiyasystem s
    LEFT JOIN ticket t ON s.AsipiyaSystemID = t.AsipiyaSystemID
    GROUP BY
      s.AsipiyaSystemID, s.SystemName, s.Description, s.Status
    ORDER BY s.AsipiyaSystemID;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching system status:', err);
      return res.status(500).json({ message: 'Database error during status fetch' });
    }
    res.status(200).json(results);
  });
});

app.put('/api/system_registration_update/:id', (req, res) => {
  const { id } = req.params;
  const { systemName, description, status } = req.body;
  const sql = 'UPDATE asipiyasystem SET SystemName = ?, Description = ?, Status = ? WHERE AsipiyaSystemID = ?';

  db.query(sql, [systemName, description, status, id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Error updating system' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'System not found' });
    }

    res.status(200).json({ message: 'System updated successfully' });
  });
});


app.delete('/api/system_registration_delete/:id', (req, res) => {
  const { id } = req.params;

  const checkStatusSql = 'SELECT Status FROM asipiyasystem WHERE AsipiyaSystemID = ?';
  db.query(checkStatusSql, [id], (err, results) => {
    if (err) {
      console.error('Status check error:', err);
      return res.status(500).json({ error: 'Database error checking system status' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'System not found' });
    }

    const status = results[0].Status;
    if (status === 1) {
      return res.status(403).json({ message: 'Cannot delete active system (status = 1)' });
    }

    const deleteSql = 'DELETE FROM asipiyasystem WHERE AsipiyaSystemID = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Error deleting system' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'System not found' });
      }

      res.status(200).json({ message: 'System deleted successfully' });
    });
  });
});



//Adding Category
app.post('/api/ticket_category', async (req, res) => {
  const { CategoryName, Description, Status } = req.body;

  const sql = 'INSERT INTO ticketcategory (CategoryName, Description, Status) VALUES (?, ?, ?)';
  db.query(sql, [CategoryName, Description, Status], async (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Failed to add ticket category" });
    }

    try {
      await sendNotificationsByRoles(
        ['Supervisor', 'Developer', 'Admin'],
        `New ticket category added: ${CategoryName}`,
        'NEW_CATEGORY_ADDED'
      );
    } catch (error) {
      console.error('Error sending category addition notifications:', error);
    }

    res.status(200).json({
      message: 'Ticket category added successfully',
      categoryId: result.insertId
    });
  });
});

//View Categories
app.get('/ticket_category', (req, res) => {
  const sql = `
    SELECT
      tc.*,
      CASE
        WHEN COUNT(t.TicketID) > 0 THEN 1
        ELSE 0
      END AS IsUsed
    FROM ticketcategory tc
    LEFT JOIN ticket t
      ON tc.TicketCategoryID = t.TicketCategoryID
    GROUP BY
      tc.TicketCategoryID, tc.CategoryName, tc.Description, tc.Status
    ORDER BY tc.TicketCategoryID;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ message: 'Error fetching categories' });
    }
    res.status(200).json(results);
  });
});

app.put('/api/ticket_category_update/:id', (req, res) => {
  const { id } = req.params;
  const { CategoryName, Description, Status } = req.body;

  const sql = 'UPDATE ticketcategory SET CategoryName = ?, Description = ?, Status = ? WHERE TicketCategoryID = ?';
  db.query(sql, [CategoryName, Description, Status, id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Error updating category' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated successfully' });
  });
});


app.delete('/api/ticket_category_delete/:id', (req, res) => {
  const { id } = req.params;

  const checkSql = 'SELECT Status FROM ticketcategory WHERE TicketCategoryID = ?';
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error('Status check error:', err);
      return res.status(500).json({ error: 'Database error checking category usage' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Category in use and cannot be deleted' });
    }

    const status = results[0].Status;
    if (status === 1) {
      return res.status(403).json({ message: 'Cannot delete active system (status = 1)' });
    }

    const deleteSql = 'DELETE FROM ticketcategory WHERE TicketCategoryID = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Error deleting category' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(200).json({ message: 'Category deleted successfully' });
    });
  });
});

// API endpoint to update ticket status (including rejection)
// When a ticket is rejected, this endpoint will:
// 1. Update the ticket status to 'Rejected' with the provided reason
// 2. Create a ticket log entry for the rejection
// 3. Send a notification to the ticket creator with the rejection reason
app.put('/api/ticket_status/:id', async (req, res) => {
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
});

app.get("/download_evidence/:filename", (req, res) => {
  const filename = req.params.filename;

  // Ensure it resolves to the correct full path (prevents path traversal attacks)
  const filePath = path.resolve(__dirname, "../../uploads", filename);

  // Check if the file exists before attempting download
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).send("File not found.");
    }

    // Download the file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  });
});


/* ------------------------------NOTIFY ROLE BASED----------------------------------------------------------------*/

// Helper function to create a notification
const createNotification = async (userId, message, type, ticketLogId = null, ticketId = null) => {
  return new Promise((resolve, reject) => {
    let query, params;

    if (ticketLogId) {
      // If we have a ticketLogId, use the existing structure
      query = `
                INSERT INTO notifications (UserID, Message, Type, TicketLogID)
                VALUES (?, ?, ?, ?)
            `;
      params = [userId, message, type, ticketLogId];
    } else if (ticketId) {
      // If we only have a ticketId, we need to create a simple log entry first or handle it differently
      // For these notification types, we'll create a temporary log entry
      const createTempLogQuery = `
                INSERT INTO ticketlog (TicketID, Type, Description, UserID, CreatedAt)
                VALUES (?, ?, ?, ?, NOW())
            `;

      db.query(createTempLogQuery, [ticketId, type, message, userId || 1], (logErr, logResult) => {
        if (logErr) {
          console.error('Error creating temporary log:', logErr);
          reject(logErr);
          return;
        }

        // Now create the notification with the new log ID
        const notificationQuery = `
                    INSERT INTO notifications (UserID, Message, Type, TicketLogID)
                    VALUES (?, ?, ?, ?)
                `;
        db.query(notificationQuery, [userId, message, type, logResult.insertId], (err, result) => {
          if (err) {
            console.error('Error creating notification:', err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
      return;
    } else {
      // Original structure for notifications without tickets
      query = `
                INSERT INTO notifications (UserID, Message, Type, TicketLogID)
                VALUES (?, ?, ?, ?)
            `;
      params = [userId, message, type, null];
    }

    db.query(query, params, (err, result) => {
      if (err) {
        console.error('Error creating notification:', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Helper function to get users by roles
const getUsersByRoles = async (roles) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT UserID FROM appuser WHERE Role IN (?)';
    db.query(query, [roles], (err, results) => {
      if (err) {
        console.error('Error fetching users by roles:', err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Helper function to send notifications to users by roles
const sendNotificationsByRoles = async (roles, message, type, ticketLogId = null) => {
  try {
    const users = await getUsersByRoles(roles);
    const notifications = users.map(user =>
      createNotification(user.UserID, message, type, ticketLogId)
    );
    await Promise.all(notifications);
  } catch (error) {
    console.error('Error sending notifications by roles:', error);
  }
};

// Invite supervisor endpoint
app.post('/api/invite-supervisor', async (req, res) => {
  const { email, role } = req.body;

  // Generate invitation token
  const token = crypto.randomBytes(32).toString('hex');
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Invitation to Join as Supervisor',
    html: `
      <h2>You've been invited to join as a Supervisor</h2>
      <p>Please click the link below to complete your registration:</p>
      <a href="${process.env.FRONTEND_URL}/register?token=${token}&role=${role}">Complete Registration</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);

    // If inviting a supervisor, notify admins and existing supervisors
    if (role === 'Supervisor') {
      await sendNotificationsByRoles(
        ['Admin', 'Supervisor'],
        `New supervisor invitation sent to ${email}`,
        'NEW_SUPERVISOR_INVITED'
      );
    }

    res.json({ message: 'Invitation email sent successfully.' });
  } catch (mailErr) {
    console.error('Error sending invitation email:', mailErr);
    res.status(500).json({ message: 'Failed to send invitation email.' });
  }
});

// Assign supervisor to ticket endpoint
app.put('/api/tickets/:id/assign', (req, res) => {
  const ticketId = req.params.id;
  const { supervisorId, status, priority, assignerId } = req.body; // assignerId is received here

  console.log('Assign endpoint: Received:', { ticketId, supervisorId, status, priority, assignerId }); // Add this line

  if (!ticketId || !supervisorId || !assignerId) { // Assigner ID is required


    return res.status(400).json({
      error: 'Ticket ID, Supervisor ID, and Assigner ID are required'
    });
  }

  const supervisorIds = supervisorId.split(',').map(id => id.trim());
  const supervisorString = supervisorIds.join(',');

  db.query('SELECT Status, Priority, SupervisorID, UserId as ticketCreatorId FROM ticket WHERE TicketID = ?', [ticketId], async (err, currentTicketResults) => {
    if (err) {
      console.error('Error fetching current ticket details for assignment:', err);
      return res.status(500).json({ error: 'Server error while fetching ticket details' });
    }
    if (currentTicketResults.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const oldStatus = currentTicketResults[0].Status;
    const oldPriority = currentTicketResults[0].Priority;
    const oldSupervisorId = currentTicketResults[0].SupervisorID;
    const ticketCreatorId = currentTicketResults[0].ticketCreatorId; // Get ticket creator ID

    console.log('Assign endpoint: Old Supervisor ID from DB:', oldSupervisorId); // Add this line

    const updateQuery = `
            UPDATE ticket
            SET SupervisorID = ?,
                Status = ?,
                Priority = ?,
                LastRespondedTime = NOW(),
                FirstRespondedTime = COALESCE(FirstRespondedTime, NOW())
            WHERE TicketID = ?
        `;

    db.query(updateQuery, [supervisorString, status, priority, ticketId], async (err, result) => {
      if (err) {
        console.error('Error updating ticket during assignment:', err);
        return res.status(500).json({
          error: 'Failed to assign supervisor',
          message: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Ticket not found'
        });
      }

      try {
        // Get all supervisor IDs as an array
        const supervisorIds = supervisorString.split(',').map(id => id.trim()).filter(Boolean);
        const oldSupervisorIds = (oldSupervisorId || '').split(',').map(id => id.trim()).filter(Boolean);

        // Fetch names for all supervisors and assigner
        let getAllNamesQuery = `SELECT UserID, FullName FROM appuser WHERE `;
        const queryParams = [];
        const conditions = [];

        // Add new supervisor IDs
        if (supervisorIds.length > 0) {
          conditions.push(`UserID IN (${supervisorIds.map(() => '?').join(',')})`);
          queryParams.push(...supervisorIds);
        }

        // Add old supervisor IDs if they exist
        if (oldSupervisorIds.length > 0) {
          conditions.push(`UserID IN (${oldSupervisorIds.map(() => '?').join(',')})`);
          queryParams.push(...oldSupervisorIds);
        }

        // Add assigner ID if it exists
        if (assignerId) {
          conditions.push(`UserID = ?`);
          queryParams.push(assignerId);
        }

        getAllNamesQuery += conditions.join(' OR ');

        const allNamesResult = await new Promise((resolve, reject) => {
          db.query(getAllNamesQuery, queryParams, (err, results) => {
            if (err) reject(err);
            else resolve(results || []);
          });
        });

        // Create name mappings
        const nameMap = {};
        if (allNamesResult) {
          allNamesResult.forEach(user => {
            nameMap[user.UserID] = user.FullName;
          });
        }

        const newSupervisorNames = supervisorIds.map(id => nameMap[id] || `User ${id}`);
        const oldSupervisorNames = oldSupervisorIds.map(id => nameMap[id] || `User ${id}`);
        const assignerName = assignerId ? (nameMap[assignerId] || 'Unknown') : 'System';

        console.log('Assign endpoint: New supervisor names:', newSupervisorNames);
        console.log('Assign endpoint: Old supervisor names:', oldSupervisorNames);
        console.log('Assign endpoint: Assigner name:', assignerName);

        // Track what changed for a single comprehensive notification
        const changes = [];
        let logResults = [];

        // Log supervisor change if it occurred
        if (oldSupervisorId != supervisorString) {
          const oldNamesStr = oldSupervisorNames.length > 0 ? oldSupervisorNames.join(', ') : 'No supervisors';
          const newNamesStr = newSupervisorNames.join(', ');

          const supervisorLogDescription = `assigned supervisors: ${newNamesStr} (Previously: ${oldNamesStr})`;
          const logResult = await createTicketLog(
            ticketId,
            'SUPERVISOR_CHANGE',
            supervisorLogDescription,
            assignerId,
            oldSupervisorId || null,
            supervisorString,
            null // Let createTicketLog handle the note
          );
          logResults.push(logResult);
          changes.push(`supervisor(s) assigned: ${newNamesStr}`);

          // Notify old supervisors if they were unassigned
          for (const oldId of oldSupervisorIds) {
            if (!supervisorIds.includes(oldId)) {
              await createNotification(
                oldId,
                `You have been unassigned from ticket #${ticketId}${assignerName ? ` by ${assignerName}` : ''}.`,
                'SUPERVISOR_UNASSIGNED',
                logResult.insertId,
                ticketId
              );
            }
          }
        }

        // Log status change if it occurred
        if ((oldStatus || '').trim().toLowerCase() !== (status || '').trim().toLowerCase()) {
          const statusLogDescription = `changed status from ${oldStatus} to ${status}`;
          const logResult = await createTicketLog(
            ticketId,
            'STATUS_CHANGE',
            statusLogDescription,
            assignerId,
            oldStatus,
            status,
            null // Let createTicketLog handle the note
          );
          logResults.push(logResult);
          changes.push(`status changed to ${status}`);
        }

        // Log priority change if it occurred
        if ((oldPriority || '').trim().toLowerCase() !== (priority || '').trim().toLowerCase()) {
          const priorityLogDescription = `changed priority from ${oldPriority} to ${priority}`;
          const logResult = await createTicketLog(
            ticketId,
            'PRIORITY_CHANGE',
            priorityLogDescription,
            assignerId,
            oldPriority,
            priority,
            null // Let createTicketLog handle the note
          );
          logResults.push(logResult);
          changes.push(`priority changed to ${priority}`);
        }

        // Send a single comprehensive notification to ticket creator if any changes occurred
        if (changes.length > 0 && ticketCreatorId) {
          const changeMessage = changes.join(', ');
          await createNotification(
            ticketCreatorId,
            `Your ticket #${ticketId} has been updated: ${changeMessage}${assignerName ? ` by ${assignerName}` : ''}.`,
            'TICKET_UPDATED',
            logResults[0]?.insertId || null,
            ticketId
          );
        }

        // Send notifications to assigned supervisors
        for (const supId of supervisorIds) {
          if (supId !== assignerId) { // Don't notify the assigner
            if (!oldSupervisorIds.includes(supId)) {
              // New assignment
              const supervisorName = nameMap[supId] || `User ${supId}`;
              await createNotification(
                supId,
                `You have been assigned to ticket #${ticketId}. Status: ${status}, Priority: ${priority}.${assignerName ? ` Assigned by ${assignerName}` : ''}`,
                'SUPERVISOR_ASSIGNED',
                logResults[0]?.insertId || null,
                ticketId
              );
            } else if (changes.length > 0) {
              // Changes to existing assignment
              const changeMessage = changes.join(', ');
              await createNotification(
                supId,
                `Ticket #${ticketId} assigned to you has been updated: ${changeMessage}${assignerName ? ` by ${assignerName}` : ''}.`,
                'TICKET_UPDATED',
                logResults[0]?.insertId || null,
                ticketId
              );
            }
          }
        }


        res.json({
          message: 'Supervisor assigned and changes logged successfully',
          status: 'success'
        });

      } catch (logErr) {
        console.error('Error creating logs or sending notifications during assignment:', logErr);
        res.status(500).json({
          error: 'Assignment successful, but failed to log changes or send notifications',
          message: logErr.message
        });
      }
    });
  });
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
  const { userId, systemName, ticketCategory, description } = req.body;

  try {
    // Get system ID
    const getSystemId = "SELECT AsipiyaSystemID FROM asipiyasystem WHERE SystemName = ?";
    const [systemResult] = await db.promise().query(getSystemId, [systemName]);

    if (systemResult.length === 0) {
      return res.status(400).json({ message: "Invalid system name" });
    }

    const systemID = systemResult[0].AsipiyaSystemID;

    // Get category ID
    const getCategoryId = "SELECT TicketCategoryID FROM ticketcategory WHERE CategoryName = ?";
    const [categoryResult] = await db.promise().query(getCategoryId, [ticketCategory]);

    if (categoryResult.length === 0) {
      return res.status(400).json({ message: "Invalid ticket category" });
    }

    const categoryID = categoryResult[0].TicketCategoryID;

    // Insert ticket
    const insertTicket = `
      INSERT INTO ticket (UserId, AsipiyaSystemID, TicketCategoryID, Description, Status, Priority)
      VALUES (?, ?, ?, ?, 'Pending', 'Medium')
    `;

    const [result] = await db.promise().query(insertTicket, [
      userId,
      systemID,
      categoryID,
      description
    ]);

    const updateSql = `
      UPDATE asipiyasystem
      SET Status = 1
      WHERE AsipiyaSystemID = ?
    `;
    await db.promise().query(updateSql, [systemID]);

    try {
      await sendNotificationsByRoles(
        ['Admin'],
        `New ticket created by User #${userId}: ${description.substring(0, 50)}...`,
        'NEW_TICKET'
      );
    } catch (error) {
      console.error('Error sending ticket creation notifications:', error);
    }

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: result.insertId
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Error creating ticket' });
  }
});

app.post('/api/upload_evidence', upload_evidence.array('evidenceFiles'), async (req, res) => {
  const { ticketId, description } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  if (!ticketId) {
    return res.status(400).json({ message: 'Ticket ID is required' });
  }

  try {
    const values = req.files.map(file => [
      ticketId,
      `uploads/${file.filename}`,
      description
    ]);

    const insertEvidenceQuery = `
      INSERT INTO evidence (ComplaintID, FilePath, Description)
      VALUES ?
    `;

    await db.promise().query(insertEvidenceQuery, [values]);

    res.status(200).json({
      message: 'Evidence files uploaded successfully',
      count: req.files.length
    });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    res.status(500).json({ message: 'Error uploading evidence' });
  }
});

/*-------------------------------------------------------------------------------------------------------------------------------*/

//Client side

app.get('/api/clients', (req, res) => {
  const sql = "SELECT * FROM client";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching clients", error: err });
    res.json(results);
  });
});

// POST add new client


app.post('/api/clients', async (req, res) => {
  const { CompanyName, ContactNo, ContactPersonEmail, MobileNo } = req.body;

  try {
    // 1. Check if the email exists in appuser
    const userResults = await query(
      'SELECT UserID FROM appuser WHERE Email = ? LIMIT 1',
      [ContactPersonEmail]
    );

    const matchedUserID = userResults.length > 0 ? userResults[0].UserID : null;

    // 2. Insert into client table
    const insertResult = await query(
      `INSERT INTO client (CompanyName, ContactNo, ContactPersonEmail, MobileNo, UserID) VALUES (?, ?, ?, ?, ?)`,
      [CompanyName, ContactNo, ContactPersonEmail, MobileNo, matchedUserID]
    );

    // 3. Fetch inserted client
    const insertedClientID = insertResult.insertId;
    const clientRows = await query('SELECT * FROM client WHERE ClientID = ?', [insertedClientID]);

    // 4. Send notification to all admins about new client registration
    try {
      await sendNotificationsByRoles(
        ['admin', 'manager'],
        `New client registered: ${CompanyName} (Contact: ${ContactPersonEmail})`,
        'NEW_CLIENT_REGISTRATION'
      );
    } catch (notificationError) {
      console.error('Error sending client registration notifications:', notificationError);
      // Don't fail the registration if notification fails
    }

    res.status(200).json({
      message: 'Client registered successfully',
      client: clientRows[0],
    });
  } catch (err) {
    console.error('Client registration error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});


// Add ticket log routes
app.use('/api/ticket-logs', ticketLogRoutes);

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default db;

// Add attachment endpoint
app.post('/api/tickets/:ticketId/attachments', async (req, res) => {
  const { ticketId } = req.params;
  const { fileName, fileUrl, userId } = req.body;

  try {
    // Create log entry for the attachment
    const logResult = await createTicketLog(
      ticketId,
      'ATTACHMENT',
      `added an attachment: ${fileName}`,
      userId,
      null,
      fileUrl
    );

    // Get ticket creator ID for notification
    const getTicket = "SELECT UserId as ticketUserId FROM ticket WHERE TicketID = ?";
    const [ticketResult] = await new Promise((resolve, reject) => {
      db.query(getTicket, [ticketId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (ticketResult) {
      try {
        await createNotification(
          ticketResult.ticketUserId,
          `New attachment added to your ticket #${ticketId}`,
          'NEW_ATTACHMENT',
          logResult.insertId
        );
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    }

    res.json({ message: "Attachment added successfully" });
  } catch (error) {
    console.error("Error adding attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Configure multer for attachments
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'attachments');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Add attachment endpoint
app.post('/api/tickets/:ticketId/attachments', attachmentUpload.single('file'), async (req, res) => {
  const { ticketId } = req.params;
  const { userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Get user details
  const getUserQuery = `
        SELECT 
            au.FullName as uploaderName,
            t.UserId as ticketUserId,
            t.SupervisorID
        FROM appuser au
        LEFT JOIN ticket t ON t.TicketID = ?
        WHERE au.UserID = ?
    `;

  try {
    const [userResults] = await new Promise((resolve, reject) => {
      db.query(getUserQuery, [ticketId, userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!userResults) {
      return res.status(404).json({ message: "User or ticket not found" });
    }

    const uploaderName = userResults.uploaderName;
    const filePath = file.path;
    const fileName = file.originalname;
    const fileSize = file.size;
    const fileType = file.mimetype;

    // Create ticket log entry
    const logQuery = `
            INSERT INTO ticketlog 
            (TicketID, DateTime, Type, Description, UserID, Note, NewValue)
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `;

    const description = `uploaded file "${fileName}"`;
    const fileDetails = JSON.stringify({
      name: fileName,
      size: fileSize,
      type: fileType,
      path: filePath
    });

    const [logResult] = await createTicketLog(
      ticketId,
      'ATTACHMENT',
      description,
      userId,
      null,
      fileDetails,
      `File size: ${Math.round(fileSize / 1024)}KB`
    );

    // Update LastRespondedTime
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE ticket SET LastRespondedTime = NOW() WHERE TicketID = ?",
        [ticketId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // Create notifications
    try {
      // Notify ticket creator if attachment is from someone else
      if (userId !== userResults.ticketUserId) {
        await createNotification(
          userResults.ticketUserId,
          `New file "${fileName}" attached to ticket #${ticketId} by ${uploaderName}`,
          'NEW_ATTACHMENT',
          logResult.insertId
        );
      }

      // Notify supervisor if exists and attachment is from ticket creator
      if (userResults.SupervisorID && userId === userResults.ticketUserId) {
        await createNotification(
          userResults.SupervisorID,
          `Ticket creator attached a file "${fileName}" to ticket #${ticketId}`,
          'CREATOR_ATTACHMENT',
          logResult.insertId
        );
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
    }

    res.json({
      message: "File uploaded successfully",
      file: {
        name: fileName,
        path: filePath,
        size: fileSize,
        type: fileType
      },
      logId: logResult.insertId
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Assign supervisor to ticket
app.put('/api/tickets/:ticketId/supervisor', async (req, res) => {
  const { ticketId } = req.params;
  const { supervisorId, userId } = req.body;

  // Get current ticket and user details
  const getDetailsQuery = `
        SELECT 
            t.SupervisorID as currentSupervisorId,
            t.UserId as ticketUserId,
            au_new.FullName as newSupervisorName,
            au_old.FullName as currentSupervisorName,
            au_assigner.FullName as assignerName
        FROM ticket t
        LEFT JOIN appuser au_new ON au_new.UserID = ?
        LEFT JOIN appuser au_old ON au_old.UserID = t.SupervisorID
        LEFT JOIN appuser au_assigner ON au_assigner.UserID = ?
        WHERE t.TicketID = ?
    `;

  try {
    const [details] = await new Promise((resolve, reject) => {
      db.query(getDetailsQuery, [supervisorId, userId, ticketId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!details) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update supervisor
    const updateQuery = "UPDATE ticket SET SupervisorID = ?, LastRespondedTime = NOW() WHERE TicketID = ?";

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [supervisorId, ticketId], (err, result) => {
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

    let description;
    if (!details.currentSupervisorId) {
      description = `Supervisor assigned: ${details.newSupervisorName}`;
    } else {
      description = `Supervisor changed from ${details.currentSupervisorName} to ${details.newSupervisorName}`;
    }

    const note = `Updated by ${details.assignerName}`;

    const [logResult] = await new Promise((resolve, reject) => {
      db.query(
        logQuery,
        [
          ticketId,
          'SUPERVISOR_CHANGE',
          description,
          userId,
          details.currentSupervisorId,
          supervisorId,
          note
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // Create notifications
    try {
      // Notify new supervisor
      await createNotification(
        supervisorId,
        `You have been assigned as supervisor for ticket #${ticketId} by ${details.assignerName}`,
        'SUPERVISOR_ASSIGNED',
        logResult.insertId
      );

      // Notify ticket creator
      await createNotification(
        details.ticketUserId,
        `${details.newSupervisorName} has been assigned as supervisor for your ticket #${ticketId}`,
        'SUPERVISOR_UPDATED',
        logResult.insertId
      );

      // Notify old supervisor if exists
      if (details.currentSupervisorId && details.currentSupervisorId !== supervisorId) {
        await createNotification(
          details.currentSupervisorId,
          `You have been unassigned from ticket #${ticketId} by ${details.assignerName}`,
          'SUPERVISOR_UNASSIGNED',
          logResult.insertId
        );
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
    }

    res.json({
      message: "Supervisor assigned successfully",
      logId: logResult.insertId
    });
  } catch (error) {
    console.error("Error assigning supervisor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update ticket due date
app.put('/api/tickets/:ticketId/due-date', async (req, res) => {
  const { ticketId } = req.params;
  const { dueDate, userId } = req.body; // <-- userId must be sent from frontend

  db.query('SELECT DueDate FROM ticket WHERE TicketID = ?', [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Error' });
    const oldDueDate = results[0].DueDate;

    db.query('UPDATE ticket SET DueDate = ? WHERE TicketID = ?', [dueDate, ticketId], async (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating due date' });

      let desc;
      if (!oldDueDate) {
        desc = `changed due date to ${dueDate}`;
      } else {
        desc = `changed due date from ${oldDueDate} to ${dueDate}`;
      }
      await createTicketLog(
        ticketId,
        'DUE_DATE_CHANGE',
        desc,
        userId,
        oldDueDate,
        dueDate,
        null
      );
      res.json({ message: 'Due date updated and logged' });
    });
  });
});

// Update ticket resolution
app.put('/api/tickets/:ticketId/resolution', async (req, res) => {
  const { ticketId } = req.params;
  const { resolution, userId } = req.body; // <-- userId must be sent from frontend

  db.query('SELECT Resolution FROM ticket WHERE TicketID = ?', [ticketId], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ message: 'Error' });
    const oldResolution = results[0].Resolution;

    db.query('UPDATE ticket SET Resolution = ? WHERE TicketID = ?', [resolution, ticketId], async (err2) => {
      if (err2) return res.status(500).json({ message: 'Error updating resolution' });

      let desc;
      if (!oldResolution) {
        desc = `changed resolution to "${resolution || ''}"`;
      } else {
        desc = `changed resolution from "${oldResolution || ''}" to "${resolution || ''}"`;
      }
      await createTicketLog(
        ticketId,
        'RESOLUTION_CHANGE',
        desc,
        userId,
        oldResolution,
        resolution,
        null
      );
      res.json({ message: 'Resolution updated and logged' });
    });
  });
});


// API endpoint to fetch companies
app.get('/api/companies', (req, res) => {
  const query = `
    SELECT DISTINCT c.CompanyName
    FROM client c
    JOIN appuser au ON c.UserID = au.UserID
    WHERE c.CompanyName IS NOT NULL
    ORDER BY c.CompanyName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching companies:', err);
      return res.status(500).json({ error: 'Failed to fetch companies' });
    }
    res.json(results);
  });
});

app.get('/api/tickets/:ticketId/comments', async (req, res) => {
  const { ticketId } = req.params;
  const { userId } = req.query; // Get userId from query parameters

  try {
    // First get all comments for the ticket
    const commentsQuery = `
      SELECT 
        c.CommentID, 
        c.CommentText, 
        c.CreatedAt, 
        c.Mentions, 
        c.ReplyToCommentID, 
        u.FullName,
        u.ProfileImagePath, 
        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.CommentID = c.CommentID) as LikesCount, 
        ${userId ? `(SELECT COUNT(*) FROM comment_likes cl WHERE cl.CommentID = c.CommentID AND cl.UserID = ${db.escape(userId)})` : '0'} as UserHasLiked, 
        ru.FullName as RepliedToUserName 
      FROM comments c
      JOIN appuser u ON c.UserID = u.UserID
      LEFT JOIN comments rc ON c.ReplyToCommentID = rc.CommentID 
      LEFT JOIN appuser ru ON rc.UserID = ru.UserID 
      WHERE c.TicketID = ?
      ORDER BY c.CreatedAt ASC
    `;

    const [comments] = await db.promise().query(commentsQuery, [ticketId]);

    // Get all attachments for these comments
    const commentIds = comments.map(c => c.CommentID);
    let attachments = [];

    if (commentIds.length > 0) {
      const attachmentsQuery = `
        SELECT 
          CommentID,
          FilePath as AttachmentFilePath,
          FileName as AttachmentFileName,
          FileType as AttachmentFileType
        FROM comment_attachments 
        WHERE CommentID IN (${commentIds.map(() => '?').join(',')})
      `;

      const [attachmentResults] = await db.promise().query(attachmentsQuery, commentIds);
      attachments = attachmentResults;
    }

    // Group attachments by comment ID and add them to comments
    const commentsWithAttachments = comments.map(comment => {
      const commentAttachments = attachments.filter(att => att.CommentID === comment.CommentID);

      // For backward compatibility, if there's an attachment, add the first one as single properties
      let formattedComment = { ...comment };
      if (commentAttachments.length > 0) {
        const firstAttachment = commentAttachments[0];
        formattedComment.AttachmentFilePath = firstAttachment.AttachmentFilePath;
        formattedComment.AttachmentFileName = firstAttachment.AttachmentFileName;
        formattedComment.AttachmentFileType = firstAttachment.AttachmentFileType;
        formattedComment.AttachmentFullUrl = `http://localhost:5000/${firstAttachment.AttachmentFilePath.replace(/\\/g, '/')}`;
      }

      // Add all attachments as an array for complete access
      formattedComment.attachments = commentAttachments.map(att => ({
        filePath: att.AttachmentFilePath,
        fileName: att.AttachmentFileName,
        fileType: att.AttachmentFileType,
        fullUrl: `http://localhost:5000/${att.AttachmentFilePath.replace(/\\/g, '/')}`
      }));

      return formattedComment;
    });

    res.json(commentsWithAttachments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

app.get('/api/mentionable-users', (req, res) => {
  const { ticketId } = req.query;

  if (!ticketId) {
    return res.status(400).json({ error: 'Ticket ID is required' });
  }

  // Query to get all admins and the supervisor(s) assigned to the specific ticket
  const sql = `
    SELECT DISTINCT u.UserID, u.FullName, u.Role, u.ProfileImagePath 
    FROM appuser u
    WHERE u.Role = 'Admin'
    
    UNION
    
    SELECT DISTINCT u.UserID, u.FullName, u.Role, u.ProfileImagePath 
    FROM appuser u
    INNER JOIN ticket t ON FIND_IN_SET(u.UserID, t.SupervisorID) > 0
    WHERE t.TicketID = ? AND u.Role = 'Supervisor'
    
    ORDER BY Role DESC, FullName ASC
  `;

  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error('Error fetching mentionable users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// Endpoint to like a comment
app.post('/api/comments/:commentId/like', async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const sql = 'INSERT IGNORE INTO comment_likes (CommentID, UserID) VALUES (?, ?)'; // IGNORE prevents duplicate likes
    const [result] = await db.promise().query(sql, [commentId, userId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Comment liked successfully.' });
    } else {
      res.status(200).json({ message: 'Comment already liked by this user.' });
    }
  } catch (err) {
    console.error('Error liking comment:', err);
    res.status(500).json({ message: 'Failed to like comment.', error: err.message });
  }
});

// Endpoint to unlike a comment
app.delete('/api/comments/:commentId/like', async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body; // userId sent in body for DELETE

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const sql = 'DELETE FROM comment_likes WHERE CommentID = ? AND UserID = ?';
    const [result] = await db.promise().query(sql, [commentId, userId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Comment unliked successfully.' });
    } else {
      res.status(404).json({ message: 'Like not found for this comment and user.' });
    }
  } catch (err) {
    console.error('Error unliking comment:', err);
    res.status(500).json({ message: 'Failed to unlike comment.', error: err.message });
  }
});

// Endpoint to check if a user has liked a comment
app.get('/api/comments/:commentId/hasLiked/:userId', async (req, res) => {
  const { commentId, userId } = req.params;

  try {
    const sql = 'SELECT COUNT(*) as count FROM comment_likes WHERE CommentID = ? AND UserID = ?';
    const [rows] = await db.promise().query(sql, [commentId, userId]);
    const hasLiked = rows[0].count > 0;
    res.status(200).json({ hasLiked });
  } catch (err) {
    console.error('Error checking like status:', err);
    res.status(500).json({ message: 'Failed to check like status.', error: err.message });
  }
});

// Add Multer middleware for profile image uploads
app.post(
  "/api/user/profile/upload/:id",
  upload.single("profileImage"),
  async (req, res) => {
    const userId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const imagePath = `profile_images/${req.file.filename}`; // Store relative path

    try {
      // Update the user's profile image path in the database
      const updateQuery =
        "UPDATE appuser SET ProfileImagePath = ? WHERE UserID = ?";
      await db.promise().query(updateQuery, [imagePath, userId]);

      res.status(200).json({
        message: "Profile image uploaded successfully",
        imagePath: imagePath, // Send back the relative path
      });
    } catch (error) {
      console.error("Error updating profile image path in DB:", error);
      res.status(500).json({ message: "Failed to update profile image." });
    }
  }
);

app.delete('/api/user/profile/image/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // Get the current image path to delete the file from the server
    const [results] = await db.promise().query('SELECT ProfileImagePath FROM appuser WHERE UserID = ?', [userId]);
    if (results.length > 0 && results[0].ProfileImagePath) {
      const filePath = path.join(__dirname, 'uploads', results[0].ProfileImagePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting old profile image file:', err);
          // Continue even if file deletion fails, as DB update is more critical
        }
      });
    }

    // Update the database to remove the profile image path
    const updateQuery = 'UPDATE appuser SET ProfileImagePath = NULL WHERE UserID = ?';
    await db.promise().query(updateQuery, [userId]);

    res.status(200).json({ message: 'Profile image removed successfully' });
  } catch (error) {
    console.error('Error removing profile image:', error);
    res.status(500).json({ message: 'Failed to remove profile image.' });
  }
});

// API endpoint to get unread chat notifications count for a specific ticket
app.get('/api/notifications/chat/count/:userId/:ticketId', (req, res) => {
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
});

// API endpoint to mark chat notifications as read for a specific ticket and user
app.put('/api/notifications/chat/read/:userId/:ticketId', (req, res) => {
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
});
