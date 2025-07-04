// routes/ticketRoutes.js

import express from 'express';
import { createTicket } from '../controllers/ticketController.js';

const router = express.Router();

// POST /api/tickets
router.post('/tickets', createTicket);

export default router;
