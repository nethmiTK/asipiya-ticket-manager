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
import userTicketRoutes from './routes/userTicketRoutes.js';
import supervisorInviteRoutes from './routes/supervisorInviteRoutes.js';
import ticketStatusUpdateRoutes from './routes/ticketStatusUpdateRoutes.js';

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
app.use('/api', userTicketRoutes);
app.use('/api', supervisorInviteRoutes);
app.use('/api', ticketStatusUpdateRoutes);


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

/* ----------------------------------------------------------------------------------------------*/

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

 
 

 const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default db;
