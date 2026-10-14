import express from 'express';
import {
  getAssignedComplaints,
  getStaffComplaintDetail,
  getStaffStats,
} from '../controllers/staffController.js';
import { updateComplaintStatus } from '../controllers/complaintController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { resolveTenant, requireTenantRole } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(authenticate, resolveTenant, requireTenantRole('STAFF', 'ADMIN'));

router.get('/complaints', getAssignedComplaints);
router.get('/complaints/:id', getStaffComplaintDetail);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.get('/stats', getStaffStats);

export default router;
