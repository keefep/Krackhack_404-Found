import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../types/express';
import { ValidationError } from '../utils/errors';
import { io } from '../utils/socket';

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      throw new ValidationError('User not found');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({
      recipient: req.user._id,
    });

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        total,
        unreadCount,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      throw new ValidationError('User not found');
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      throw new ValidationError('Notification not found');
    }

    await notification.markAsRead();

    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    // Notify client about updated unread count
    io.to(`user_${req.user._id}`).emit('notification_count', { unreadCount });

    res.status(200).json({
      status: 'success',
      data: {
        notification,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      throw new ValidationError('User not found');
    }

    await Notification.markAllAsRead(req.user._id);

    // Notify client about zero unread notifications
    io.to(`user_${req.user._id}`).emit('notification_count', { unreadCount: 0 });

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      throw new ValidationError('User not found');
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      throw new ValidationError('Notification not found');
    }

    // Get updated unread count if the deleted notification was unread
    if (!notification.read) {
      const unreadCount = await Notification.getUnreadCount(req.user._id);
      io.to(`user_${req.user._id}`).emit('notification_count', { unreadCount });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Utility function to create and send a notification
export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  link,
  data,
  priority = 'low',
  expiresAt,
}: {
  recipient: Types.ObjectId;
  type: 'chat' | 'review' | 'product' | 'system';
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}): Promise<void> => {
  try {
    const notification = await Notification.createNotification({
      recipient,
      type,
      title,
      message,
      link,
      data,
      priority,
      expiresAt,
    });

    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(recipient);

    // Send real-time notification
    io.to(`user_${recipient}`).emit('new_notification', {
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Cleanup old notifications (can be called by a cron job)
export const cleanupOldNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.role?.includes('admin')) {
      throw new ValidationError('Not authorized');
    }

    const days = parseInt(req.query.days as string) || 30;
    await Notification.cleanupOldNotifications(days);

    res.status(200).json({
      status: 'success',
      message: `Cleaned up notifications older than ${days} days`,
    });
  } catch (error) {
    next(error);
  }
};
