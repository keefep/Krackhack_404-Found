class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const BAD_REQUEST = (message: string) => new AppError(message, 400);
export const UNAUTHORIZED = (message: string) => new AppError(message, 401);
export const FORBIDDEN = (message: string) => new AppError(message, 403);
export const NOT_FOUND = (message: string) => new AppError(message, 404);
export const CONFLICT = (message: string) => new AppError(message, 409);
export const INTERNAL_SERVER_ERROR = (message: string = 'Internal server error') => 
  new AppError(message, 500);

// Generic error handler
export const handleError = (err: any) => {
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`${field} already exists`, 409);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return new AppError(errors.join('. '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401);
  }

  // Default to internal server error
  return err instanceof AppError ? err : INTERNAL_SERVER_ERROR();
};

export default AppError;
