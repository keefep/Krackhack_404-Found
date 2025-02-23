import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  refreshToken,
  logout,
  verifyId,
} from '../controllers/auth';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
    name: z.string().min(2),
    collegeId: z.string().regex(/^[A-Z0-9]{6,10}$/, 'Invalid college ID format'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]{10,12}$/, 'Invalid phone number')
      .optional(),
  }),
});

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  }),
});

const verifyIdSchema = z.object({
  body: z.object({
    idCardImage: z.string().min(1, 'ID card image is required'),
  }),
});

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// ID verification endpoint
router.post('/verify-id', validate(verifyIdSchema), verifyId);

// Protected routes
router.use(protect); // All routes after this require authentication
router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.patch('/password', validate(updatePasswordSchema), updatePassword);

export default router;
