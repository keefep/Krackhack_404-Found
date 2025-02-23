import express from 'express';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  moderateReview,
  reportReview,
  voteReview,
  getPendingReviews,
} from '../controllers/review';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10).max(1000),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(10).max(1000),
  }),
  params: z.object({
    reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID'),
  }),
});

const reviewIdParamSchema = z.object({
  params: z.object({
    reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID'),
  }),
});

const productIdParamSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  }),
});

const moderateReviewSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    moderationComment: z.string().optional(),
  }),
  params: z.object({
    reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID'),
  }),
});

const reportReviewSchema = z.object({
  body: z.object({
    reason: z.string().min(10).max(500),
  }),
  params: z.object({
    reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID'),
  }),
});

const voteReviewSchema = z.object({
  body: z.object({
    voteType: z.enum(['helpful', 'notHelpful']),
  }),
  params: z.object({
    reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid review ID'),
  }),
});

const querySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

// Public routes
router.get(
  '/product/:productId',
  validate(productIdParamSchema),
  validate(querySchema),
  getProductReviews
);

// Protected routes
router.use(protect);

// Regular user routes
router.post('/', validate(createReviewSchema), createReview);
router.patch('/:reviewId', validate(updateReviewSchema), updateReview);
router.delete('/:reviewId', validate(reviewIdParamSchema), deleteReview);
router.post(
  '/:reviewId/report',
  validate(reportReviewSchema),
  reportReview
);
router.post(
  '/:reviewId/vote',
  validate(voteReviewSchema),
  voteReview
);

// Moderator routes
router.get(
  '/pending',
  restrictTo('moderator'),
  validate(querySchema),
  getPendingReviews
);
router.patch(
  '/:reviewId/moderate',
  restrictTo('moderator'),
  validate(moderateReviewSchema),
  moderateReview
);

export default router;
