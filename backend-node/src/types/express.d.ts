import { Request } from 'express';
import { UserDocument } from '../models/User';

declare global {
  namespace Express {
    export interface Request {
      user?: UserDocument;
      body: any;
      cookies: {
        refreshToken?: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: UserDocument;
}

// This empty export is needed to make the file a module
export {};
