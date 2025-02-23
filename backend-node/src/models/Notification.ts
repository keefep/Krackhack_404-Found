import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';

export interface INotification extends Document {
  recipient: Types.ObjectId | IUser;
  type: 'chat' | 'review' | 'product' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  markAsRead(): Promise<INotification>;
}

interface NotificationModel extends mongoose.Model<INotification> {
  createNotification(data: Partial<INotification>): Promise<INotification>;
  getUnreadCount(userId: Types.ObjectId): Promise<number>;
  markAllAsRead(userId: Types.ObjectId): Promise<void>;
  cleanupOldNotifications(days?: number): Promise<void>;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['chat', 'review', 'product', 'system'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    expiresAt: {
      type: Date,
      index: true,
      expires: 0, // This will automatically remove documents when they expire
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

// Clean up old notifications periodically
notificationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
    partialFilterExpression: { expiresAt: { $exists: false } },
  }
);

// Instance method to mark notification as read
notificationSchema.methods.markAsRead = async function(): Promise<INotification> {
  this.read = true;
  return this.save();
};

// Static method to create a notification
notificationSchema.statics.createNotification = async function(
  data: Partial<INotification>
): Promise<INotification> {
  return this.create({
    ...data,
    read: false,
  });
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(
  userId: Types.ObjectId
): Promise<number> {
  return this.countDocuments({
    recipient: userId,
    read: false,
  });
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(
  userId: Types.ObjectId
): Promise<void> {
  await this.updateMany(
    {
      recipient: userId,
      read: false,
    },
    {
      $set: { read: true },
    }
  );
};

// Static method to clean up old notifications
notificationSchema.statics.cleanupOldNotifications = async function(
  days: number = 30
): Promise<void> {
  const date = new Date();
  date.setDate(date.getDate() - days);

  await this.deleteMany({
    createdAt: { $lt: date },
    expiresAt: { $exists: false },
  });
};

export const Notification = mongoose.model<INotification, NotificationModel>('Notification', notificationSchema);
