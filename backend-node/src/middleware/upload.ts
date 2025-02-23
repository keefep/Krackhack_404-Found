import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { ValidationError } from '../utils/errors';

// Configure storage
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: DestinationCallback) => {
    cb(null, 'uploads/');
  },
  filename: (_req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Upload middleware configurations
export const uploadMiddleware = {
  // Single file upload
  single: (fieldName: string) => upload.single(fieldName),

  // Multiple files for the same field
  array: (fieldName: string, maxCount: number = 5) => upload.array(fieldName, maxCount),

  // Multiple files with different fields
  fields: (fields: { name: string; maxCount: number }[]) => upload.fields(fields),
};

// Image processing configuration
export const imageConfig = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  thumbnailWidth: 200,
  thumbnailHeight: 200,
  thumbnailQuality: 60,
};

// File type validation helper
export const validateFileType = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  return validExtensions.includes(ext);
};

// Generate thumbnail path
export const getThumbnailPath = (originalPath: string): string => {
  const ext = path.extname(originalPath);
  return originalPath.replace(ext, `-thumb${ext}`);
};
