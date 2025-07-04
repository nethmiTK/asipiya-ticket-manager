import express from 'express';
import {
  getRecentActivities,
  getTickets,
  getTicketCounts,
  getFilteredTickets,
  getStatusDistribution,
  getSystemDistribution,
  getRecentUsers,
  getCompanies
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard API routes
router.get('/tickets/recent-activities', getRecentActivities);
router.get('/tickets', getTickets);
router.get('/tickets/counts', getTicketCounts);
router.get('/tickets/filter', getFilteredTickets);
router.get('/tickets/status-distribution', getStatusDistribution);
router.get('/tickets/system-distribution', getSystemDistribution);
router.get('/users/recent', getRecentUsers);
router.get('/companies', getCompanies);

export default router;
