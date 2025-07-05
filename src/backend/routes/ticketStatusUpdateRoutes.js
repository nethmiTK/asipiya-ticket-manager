import express from 'express';
import { updateTicketStatus } from '../controllers/ticketStatusUpdateController.js';

const router = express.Router();

// Update ticket status
router.put('/ticket_status/:id', updateTicketStatus);

export default router;
