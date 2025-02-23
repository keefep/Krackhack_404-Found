import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { EncryptedMessage } from '../utils/encryption';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  content: EncryptedMessage;
  timestamp: Date;
  readBy: Types.ObjectId[];
}

export interface IChat extends Document {
  participants: Types.ObjectId[];
  messages: IMessage[];
  encryptionKey: string;
  lastMessage?: {
    sender: Types.ObjectId;
    timestamp: Date;
    preview: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    iv: { type: String, required: true },
    encryptedData: { type: String, required: true },
    authTag: { type: String, required: true },
    salt: { type: String, required: true },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
});

const chatSchema = new Schema<IChat>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    messages: [messageSchema],
    encryptionKey: {
      type: String,
      required: true,
    },
    lastMessage: {
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
      preview: String, // Store a truncated, encrypted preview
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Ensure at least 2 participants in a chat
chatSchema.pre('save', function(next) {
  if (this.participants.length < 2) {
    next(new Error('Chat must have at least 2 participants'));
  } else {
    next();
  }
});

// Create unique compound index to prevent duplicate chats between same users
chatSchema.index(
  { participants: 1 },
  {
    unique: true,
    partialFilterExpression: {
      // Only apply uniqueness when exactly 2 participants (DM)
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    }
  }
);

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
