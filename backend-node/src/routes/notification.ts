import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications,
} from '../controllers/notification';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const querySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    type: z.enum(['chat', 'review', 'product', 'system']).optional(),
  }),
});

const notificationIdParamSchema = z.object({
  params: z.object({
    notificationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID'),
  }),
});

const cleanupSchema = z.object({
  query: z.object({
    days: z.string().regex(/^\d+$/).optional(),
  }),
});

// Protect all notification routes
router.use(protect);

// Get user's notifications with optional filtering and pagination
router.get(
  '/',
  validate(querySchema),
  getNotifications
);

// Mark a notification as read
router.patch(
  '/:notificationId/read',
  validate(notificationIdParamSchema),
  markAsRead
);

// Mark all notifications as read
router.patch(
  '/read-all',
  markAllAsRead
);

// Delete a notification
router.delete(
  '/:notificationId',
  validate(notificationIdParamSchema),
  deleteNotification
);

// Admin routes
router.post(
  '/cleanup',
  restrictTo('admin'),
  validate(cleanupSchema),
  cleanupOldNotifications
);

export default router;
