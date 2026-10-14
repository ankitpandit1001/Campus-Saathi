import express from 'express';
import {
  register,
  login,
  switchInstitution,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  registerSchema,
  loginSchema,
  switchInstitutionSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/authValidators.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.post('/switch-institution', authenticate, validateBody(switchInstitutionSchema), switchInstitution);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);

export default router;
