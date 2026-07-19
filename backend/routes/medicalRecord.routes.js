import express from 'express';
import { createRecord, getRecords, getRecordById, updateRecord, deleteRecord } from '../controllers/medicalRecord.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);

// Doctors can create records
router.post('/', authorize('DOCTOR'), auditLog('MEDICAL_RECORD_CREATE', 'MEDICAL_RECORD'), createRecord);

// Get all records (role-based)
router.get('/', getRecords);

// Get single record
router.get('/:id', auditLog('MEDICAL_RECORD_VIEW', 'MEDICAL_RECORD'), getRecordById);

// Update record (only creating doctor)
router.put('/:id', authorize('DOCTOR', 'ADMIN'), auditLog('MEDICAL_RECORD_UPDATE', 'MEDICAL_RECORD'), updateRecord);

// Delete record (admin or creating doctor)
router.delete('/:id', authorize('DOCTOR', 'ADMIN'), auditLog('MEDICAL_RECORD_DELETE', 'MEDICAL_RECORD'), deleteRecord);

export default router;
