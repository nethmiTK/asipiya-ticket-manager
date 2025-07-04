import express from 'express';
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/ticket_category', addCategory);
router.get('/ticket_category', getCategories);
router.put('/ticket_category_update/:id', updateCategory);
router.delete('/ticket_category_delete/:id', deleteCategory);

export default router;
