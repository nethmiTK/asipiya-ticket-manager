import express from 'express';
import { getFilteredTickets, updateTicketStatus } from '../controllers/ticketStatusController.js';

const router = express.Router();

// Get filtered tickets
router.get('/api/tickets/filter', getFilteredTickets);

// Update ticket status
router.put('/:ticketId', updateTicketStatus);

export default router; 