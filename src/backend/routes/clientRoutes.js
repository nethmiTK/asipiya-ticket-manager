// routes/clientRoutes.js
import express from 'express';
import { getClients, addClient } from '../controllers/clientController.js';

const router = express.Router();

router.get('/clients', getClients);
router.post('/clients', addClient);

export default router;
