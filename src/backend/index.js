// src/backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import { authenticateToken, authorizeRoles } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/api/public', (req, res) => {
    res.send('This is a public route, anyone can see it.');
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
    res.json({ message: `Welcome to your profile, user ID: ${req.userId}, Role: ${req.userRole}` });
});

app.get('/api/admin/dashboard-data', authenticateToken, authorizeRoles(['admin']), (req, res) => {
    res.json({ message: `Welcome to the ADMIN dashboard, ${req.userId}. Only admins can see this!` });
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is Running on port ${process.env.PORT || 5000}`);
});
