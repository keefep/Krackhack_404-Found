import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType =
  | 'TRANSACTION_INITIATED'
  | 'TRANSACTION_COMPLETED'
  | 'TRANSACTION_CANCELLED'
  | 'TRANSACTION_DISPUTED'
  | 'PAYMENT_RECEIVED'
  | 'ITEM_SHIPPED'
  | 'NEW_MESSAGE'
  | 'REVIEW_RECEIVED'
  | 'CREDIBILITY_CHANGE'
  | 'ACCOUNT_WARNING';

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'TRANSACTION_INITIATED',
        'TRANSACTION_COMPLETED',
        'TRANSACTION_CANCELLED',
        'TRANSACTION_DISPUTED',
        'PAYMENT_RECEIVED',
        'ITEM_SHIPPED',
        'NEW_MESSAGE',
        'REVIEW_RECEIVED',
        'CREDIBILITY_CHANGE',
        'ACCOUNT_WARNING',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Clean up expired notifications
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set default expiration based on priority
    const expirationMap = {
      low: 7 * 24 * 60 * 60 * 1000, // 7 days
      medium: 14 * 24 * 60 * 60 * 1000, // 14 days
      high: 30 * 24 * 60 * 60 * 1000, // 30 days
      critical: 90 * 24 * 60 * 60 * 1000, // 90 days
    };
    this.expiresAt = new Date(Date.now() + expirationMap[this.priority]);
  }
  next();
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
