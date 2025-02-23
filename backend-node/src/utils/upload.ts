import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BAD_REQUEST } from './errors';

// Ensure uploads directory exists
const UPLOAD_DIR = 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WEBP are allowed.'));
  }
};

// Export multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maximum 5 files
  }
});

// Types for file upload response
export interface UploadResult {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

// Helper function to process uploaded files
export const processUploadedFiles = (files: Express.Multer.File[]): UploadResult[] => {
  return files.map(file => ({
    filename: file.filename,
    path: `/uploads/${file.filename}`, // URL path
    size: file.size,
    mimetype: file.mimetype
  }));
};

// Helper function to delete files
export const deleteFiles = (filenames: string[]) => {
  filenames.forEach(filename => {
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  });
};
