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
import dashboardRoutes from './routes/dashboardRoutes.js';
import userDashboardRoutes from './routes/userDashboardRoutes.js';

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
app.use('/api', systemRoutes);
app.use('/api', categoryRoutes);
app.use('/api', clientRoutes);
app.use('/api', supervisorAssignRoutes);
app.use('/api', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', evidenceRoutes);
app.use('/api', commentRoutes);
app.use('/api', ticketUpdateRoutes);
app.use('/api', dashboardRoutes);
app.use(authRoutes);
app.use(authLoginRoutes);
app.use('/', authPasswordRoutes);
app.use('/', authResetRoutes);
app.use('/api/user/tickets', userDashboardRoutes);

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

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

//  Define salt rounds for bcrypt hashing.
const saltRounds = 10;

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
