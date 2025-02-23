import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../types/express';
import { Notification, NotificationType, INotification } from '../models/Notification';
import { ValidationError } from '../utils/errors';
import { emitToUser } from '../utils/socket';

interface CreateNotificationParams {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// Utility function to create and emit notifications
export async function createAndEmitNotification(params: CreateNotificationParams): Promise<INotification> {
  const notification = await Notification.create({
    ...params,
    read: false,
  });

  // Emit real-time notification
  emitToUser(params.recipient.toString(), 'notification', {
    notification: {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      data: notification.data,
      createdAt: notification.createdAt,
    },
  });

  return notification;
}

// Get user's notifications
export const getUserNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { unreadOnly, priority } = req.query;
    const query: any = { recipient: req.user._id };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    if (priority) {
      query.priority = priority;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

// Mark notifications as read
export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { notificationIds } = req.body;

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: req.user._id,
      },
      { $set: { read: true } }
    );

    res.status(200).json({
      status: 'success',
      message: 'Notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// Critical transaction alerts
export const sendTransactionAlert = async (
  recipientId: Types.ObjectId,
  type: NotificationType,
  data: {
    transactionId: Types.ObjectId;
    productId?: Types.ObjectId;
    amount?: number;
    reason?: string;
  }
): Promise<void> => {
  const alertConfigs: Partial<Record<NotificationType, { title: string; message: string; priority: 'high' | 'critical' }>> = {
    TRANSACTION_INITIATED: {
      title: 'New Transaction Started',
      message: 'A new transaction has been initiated for your item',
      priority: 'high',
    },
    TRANSACTION_COMPLETED: {
      title: 'Transaction Completed',
      message: 'Your transaction has been completed successfully',
      priority: 'high',
    },
    TRANSACTION_CANCELLED: {
      title: 'Transaction Cancelled',
      message: 'A transaction has been cancelled',
      priority: 'critical',
    },
    TRANSACTION_DISPUTED: {
      title: 'Transaction Disputed',
      message: 'A dispute has been raised for your transaction',
      priority: 'critical',
    },
    PAYMENT_RECEIVED: {
      title: 'Payment Received',
      message: 'Payment has been received for your transaction',
      priority: 'high',
    },
    ITEM_SHIPPED: {
      title: 'Item Shipped',
      message: 'Your item has been marked as shipped',
      priority: 'high',
    },
    NEW_MESSAGE: {
      title: 'New Message',
      message: 'You have received a new message',
      priority: 'high',
    },
    REVIEW_RECEIVED: {
      title: 'New Review',
      message: 'You have received a new review',
      priority: 'high',
    },
    CREDIBILITY_CHANGE: {
      title: 'Credibility Score Updated',
      message: 'Your credibility score has been updated',
      priority: 'high',
    },
    ACCOUNT_WARNING: {
      title: 'Account Warning',
      message: 'Important notice about your account',
      priority: 'critical',
    },
  };

  const config = alertConfigs[type];
  if (!config) return;

  await createAndEmitNotification({
    recipient: recipientId,
    type,
    title: config.title,
    message: `${config.message}. ${data.reason || ''}`.trim(),
    data,
    priority: config.priority,
  });
};

// Clear old notifications
export const clearOldNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Notification.deleteMany({
      recipient: req.user._id,
      read: true,
      priority: { $ne: 'critical' },
      createdAt: { $lt: thirtyDaysAgo },
    });

    res.status(200).json({
      status: 'success',
      message: 'Old notifications cleared',
    });
  } catch (error) {
    next(error);
  }
};
