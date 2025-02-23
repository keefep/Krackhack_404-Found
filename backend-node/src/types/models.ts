import { Document, Types } from 'mongoose';

export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends BaseDocument {
  name: string;
  email: string;
  collegeId: string;
  password: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface IProduct extends BaseDocument {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  location?: string;
  tags?: string[];
  seller: Types.ObjectId | IUser;
}

export interface IMessage extends BaseDocument {
  sender: Types.ObjectId | IUser;
  content: string;
  readAt?: Date;
}

export interface IChat extends BaseDocument {
  participants: [Types.ObjectId | IUser, Types.ObjectId | IUser];
  messages: IMessage[];
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
}

export interface ITransaction extends BaseDocument {
  buyer: Types.ObjectId | IUser;
  seller: Types.ObjectId | IUser;
  product: Types.ObjectId | IProduct;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
}

export interface INotification extends BaseDocument {
  recipient: Types.ObjectId | IUser;
  type: 'TRANSACTION' | 'CHAT' | 'PRODUCT' | 'SYSTEM';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
}

export interface IReview extends BaseDocument {
  product: Types.ObjectId | IProduct;
  reviewer: Types.ObjectId | IUser;
  rating: number;
  comment: string;
}

// Document types for use with Mongoose
export type UserDocument = IUser & Document;
export type ProductDocument = IProduct & Document;
export type ChatDocument = IChat & Document;
export type TransactionDocument = ITransaction & Document;
export type NotificationDocument = INotification & Document;
export type ReviewDocument = IReview & Document;
