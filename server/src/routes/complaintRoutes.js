import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComment,
  reopenComplaint,
  getComplaintHistory,
} from '../controllers/complaintController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { resolveTenant } from '../middleware/tenantMiddleware.js';
import { uploadComplaintImage } from '../middleware/uploadMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  createComplaintSchema,
  addCommentSchema,
  reopenComplaintSchema,
} from '../validators/complaintValidators.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  resolveTenant,
  uploadComplaintImage.single('image'),
  validateBody(createComplaintSchema),
  createComplaint
);

router.get('/', authenticate, resolveTenant, getComplaints);
router.get('/:id', authenticate, resolveTenant, getComplaintById);
router.get('/:id/history', authenticate, resolveTenant, getComplaintHistory);
router.patch('/:id/status', authenticate, resolveTenant, updateComplaintStatus);
router.post('/:id/comments', authenticate, resolveTenant, validateBody(addCommentSchema), addComment);
router.post('/:id/reopen', authenticate, resolveTenant, validateBody(reopenComplaintSchema), reopenComplaint);

export default router;
