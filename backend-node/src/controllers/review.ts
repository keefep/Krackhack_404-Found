import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AuthRequest } from '../types/express';
import { ValidationError, AuthenticationError } from '../utils/errors';

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!req.user?._id) {
      throw new AuthenticationError('User not found');
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      reviewer: req.user._id
    });

    if (existingReview) {
      throw new ValidationError('You have already reviewed this product');
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new ValidationError('Product not found');
    }

    // Create review
    const review = await Review.create({
      product: productId,
      reviewer: req.user._id,
      rating,
      comment,
      status: 'pending', // Reviews need moderation before being approved
    });

    await review.populate('reviewer', 'name email');

    res.status(201).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      product: productId,
      status: 'approved',
    })
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      product: productId,
      status: 'approved',
    });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    if (!req.user?._id) {
      throw new AuthenticationError('User not found');
    }

    const review = await Review.findOne({
      _id: reviewId,
      reviewer: req.user._id,
    });

    if (!review) {
      throw new ValidationError('Review not found or unauthorized');
    }

    if (review.status === 'approved') {
      throw new ValidationError('Cannot edit an approved review');
    }

    review.rating = rating;
    review.comment = comment;
    review.status = 'pending'; // Back to moderation queue
    await review.save();

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    if (!req.user?._id) {
      throw new AuthenticationError('User not found');
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      reviewer: req.user._id,
    });

    if (!review) {
      throw new ValidationError('Review not found or unauthorized');
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    if (!req.user?._id) {
      throw new AuthenticationError('User not found');
    }

    if (!req.user.role?.includes('moderator')) {
      throw new AuthenticationError('Not authorized to moderate reviews');
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ValidationError('Review not found');
    }

    review.status = status;
    review.moderated = true;
    review.moderatedAt = new Date();
    review.moderatedBy = req.user._id;

    await review.save();

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const reportReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    if (!req.user?._id) {
      throw new AuthenticationError('User not found');
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ValidationError('Review not found');
    }

    const reportedByArray = review.reportedBy || [];
    if (reportedByArray.some(id => id.toString() === req.user?._id.toString())) {
      throw new ValidationError('You have already reported this review');
    }

    review.reported = true;
    review.reportReason = reason;
    reportedByArray.push(req.user._id);
    review.reportedBy = reportedByArray;

    await review.save();

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const voteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body; // 'helpful' or 'notHelpful'
    if (!req.user?._id) {
      throw new AuthenticationError('User not found');
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ValidationError('Review not found');
    }

    // Initialize arrays if they don't exist
    review.helpfulVotes = review.helpfulVotes || [];
    review.notHelpfulVotes = review.notHelpfulVotes || [];

    // Remove existing votes
    review.helpfulVotes = review.helpfulVotes.filter(
      id => id.toString() !== req.user?._id.toString()
    );
    review.notHelpfulVotes = review.notHelpfulVotes.filter(
      id => id.toString() !== req.user?._id.toString()
    );

    // Add new vote
    if (voteType === 'helpful') {
      review.helpfulVotes.push(req.user._id);
    } else if (voteType === 'notHelpful') {
      review.notHelpfulVotes.push(req.user._id);
    }

    // Update counts
    review.helpful = review.helpfulVotes.length;
    review.notHelpful = review.notHelpfulVotes.length;

    await review.save();

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.role?.includes('moderator')) {
      throw new AuthenticationError('Not authorized to view pending reviews');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ status: 'pending' })
      .populate('reviewer', 'name email')
      .populate('product', 'title')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ status: 'pending' });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
