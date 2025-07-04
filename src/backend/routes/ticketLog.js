import express from 'express';
import { getTicketLogs, createTicketLog, getTicketLogStats } from '../controllers/ticketLogController.js';

const router = express.Router();

// Get all logs for a specific ticket
router.get('/:ticketId', getTicketLogs);

// Create a new log entry
router.post('/', createTicketLog);

// Get log statistics for a ticket
router.get('/:ticketId/stats', getTicketLogStats);

export default router; 