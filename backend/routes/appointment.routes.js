import express from 'express';
import { createAppointment, getDailyAppointments, getAppointmentsByDoctor, updateAppointmentStatus, deleteAppointment, getAvailableTimeSlots } from '../controllers/appointment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);

// Get available time slots (accessible to all authenticated users)
router.get('/available-slots', getAvailableTimeSlots);

// Doctor, Secretary, and Patient can create appointments
router.post('/', authorize('DOCTOR', 'SECRETARY', 'PATIENT'), auditLog('APPOINTMENT_CREATE', 'APPOINTMENT'), createAppointment);

// Get daily appointments (Doctor and Secretary)
router.get('/daily', authorize('DOCTOR', 'SECRETARY'), getDailyAppointments);

// Get appointments by doctor
router.get('/doctor', authorize('DOCTOR', 'SECRETARY'), getAppointmentsByDoctor);

// Update appointment status
router.patch('/:id/status', authorize('DOCTOR', 'SECRETARY'), auditLog('APPOINTMENT_UPDATE', 'APPOINTMENT'), updateAppointmentStatus);

// Delete appointment
router.delete('/:id', authorize('DOCTOR', 'SECRETARY', 'ADMIN'), auditLog('APPOINTMENT_DELETE', 'APPOINTMENT'), deleteAppointment);

export default router;
