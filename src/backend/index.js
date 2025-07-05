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
import attachmentRoutes from './routes/attachmentRoutes.js';
import ticketManagementRoutes from './routes/ticketManagementRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import chatNotificationRoutes from './routes/chatNotificationRoutes.js';
import commentAttachmentRoutes from './routes/commentAttachmentRoutes.js';
import profileImageRoutes from './routes/profileImageRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

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

// Middleware to attach io to requests
app.use((req, res, next) => {
  req.io = io;
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
app.use('/api', authRoutes);
app.use('/api', authLoginRoutes);
app.use('/api', authPasswordRoutes);
app.use('/api', authResetRoutes);
app.use('/api/user/tickets', userDashboardRoutes);
app.use('/api', attachmentRoutes);
app.use('/api', ticketManagementRoutes);
app.use('/api', companyRoutes);
app.use('/api', profileRoutes);
app.use('/api', chatNotificationRoutes);
app.use('/api', commentAttachmentRoutes);
app.use('/api/user/profile', profileImageRoutes);
app.use('/api', chatRoutes);


app.get("/tickets", (req, res) => {
  res.redirect(307, `/api/tickets?${new URLSearchParams(req.query).toString()}`);
});

app.get("/getting/tickets", (req, res) => {
  res.redirect(307, `/api/getting/tickets?${new URLSearchParams(req.query).toString()}`);
});

app.put("/tickets/:id", (req, res) => {
  res.redirect(307, `/api/tickets/${req.params.id}`);
});

app.get("/supervisors", (req, res) => {
  res.redirect(307, "/api/supervisors");
});

app.get("/asipiyasystems", (req, res) => {
  res.redirect(307, "/api/asipiyasystems");
});

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

// --- Multer Configuration for Images ---
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


/*-------------------------------Fetch Requests-----------------------------------------*/
// These routes have been moved to ticketController.js and ticketRoutes.js
// Use the following endpoints instead:
// GET /api/tickets - for role-based ticket fetching
// GET /api/getting/tickets - for filtered tickets
// PUT /api/tickets/:id - for ticket updates
// GET /api/supervisors - for supervisors list
// GET /api/asipiyasystems - for systems list


/*---------------------------------------------------------------------------------------*/




// PUT: Update supervisors for a ticket
// This functionality has been moved to supervisorAssignController.js
// Use the /api/update-supervisors/:id endpoint instead


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

//x

// Add ticket log routes
app.use('/api/ticket-logs', ticketLogRoutes);

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default db;
