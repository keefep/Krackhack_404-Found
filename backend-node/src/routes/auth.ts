import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  login,
  register,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  logout,
} from '../controllers/auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/me', getCurrentUser);
router.patch('/profile', updateCurrentUser);
router.post('/change-password', changePassword);
router.post('/logout', logout);

export default router;
