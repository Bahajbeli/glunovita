import express from 'express';
import { createDeclaration, getDeclarations, approveDeclaration, rejectDeclaration } from '../controllers/patient.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Patient can create and view their own declarations
router.post('/declarations', authorize('PATIENT'), auditLog('PATIENT_DECLARATION_CREATE', 'PATIENT_DECLARATION'), createDeclaration);
router.get('/declarations', getDeclarations);

// Admin can approve/reject declarations
router.patch('/declarations/:id/approve', authorize('ADMIN'), auditLog('PATIENT_DECLARATION_APPROVE', 'PATIENT_DECLARATION'), approveDeclaration);
router.patch('/declarations/:id/reject', authorize('ADMIN'), auditLog('PATIENT_DECLARATION_REJECT', 'PATIENT_DECLARATION'), rejectDeclaration);

export default router;
