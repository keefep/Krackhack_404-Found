import mongoose from 'mongoose';
import { Schema, Types } from 'mongoose';

export interface IProduct {
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  seller: Types.ObjectId;
  location: string;
  status: 'available' | 'sold' | 'reserved';
  viewCount: number;
  savedCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  draft: boolean;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [{
    type: String,
    required: true,
  }],
  category: {
    type: String,
    required: true,
    trim: true,
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available',
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  savedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  deletedAt: {
    type: Date,
    default: null,
  },
  draft: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Create indexes for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
