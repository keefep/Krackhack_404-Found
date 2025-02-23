import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

export interface IReview extends Document {
  reviewer: Types.ObjectId | IUser;
  product: Types.ObjectId | IProduct;
  rating: number;
  comment: string;
  helpful: number;
  notHelpful: number;
  helpfulVotes: Array<Types.ObjectId | IUser>;
  notHelpfulVotes: Array<Types.ObjectId | IUser>;
  reported: boolean;
  reportReason?: string;
  reportedBy?: Array<Types.ObjectId | IUser>;
  status: 'pending' | 'approved' | 'rejected';
  moderated: boolean;
  moderatedAt?: Date;
  moderatedBy?: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulVotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    notHelpfulVotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    reported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      trim: true,
    },
    reportedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderated: {
      type: Boolean,
      default: false,
    },
    moderatedAt: {
      type: Date,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ reported: 1 });

// Middleware to update product rating on review changes
reviewSchema.post('save', async function(doc) {
  const Product = mongoose.model('Product');
  const reviews = await Review.find({ product: doc.product, status: 'approved' });
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await Product.findByIdAndUpdate(doc.product, {
      $set: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: reviews.length
      }
    });
  }
});

// Virtual for review age
reviewSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);
