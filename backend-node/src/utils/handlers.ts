import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

type AsyncRequestHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

export const asyncHandler = (handler: AsyncRequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export const sendResponse = <T>(
  res: Response,
  {
    status = 'success',
    message,
    data,
    meta,
    statusCode = 200,
  }: Partial<ApiResponse<T>> & { statusCode?: number }
): void => {
  res.status(statusCode).json({
    status,
    ...(message && { message }),
    ...(data && { data }),
    ...(meta && { meta }),
  });
};

export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasMore: page * limit < total,
});

// Query helper to standardize pagination
export const getPaginationParams = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Query helper to standardize sorting
export const getSortParams = (
  req: Request,
  defaultSort: string = '-createdAt'
) => {
  const sortField = (req.query.sortBy as string) || defaultSort;
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField.replace(/^-/, '')]: sortOrder };

  return sort;
};

// Query helper to standardize field selection
export const getSelectFields = (req: Request, defaultFields?: string) => {
  return (req.query.fields as string) || defaultFields || '';
};

// Query helper to standardize filtering
export const getFilterParams = (req: Request, allowedFields: string[]) => {
  const filters: Record<string, any> = {};
  
  allowedFields.forEach(field => {
    if (req.query[field] !== undefined) {
      filters[field] = req.query[field];
    }
  });

  return filters;
};

// Query helper to standardize search
export const getSearchQuery = (
  req: Request,
  searchableFields: string[]
) => {
  const searchTerm = req.query.search as string;
  if (!searchTerm) return {};

  return {
    $or: searchableFields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    })),
  };
};
