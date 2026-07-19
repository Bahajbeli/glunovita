import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient
} from '../controllers/ingredient.controller.js';

const router = express.Router();

router.use(authenticate);

// Publicly available to authenticated users to build recipes
router.route('/')
  .get(getIngredients)
  .post(authorize('ADMIN'), createIngredient);

router.route('/:id')
  .put(authorize('ADMIN'), updateIngredient)
  .delete(authorize('ADMIN'), deleteIngredient);

export default router;
