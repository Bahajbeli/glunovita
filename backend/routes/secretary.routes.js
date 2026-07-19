import express from 'express';
import { createSecretary, getSecretaries, removeSecretary } from '../controllers/secretary.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('DOCTOR')); // Only doctors can manage secretaries

router.post('/', auditLog('SECRETARY_CREATE', 'USER'), createSecretary);
router.get('/', getSecretaries);
router.delete('/:id', auditLog('SECRETARY_REMOVE', 'USER'), removeSecretary);

export default router;
