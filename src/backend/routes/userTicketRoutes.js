import express from 'express';
import { getTicketSystemDistribution, getUserDetails, getUserTickets } from '../controllers/userTicketController.js';

const router = express.Router();

// API endpoint to fetch ticket counts by system
router.get('/tickets/system-distribution', getTicketSystemDistribution);

// Get user details by ID
router.get('/users/:userId', getUserDetails);

// Get user's tickets
router.get('/tickets/user/:userId', getUserTickets);

export default router;
