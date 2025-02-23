import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { Types } from 'mongoose';
import { z, ZodError } from 'zod';

interface SchemaConfig {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}

// Zod schema validation middleware
export const validate = (schema: z.ZodTypeAny | SchemaConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema instanceof z.ZodType) {
        // If schema is a direct Zod schema, validate body
        req.body = await schema.parseAsync(req.body);
      } else {
        // If schema is a config object, validate respective parts
        if (schema.body) {
          req.body = await schema.body.parseAsync(req.body);
        }
        if (schema.query) {
          req.query = await schema.query.parseAsync(req.query);
        }
        if (schema.params) {
          req.params = await schema.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(error.errors.map(err => err.message).join(', ')));
      } else {
        next(error);
      }
    }
  };
};

// Legacy validation middleware
export const validateLegacy = {
  // Chat validation
  chat: (req: Request, res: Response, next: NextFunction) => {
    const { participants, productId } = req.body;

    if (!participants || !Array.isArray(participants)) {
      throw new ValidationError('Participants must be an array');
    }

    if (participants.length < 2) {
      throw new ValidationError('Chat must have at least 2 participants');
    }

    // Validate participant IDs
    participants.forEach(id => {
      if (!Types.ObjectId.isValid(id)) {
        throw new ValidationError(`Invalid participant ID: ${id}`);
      }
    });

    // Validate product ID if provided
    if (productId && !Types.ObjectId.isValid(productId)) {
      throw new ValidationError('Invalid product ID');
    }

    next();
  },

  // Message validation
  message: (req: Request, res: Response, next: NextFunction) => {
    const { content, type, fileUrl, fileName, fileSize } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError('Message content is required');
    }

    // Validate message type
    if (type && !['text', 'image', 'file'].includes(type)) {
      throw new ValidationError('Invalid message type');
    }

    // Validate file-related fields if type is file or image
    if ((type === 'file' || type === 'image')) {
      if (!fileUrl) {
        throw new ValidationError('File URL is required for file/image messages');
      }

      if (type === 'file' && (!fileName || !fileSize)) {
        throw new ValidationError('File name and size are required for file messages');
      }
    }

    // Validate file size if provided
    if (fileSize && (typeof fileSize !== 'number' || fileSize <= 0)) {
      throw new ValidationError('Invalid file size');
    }

    next();
  },

  // Chat ID parameter validation
  chatId: (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;

    if (!Types.ObjectId.isValid(chatId)) {
      throw new ValidationError('Invalid chat ID');
    }

    next();
  },

  // Product ID parameter validation
  productId: (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    if (!Types.ObjectId.isValid(productId)) {
      throw new ValidationError('Invalid product ID');
    }

    next();
  },

  // Pagination query parameters
  pagination: (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (page < 1) {
      throw new ValidationError('Page number must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    next();
  },
};
