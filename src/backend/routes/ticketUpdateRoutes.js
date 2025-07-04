import express from 'express';
import { updateTicketStatus, updateTicketPriority } from '../controllers/ticketUpdateController.js';

const router = express.Router();

// Update ticket status
router.put('/tickets/:ticketId/status', updateTicketStatus);

// Update ticket priority
router.put('/tickets/:ticketId/priority', updateTicketPriority);

export default router;
