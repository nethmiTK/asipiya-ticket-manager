// routes/ticketRoutes.js

import express from 'express';
import { 
  createTicket,
  getUserTickets,
  getUserTicketById,
  getTickets,
  getFilteredTickets,
  updateTicket,
  getSupervisors,
  getAsipiyaSystems,
  getAllTicketsSimple
} from '../controllers/ticketController.js';

const router = express.Router();

// POST /api/tickets
router.post('/tickets', createTicket);
router.get('/userTickets', getUserTickets);
router.get('/userTicket/:ticketId', getUserTicketById);

// New routes moved from index.js
router.get('/tickets', getTickets);
router.get('/getting/tickets', getFilteredTickets);
router.put('/tickets/:id', updateTicket);
router.get('/supervisors', getSupervisors);
router.get('/asipiyasystems', getAsipiyaSystems);

export default router;

