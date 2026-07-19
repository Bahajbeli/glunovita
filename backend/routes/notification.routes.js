import express from 'express';
import { createNotification, getNotifications, markAsRead, getUnreadCount } from '../controllers/notification.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);

// Admin and Authority can create notifications
router.post('/', authorize('ADMIN', 'AUTHORITY'), auditLog('NOTIFICATION_CREATE', 'NOTIFICATION'), createNotification);

// All authenticated users can get their notifications
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);

export default router;
