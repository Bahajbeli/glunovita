import express from 'express';
import { createOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);

// User routes
router.post('/', auditLog('ORDER_CREATE', 'ORDER'), createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authorize('ADMIN'), getAllOrders);
router.patch('/:id/status', authorize('ADMIN'), auditLog('ORDER_UPDATE', 'ORDER'), updateOrderStatus);

export default router;
