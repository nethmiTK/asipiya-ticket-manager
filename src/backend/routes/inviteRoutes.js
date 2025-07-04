// routes/inviteRoutes.js
import express from 'express';
import inviteController from '../controllers/inviteController.js';

const router = express.Router(); 

router.post('/', inviteController.inviteUser);

export default router;