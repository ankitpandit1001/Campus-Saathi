import express from 'express';
import {
  getPlatformMetrics,
  listAllInstitutions,
  updateInstitutionStatus,
  getPlatformAuditLogs,
} from '../controllers/platformAdminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireSuperAdmin } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// All platform governance routes require Platform Super Admin privileges
router.use(authenticate, requireSuperAdmin);

router.get('/metrics', getPlatformMetrics);
router.get('/institutions', listAllInstitutions);
router.patch('/institutions/:institutionId/status', updateInstitutionStatus);
router.get('/audit-logs', getPlatformAuditLogs);

export default router;
