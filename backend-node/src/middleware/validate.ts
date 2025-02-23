import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { VALIDATION_ERROR } from '../utils/errors';

// Schema types
export type ValidationSchema = {
  query?: z.ZodSchema;
  body?: z.ZodSchema;
  params?: z.ZodSchema;
};

// Validation middleware
export const validate = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(VALIDATION_ERROR(error.issues));
      } else {
        next(error);
      }
    }
  };
};

// Common schema parts
export const schemas = {
  // Product related schemas
  product: {
    condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const),
    status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED'] as const),
    
    base: z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(2000),
      price: z.number().positive(),
      images: z.array(z.string()).min(1),
      category: z.string(),
      condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const),
      location: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),

    create: {
      body: z.object({
        title: z.string().min(3).max(100),
        description: z.string().min(10).max(2000),
        price: z.number().positive(),
        images: z.array(z.string()).min(1),
        category: z.string(),
        condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const),
        location: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    },

    update: {
      params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
      }),
      body: z.object({
        title: z.string().min(3).max(100).optional(),
        description: z.string().min(10).max(2000).optional(),
        price: z.number().positive().optional(),
        images: z.array(z.string()).min(1).optional(),
        category: z.string().optional(),
        condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const).optional(),
        status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED'] as const).optional(),
        location: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    },

    search: {
      query: z.object({
        q: z.string().optional(),
        page: z.coerce.number().positive().optional(),
        limit: z.coerce.number().positive().optional(),
        category: z.string().optional(),
        condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const).optional(),
        status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED'] as const).optional(),
        minPrice: z.coerce.number().nonnegative().optional(),
        maxPrice: z.coerce.number().positive().optional(),
        sortBy: z.enum(['price', 'createdAt', 'rating']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      }),
    },

    getById: {
      params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
      }),
    },
  },

  // Common utility schemas
  common: {
    objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
    pagination: z.object({
      page: z.coerce.number().positive().optional(),
      limit: z.coerce.number().positive().optional(),
    }),
    sorting: z.object({
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  },
};
