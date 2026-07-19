import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN')); // Only admins can view audit logs

router.get('/', getAuditLogs);

export default router;
