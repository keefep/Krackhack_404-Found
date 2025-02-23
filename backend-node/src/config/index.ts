import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iit-mandi-marketplace';
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Email configuration
export const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
};

// Upload configuration
export const UPLOAD_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

// App configuration
export const APP_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxUploadFiles: 5,
};

// Export all as default for backwards compatibility
export default {
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  NODE_ENV,
  EMAIL_CONFIG,
  UPLOAD_CONFIG,
  APP_CONFIG,
};
