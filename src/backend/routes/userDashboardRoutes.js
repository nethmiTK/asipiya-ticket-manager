import express from 'express';
import { 
  getUserTicketCounts, 
  getUserRecentTickets 
} from '../controllers/userDashboardController.js';

const router = express.Router();

router.get('/counts/:userId', getUserTicketCounts);
router.get('/recent/:userId', getUserRecentTickets);

export default router;