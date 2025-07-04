import express from 'express';
import {
  addSystem,
  getSystems,
  updateSystem,
  deleteSystem
} from '../controllers/systemController.js';

const router = express.Router();

router.post('/systems', addSystem);
router.get('/system_registration', getSystems);
router.put('/system_registration_update/:id', updateSystem);
router.delete('/system_registration_delete/:id', deleteSystem);

export default router;
