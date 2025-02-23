import { Express } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    export interface Request {
      user: IUser & { _id: Types.ObjectId };
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: IUser;
}

export interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}
