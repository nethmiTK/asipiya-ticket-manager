// routes/ticketManagementRoutes.js

import express from 'express';
import { assignSupervisor, updateDueDate, updateResolution } from '../controllers/ticketManagementController.js';

const router = express.Router();

// Assign supervisor to ticket
router.put('/tickets/:ticketId/supervisor', assignSupervisor);

// Update ticket due date
router.put('/tickets/:ticketId/due-date', updateDueDate);

// Update ticket resolution
router.put('/tickets/:ticketId/resolution', updateResolution);

export default router;
