import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  seller: Types.ObjectId;
  buyer: Types.ObjectId;
  product: Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  sellerRating?: number;
  buyerRating?: number;
  completionTime?: number; // Time in minutes from creation to completion
  disputeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'disputed'],
      default: 'pending',
    },
    sellerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    buyerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    completionTime: {
      type: Number,
    },
    disputeReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ product: 1 });
transactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
