import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ValidationError } from '../utils/errors';
import { updateUserCredibilityScore, meetsScoreRequirement } from '../utils/scoring';
import { emitToUser } from '../utils/socket';

// Create a new transaction
export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.body;
    const buyerId = req.user._id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      throw new ValidationError('Product not found');
    }

    // Check if product is available
    if (product.status !== 'available') {
      throw new ValidationError('Product is not available');
    }

    // Get seller's credibility score
    const seller = await User.findById(product.seller);
    if (!seller) {
      throw new ValidationError('Seller not found');
    }

    // Check minimum credibility requirements
    if (!meetsScoreRequirement(seller.credibilityScore || 0)) {
      throw new ValidationError('Seller does not meet minimum credibility requirements');
    }

    // Create transaction
    const transaction = await Transaction.create({
      seller: product.seller,
      buyer: buyerId,
      product: productId,
      amount: product.price,
      status: 'pending'
    });

    // Update product status
    await Product.findByIdAndUpdate(productId, { status: 'pending' });

    // Notify seller
    emitToUser(product.seller.toString(), 'newTransaction', {
      transactionId: transaction._id,
      productId: product._id,
      buyerId
    });

    res.status(201).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Complete a transaction
export const completeTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new ValidationError('Transaction not found');
    }

    // Verify user is part of transaction
    const isSeller = transaction.seller.equals(userId);
    const isBuyer = transaction.buyer.equals(userId);
    if (!isSeller && !isBuyer) {
      throw new ValidationError('Not authorized to complete this transaction');
    }

    // Calculate completion time
    const completionTime = Math.floor(
      (Date.now() - transaction.createdAt.getTime()) / (1000 * 60)
    );

    // Update transaction
    if (isSeller) {
      transaction.sellerRating = rating;
    } else {
      transaction.buyerRating = rating;
    }

    if (transaction.sellerRating && transaction.buyerRating) {
      transaction.status = 'completed';
      transaction.completionTime = completionTime;

      // Update product status
      await Product.findByIdAndUpdate(transaction.product, { status: 'sold' });

      // Update credibility scores
      await Promise.all([
        updateUserCredibilityScore(transaction.seller),
        updateUserCredibilityScore(transaction.buyer)
      ]);

      // Notify users
      emitToUser(transaction.seller.toString(), 'transactionCompleted', {
        transactionId: transaction._id
      });
      emitToUser(transaction.buyer.toString(), 'transactionCompleted', {
        transactionId: transaction._id
      });
    }

    await transaction.save();

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a transaction
export const cancelTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new ValidationError('Transaction not found');
    }

    // Verify user is part of transaction
    if (!transaction.seller.equals(userId) && !transaction.buyer.equals(userId)) {
      throw new ValidationError('Not authorized to cancel this transaction');
    }

    // Only pending transactions can be cancelled
    if (transaction.status !== 'pending') {
      throw new ValidationError('Cannot cancel a non-pending transaction');
    }

    transaction.status = 'cancelled';
    await transaction.save();

    // Update product status
    await Product.findByIdAndUpdate(transaction.product, { status: 'available' });

    // Update credibility scores
    await Promise.all([
      updateUserCredibilityScore(transaction.seller),
      updateUserCredibilityScore(transaction.buyer)
    ]);

    // Notify other party
    const otherPartyId = transaction.seller.equals(userId)
      ? transaction.buyer.toString()
      : transaction.seller.toString();
    
    emitToUser(otherPartyId, 'transactionCancelled', {
      transactionId: transaction._id
    });

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Report a dispute
export const reportDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new ValidationError('Transaction not found');
    }

    // Verify user is part of transaction
    if (!transaction.seller.equals(userId) && !transaction.buyer.equals(userId)) {
      throw new ValidationError('Not authorized to report this transaction');
    }

    transaction.status = 'disputed';
    transaction.disputeReason = reason;
    await transaction.save();

    // Notify both parties
    emitToUser(transaction.seller.toString(), 'transactionDisputed', {
      transactionId: transaction._id,
      reason
    });
    emitToUser(transaction.buyer.toString(), 'transactionDisputed', {
      transactionId: transaction._id,
      reason
    });

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's transactions
export const getUserTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const query: any = {
      $or: [{ seller: userId }, { buyer: userId }]
    };

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .populate('product')
      .populate('seller', 'name email credibilityScore')
      .populate('buyer', 'name email credibilityScore');

    res.status(200).json({
      status: 'success',
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};
