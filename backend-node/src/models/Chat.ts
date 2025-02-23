import mongoose, { Document, Schema, Types, Query, Model } from 'mongoose';
import { IUser } from './User';

// Base message interface without Document properties
export interface IMessageData {
  sender: Types.ObjectId | IUser;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: Array<Types.ObjectId | IUser>;
  deleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage extends Document {
  sender: Types.ObjectId | IUser;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: Array<Types.ObjectId | IUser>;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMethods {
  markAsRead(userId: Types.ObjectId): Promise<IChat>;
  addMessage(message: IMessageData): Promise<IChat>;
}

export interface IChat extends Document, IChatMethods {
  participants: Array<Types.ObjectId | IUser>;
  product?: Types.ObjectId;
  lastMessage?: IMessage;
  messages: IMessage[];
  active: boolean;
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
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  fileUrl: {
    type: String,
    trim: true,
  },
  fileName: {
    type: String,
    trim: true,
  },
  fileSize: {
    type: Number,
    min: 0,
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  deleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  lastMessage: messageSchema,
  messages: [messageSchema],
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Add indexes for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ product: 1 });
chatSchema.index({ 'messages.sender': 1 });
chatSchema.index({ 'messages.createdAt': -1 });
chatSchema.index({ updatedAt: -1 });

// Method to mark messages as read
chatSchema.methods.markAsRead = async function(this: IChat, userId: Types.ObjectId): Promise<IChat> {
  this.messages.forEach(message => {
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
    }
  });
  return this.save();
};

// Method to add new message
chatSchema.methods.addMessage = async function(this: IChat, message: IMessageData): Promise<IChat> {
  const messageDoc = {
    ...message,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  this.messages.push(messageDoc as any);
  this.lastMessage = this.messages[this.messages.length - 1];
  return this.save();
};

// Pre-hook to populate user and message references
chatSchema.pre<Query<any, IChat>>(/^find/, function(next) {
  this.populate('participants', 'name avatar')
      .populate('lastMessage.sender', 'name avatar')
      .populate('messages.sender', 'name avatar')
      .populate('messages.readBy', 'name avatar');
  next();
});

// Create Message Model (not exported, used internally)
const Message = mongoose.model<IMessage>('Message', messageSchema);

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
