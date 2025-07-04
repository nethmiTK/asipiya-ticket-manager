// routes/supervisorRoutes.js
import express from 'express';
import supervisorController from '../controllers/supervisorController.js'; // note the .js extension

const router = express.Router();

router.get('/', supervisorController.getAllSupervisors);
router.get('/:id', supervisorController.getSupervisorById);
router.put('/:id', supervisorController.updateSupervisorById);
router.delete('/:id', supervisorController.deleteSupervisorById);

export default router;