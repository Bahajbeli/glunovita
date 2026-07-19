import express from 'express';
import { getStatistics, getRegionalStatistics } from '../controllers/statistics.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

router.use(authenticate);

// All authenticated users can view statistics (anonymized)
router.get('/', auditLog('STATISTICS_VIEW', 'STATISTICS'), getStatistics);
router.get('/region/:region', authorize('ADMIN', 'AUTHORITY'), auditLog('STATISTICS_VIEW', 'STATISTICS'), getRegionalStatistics);

export default router;
