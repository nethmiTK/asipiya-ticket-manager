import express from 'express';
import { updateTicketStatusFromIndex, getAllTickets } from '../controllers/ticketStatusController.js';

const router = express.Router();

// PUT /api/ticket_status/:id - Update ticket status
router.put('/ticket_status/:id', updateTicketStatusFromIndex);

// GET /api/tickets - Get all tickets
router.get('/tickets', getAllTickets);

export default router;
