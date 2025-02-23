import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs/promises';
import { ValidationError } from './errors';

// Configure storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new ValidationError('Only JPEG, PNG and WebP images are allowed'));
    return;
  }
  
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Max 5 files
  },
  fileFilter
});

// Process and save images
export const processImages = async (files: Express.Multer.File[]): Promise<string[]> => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const imageUrls: string[] = [];

  for (const file of files) {
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Process image with sharp
    await sharp(file.buffer)
      .resize(800, 800, { // Resize to max dimensions while maintaining aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 }) // Convert to WebP format
      .toFile(filepath);

    imageUrls.push(`/uploads/${filename}`);
  }

  return imageUrls;
};

// Delete images
export const deleteImages = async (imageUrls: string[]) => {
  for (const url of imageUrls) {
    const filepath = path.join(process.cwd(), url);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};
