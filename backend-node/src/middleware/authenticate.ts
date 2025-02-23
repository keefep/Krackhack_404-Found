import { Response, NextFunction } from 'express';
import { Request, AuthenticatedRequest, RouteHandler } from '../types/express';
import { verifyToken } from '../utils/auth';
import { User } from '../models/User';
import { AuthenticationError } from '../utils/errors';
import { TokenPayload } from '../types';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate: RouteHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    const decoded = verifyToken(token);
    const user = await findUserFromToken(decoded);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (...roles: string[]): RouteHandler<AuthenticatedRequest> => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Authentication is guaranteed by AuthenticatedRequest type
    if (!roles.includes(req.user.role)) {
      return next(new AuthenticationError('Insufficient permissions'));
    }
    next();
  };
};

/**
 * Middleware to check if user is accessing their own resource
 */
export const requireOwnership = (userIdPath: string): RouteHandler<AuthenticatedRequest> => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Authentication is guaranteed by AuthenticatedRequest type
    const resourceUserId = getValueFromPath(req, userIdPath);
    if (!resourceUserId) {
      return next(new AuthenticationError('Invalid resource identifier'));
    }

    // Admin can access any resource, otherwise check if it belongs to the user
    if (req.user.role !== 'admin' && req.user._id.toString() !== resourceUserId) {
      return next(new AuthenticationError('Access denied'));
    }

    next();
  };
};

// Helper Functions

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

async function findUserFromToken(decoded: TokenPayload) {
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AuthenticationError('User not found');
  }
  return user;
}

function getValueFromPath(obj: any, path: string): string | null {
  return path.split('.').reduce((curr, key) => curr?.[key], obj) || null;
}
