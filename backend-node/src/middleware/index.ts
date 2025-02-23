import { authenticate, requireRole, requireOwnership } from './authenticate';
import { uploadMiddleware } from './upload';
import { validate, commonValidationRules } from './validate';
import { cacheMiddleware } from './cache';

export {
  // Authentication middleware
  authenticate,
  requireRole,
  requireOwnership,

  // File upload middleware
  uploadMiddleware,

  // Validation middleware
  validate,
  commonValidationRules,

  // Cache middleware
  cacheMiddleware,
};

// Common middleware combinations
export const authAndValidate = (validations: any[]) => [
  authenticate,
  validate(validations),
];

export const authAndCache = (options?: any) => [
  authenticate,
  cacheMiddleware.cache(options),
];

export const adminOnly = [
  authenticate,
  requireRole('admin'),
];

// Utility type for middleware composition
export type MiddlewareFunction = (
  ...args: any[]
) => (req: any, res: any, next: any) => void | Promise<void>;

// Helper to compose multiple middleware
export const composeMiddleware = (...middlewares: MiddlewareFunction[]) => {
  return middlewares.map(m => m());
};
