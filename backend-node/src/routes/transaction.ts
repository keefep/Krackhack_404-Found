import express, { RequestHandler } from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import {
  createTransaction,
  completeTransaction,
  cancelTransaction,
  reportDispute,
  getUserTransactions,
} from '../controllers/transaction';
import { AuthRequest } from '../types/express';

const router = express.Router();

// Validation schemas
const createTransactionSchema = z.object({
  body: z.object({
    productId: z.string().nonempty('Product ID is required'),
  }),
});

const completeTransactionSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
  }),
  params: z.object({
    transactionId: z.string().nonempty('Transaction ID is required'),
  }),
});

const disputeSchema = z.object({
  body: z.object({
    reason: z.string().min(10, 'Please provide a detailed reason'),
  }),
  params: z.object({
    transactionId: z.string().nonempty('Transaction ID is required'),
  }),
});

const getTransactionsSchema = z.object({
  query: z.object({
    status: z
      .enum(['pending', 'completed', 'cancelled', 'disputed'])
      .optional(),
  }).optional(),
});

// Type definitions for request parameters
type CreateTransactionRequest = AuthRequest & {
  body: z.infer<typeof createTransactionSchema>['body'];
};

type CompleteTransactionRequest = AuthRequest & {
  body: z.infer<typeof completeTransactionSchema>['body'];
  params: z.infer<typeof completeTransactionSchema>['params'];
};

type DisputeRequest = AuthRequest & {
  body: z.infer<typeof disputeSchema>['body'];
  params: z.infer<typeof disputeSchema>['params'];
};

type GetTransactionsRequest = AuthRequest & {
  query: z.infer<typeof getTransactionsSchema>['query'];
};

// Apply authentication middleware to all routes
router.use(protect);

// Transaction routes with proper typing
router.post(
  '/',
  validate(createTransactionSchema),
  createTransaction as RequestHandler<{}, any, CreateTransactionRequest['body']>
);

router.patch(
  '/:transactionId/complete',
  validate(completeTransactionSchema),
  completeTransaction as RequestHandler<
    CompleteTransactionRequest['params'],
    any,
    CompleteTransactionRequest['body']
  >
);

router.patch(
  '/:transactionId/cancel',
  validate(z.object({
    params: z.object({
      transactionId: z.string().nonempty('Transaction ID is required'),
    }),
  })),
  cancelTransaction as RequestHandler
);

router.post(
  '/:transactionId/dispute',
  validate(disputeSchema),
  reportDispute as RequestHandler<
    DisputeRequest['params'],
    any,
    DisputeRequest['body']
  >
);

router.get(
  '/',
  validate(getTransactionsSchema),
  getUserTransactions as RequestHandler<{}, any, {}, GetTransactionsRequest['query']>
);

export default router;
