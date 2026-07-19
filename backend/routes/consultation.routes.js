import express from 'express';
import { createConsultation, getMyConsultations, updateConsultationStatus, createManualConsultation } from '../controllers/consultation.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createConsultation);
router.post('/manual', authorize('SECRETARY', 'DOCTOR'), createManualConsultation);
router.get('/', getMyConsultations);
// Allow patients to cancel their own consultations, doctors/secretaries can update status
router.patch('/:id/status', updateConsultationStatus);
router.put('/:id', updateConsultationStatus); // Compatibility route

export default router;
