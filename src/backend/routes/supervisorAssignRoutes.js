// routes/supervisorAssignRoutes.js
import express from 'express';
import {
  getTicketDetails,
  getAllTickets,
  assignSupervisor,
  getSupervisors
} from '../controllers/supervisorAssignController.js';

const router = express.Router();

router.get('/ticket_view/:id', getTicketDetails);
router.get('/pending_ticket', getAllTickets); 
router.put('/tickets/:id/assign', assignSupervisor);
router.get('/supervisors', getSupervisors); 

export default router;
