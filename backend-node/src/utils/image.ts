import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { ValidationError } from './errors';

interface ImageConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

interface ThumbnailConfig {
  width: number;
  height: number;
  quality: number;
}

export const processImage = async (
  filePath: string,
  config: ImageConfig = { maxWidth: 1920, maxHeight: 1080, quality: 80 }
): Promise<string> => {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new ValidationError('Invalid image file');
    }

    // Calculate new dimensions while maintaining aspect ratio
    let width = metadata.width;
    let height = metadata.height;

    if (width > config.maxWidth) {
      height = Math.round((height * config.maxWidth) / width);
      width = config.maxWidth;
    }

    if (height > config.maxHeight) {
      width = Math.round((width * config.maxHeight) / height);
      height = config.maxHeight;
    }

    const ext = path.extname(filePath);
    const processedPath = filePath.replace(ext, `-processed${ext}`);

    await image
      .resize(width, height)
      .jpeg({ quality: config.quality })
      .toFile(processedPath);

    // Remove original file
    await fs.unlink(filePath);

    return processedPath;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new ValidationError('Failed to process image');
  }
};

export const createThumbnail = async (
  filePath: string,
  config: ThumbnailConfig = { width: 200, height: 200, quality: 60 }
): Promise<string> => {
  try {
    const ext = path.extname(filePath);
    const thumbnailPath = filePath.replace(ext, `-thumb${ext}`);

    await sharp(filePath)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: config.quality })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    throw new ValidationError('Failed to create thumbnail');
  }
};

export const removeImage = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);

    // Also try to remove thumbnail if it exists
    const ext = path.extname(filePath);
    const thumbnailPath = filePath.replace(ext, `-thumb${ext}`);
    await fs.unlink(thumbnailPath).catch(() => {});
  } catch (error) {
    console.error('Image removal error:', error);
  }
};

export const getImageDimensions = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  try {
    const metadata = await sharp(filePath).metadata();

    if (!metadata.width || !metadata.height) {
      throw new ValidationError('Invalid image file');
    }

    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    console.error('Image dimension error:', error);
    throw new ValidationError('Failed to get image dimensions');
  }
};

export const validateImageFile = async (filePath: string): Promise<void> => {
  try {
    const metadata = await sharp(filePath).metadata();

    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
      throw new ValidationError('Invalid image format');
    }

    const stats = await fs.stat(filePath);
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (stats.size > maxSize) {
      throw new ValidationError('Image file size exceeds limit (5MB)');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    console.error('Image validation error:', error);
    throw new ValidationError('Failed to validate image');
  }
};
