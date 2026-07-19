import express from 'express';
import { getUsers, getUserById, updateUser, deactivateUser, searchPatients, getDoctors } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);

// Get doctors (accessible to all authenticated users, especially patients)
router.get('/doctors', getDoctors);

// Search patients (accessible to doctors and secretaries)
router.get('/search/patients', authorize('DOCTOR', 'SECRETARY'), searchPatients);

// Get user by ID (accessible to all authenticated users)
router.get('/:id', getUserById);

// Update own profile (accessible to all authenticated users)
router.put('/:id', auditLog('USER_UPDATE', 'USER'), updateUser);

// Admin-only routes
router.use(authorize('ADMIN'));

router.get('/', getUsers);
router.patch('/:id/deactivate', auditLog('USER_UPDATE', 'USER'), deactivateUser);

export default router;
