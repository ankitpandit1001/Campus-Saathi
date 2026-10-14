import express from 'express';
import {
  listInstitutions,
  getInstitutionById,
  registerInstitution,
  submitJoinRequest,
  listJoinRequests,
  reviewJoinRequest,
  listMembers,
  updateMembershipStatus,
  getInstitutionSettings,
  updateInstitutionSettings,
} from '../controllers/institutionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { resolveTenant, requireTenantRole } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', listInstitutions);
router.post('/register', registerInstitution);
router.get('/:institutionId', getInstitutionById);

// Authenticated user join request
router.post('/:institutionId/join-requests', authenticate, submitJoinRequest);

// Institution Admin routes (tenant-scoped)
router.get(
  '/:institutionId/join-requests',
  authenticate,
  resolveTenant,
  requireTenantRole('ADMIN'),
  listJoinRequests
);

router.patch(
  '/:institutionId/join-requests/:requestId',
  authenticate,
  resolveTenant,
  requireTenantRole('ADMIN'),
  reviewJoinRequest
);

router.get(
  '/:institutionId/members',
  authenticate,
  resolveTenant,
  requireTenantRole('ADMIN'),
  listMembers
);

router.patch(
  '/:institutionId/members/:membershipId/status',
  authenticate,
  resolveTenant,
  requireTenantRole('ADMIN'),
  updateMembershipStatus
);

router.get(
  '/:institutionId/settings',
  authenticate,
  resolveTenant,
  requireTenantRole('ADMIN'),
  getInstitutionSettings
);

router.patch(
  '/:institutionId/settings',
  authenticate,
  resolveTenant,
  requireTenantRole('ADMIN'),
  updateInstitutionSettings
);

export default router;
