import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
import ticketStatusRoutes from './routes/ticketStatusRoutes.js';

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
app.use('/api/ticket-logs', ticketLogRoutes);
app.use('/api', ticketStatusRoutes);
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

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

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

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default db;

