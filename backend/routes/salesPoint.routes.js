import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getSalesPoints,
  getAdminSalesPoints,
  createSalesPoint,
  updateSalesPoint,
  deleteSalesPoint
} from '../controllers/salesPoint.controller.js';

const router = express.Router();

// Publicly available to all logged-in users
router.use(authenticate);

router.route('/')
  .get(getSalesPoints)
  .post(authorize('ADMIN'), createSalesPoint);

router.route('/admin')
  .get(authorize('ADMIN'), getAdminSalesPoints);

router.route('/:id')
  .put(authorize('ADMIN'), updateSalesPoint)
  .delete(authorize('ADMIN'), deleteSalesPoint);

export default router;
