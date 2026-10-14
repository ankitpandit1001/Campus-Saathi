import express from 'express';
import {
  getDashboardMetrics,
  assignComplaint,
  getCategories,
  createCategory,
  updateCategory,
  getDepartments,
  createDepartment,
  listStaff,
  exportComplaintsCsv,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { resolveTenant, requireTenantRole } from '../middleware/tenantMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { assignComplaintSchema } from '../validators/complaintValidators.js';
import { categorySchema } from '../validators/adminValidators.js';

const router = express.Router();

// Allow authenticated users to view categories for dropdowns in their active institution
router.get('/categories', authenticate, resolveTenant, getCategories);
router.get('/departments', authenticate, resolveTenant, getDepartments);

// All other routes require ADMIN role within the tenant
router.use(authenticate, resolveTenant, requireTenantRole('ADMIN'));

router.get('/dashboard', getDashboardMetrics);
router.patch('/complaints/:id/assign', validateBody(assignComplaintSchema), assignComplaint);

router.post('/categories', validateBody(categorySchema), createCategory);
router.patch('/categories/:id', updateCategory);

router.post('/departments', createDepartment);
router.get('/staff', listStaff);

router.get('/reports/export', exportComplaintsCsv);
router.get('/audit-logs', getAuditLogs);

export default router;
