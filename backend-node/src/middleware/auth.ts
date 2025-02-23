import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/tokenManager';
import { AuthenticationError } from '../utils/errors';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User belonging to this token no longer exists');
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        status: 'error',
        message: error.message,
        code: 'INVALID_TOKEN'
      });
    } else {
      next(error);
    }
  }
};

// Optional auth middleware - doesn't require authentication but will populate req.user if token exists
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Role-based authorization middleware
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AuthenticationError('Not authorized to access this route');
    }
    next();
  };
};

// Rate limiting middleware (simple implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const requestInfo = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > requestInfo.resetTime) {
      requestInfo.count = 1;
      requestInfo.resetTime = now + windowMs;
    } else {
      requestInfo.count += 1;
    }

    requestCounts.set(ip, requestInfo);

    if (requestInfo.count > maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    next();
  };
};
