// routes/ticketRoutes.js

import express from 'express';
import { createTicket } from '../controllers/ticketController.js';
import { getUserTickets, getUserTicketById } from '../controllers/ticketController.js';

const router = express.Router();

// POST /api/tickets
router.post('/tickets', createTicket);
router.get('/userTickets', getUserTickets);
router.get('/userTicket/:ticketId', getUserTicketById);

export default router;

