import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { UNAUTHORIZED } from '../utils/errors';
import User from '../models/User';

// Define user type
export interface IUser {
  _id: string;
  name: string;
  email: string;
  collegeId: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
}

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw UNAUTHORIZED('Authentication required');
    }

    // Check if token format is correct (Bearer token)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw UNAUTHORIZED('Invalid token format');
    }

    const token = parts[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw UNAUTHORIZED('User not found');
      }

      // Check if user is verified
      if (!user.isVerified) {
        throw UNAUTHORIZED('Email verification required');
      }

      // Attach user to request
      req.user = user.toObject() as IUser;
      next();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw UNAUTHORIZED('Invalid token');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware (doesn't require auth but attaches user if token exists)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        req.user = user.toObject() as IUser;
      }
    } catch {
      // Ignore token errors in optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Admin only middleware
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(UNAUTHORIZED('Admin access required'));
  }
  next();
};
