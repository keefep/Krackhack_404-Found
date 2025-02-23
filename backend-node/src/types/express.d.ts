import { Request } from 'express';
import { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface FileRequest extends Request {
  files?: Express.Multer.File[];
}

export interface AuthFileRequest extends AuthRequest {
  files?: Express.Multer.File[];
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
