import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserDocument } from '../models/User';
import { ValidationError } from './errors';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-jwt-secret';
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: string;
  role: string;
}

export const generateTokens = (user: UserDocument) => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    role: user.role,
  };

  const accessTokenOptions: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };

  const refreshTokenOptions: jwt.SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };

  // Generate access token
  const accessToken = jwt.sign(payload, JWT_SECRET, accessTokenOptions);

  // Generate refresh token
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, refreshTokenOptions);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new ValidationError('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new ValidationError('Invalid refresh token');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ValidationError('No token found');
  }

  return authHeader.split(' ')[1];
};

export const generateResetToken = (userId: string | Types.ObjectId): string => {
  const resetTokenOptions: jwt.SignOptions = {
    expiresIn: '1h',
  };

  return jwt.sign({ id: userId.toString() }, JWT_SECRET, resetTokenOptions);
};

export const verifyResetToken = (token: string): { id: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch (error) {
    throw new ValidationError('Invalid or expired reset token');
  }
};
