import express from 'express';
import { createSurvey, getSurveys, submitResponse, getSurveyResults } from '../controllers/survey.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);

// Admin and Authority can create surveys
router.post('/', authorize('ADMIN', 'AUTHORITY'), auditLog('SURVEY_CREATE', 'SURVEY'), createSurvey);

// All users can get available surveys
router.get('/', getSurveys);

// Submit survey response
router.post('/:id/respond', auditLog('SURVEY_RESPOND', 'SURVEY'), submitResponse);

// Get survey results (Admin and Authority only)
router.get('/:id/results', authorize('ADMIN', 'AUTHORITY'), getSurveyResults);

export default router;
