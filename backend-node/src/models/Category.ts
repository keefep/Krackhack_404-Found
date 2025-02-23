import mongoose from 'mongoose';
import { Schema, Types } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId;
  level: number;
  order: number;
  icon?: string;
  children?: Types.ObjectId[];
  productCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  level: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  icon: {
    type: String,
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
  }],
  productCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  timestamps: true,
});

// Middleware to handle slug creation
categorySchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  next();
});

// Create indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, order: 1 });
categorySchema.index({ name: 'text' });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
