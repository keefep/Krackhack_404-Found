import mongoose, { Schema } from 'mongoose';
import { ProductDocument } from '../types/models';

const productSchema = new Schema({
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
    enum: ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'],
    required: true,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'SOLD', 'RESERVED'],
    default: 'AVAILABLE',
  },
  location: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ condition: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model<ProductDocument>('Product', productSchema);

export default Product;
