import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { BAD_REQUEST, NOT_FOUND, FORBIDDEN } from '../utils/errors';
import Product from '../models/Product';
import { processUploadedFiles, deleteFiles } from '../utils/upload';
import { Types } from 'mongoose';

// Helper function to check if seller ID matches
const isSellerMatch = (sellerId: Types.ObjectId | null, userId: Types.ObjectId): boolean => {
  return sellerId !== null && sellerId.toString() === userId.toString();
};

// Get products with filtering and pagination
export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, category, condition, status, minPrice, maxPrice, sortBy, sortOrder } = req.query;

    // Build query
    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort
    const sort: Record<string, any> = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const products = await Product.find(query)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('seller', 'name email');

    const total = await Product.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        products,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search products
export const searchProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q, ...filters } = req.query;
    const query: Record<string, any> = {};

    // Text search if query provided
    if (q) {
      query.$text = { $search: q as string };
    }

    // Apply filters
    if (filters.category) query.category = filters.category;
    if (filters.condition) query.condition = filters.condition;
    if (filters.status) query.status = filters.status;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    const products = await Product.find(query)
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .populate('seller', 'name email');

    res.json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
export const getProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    if (!product) {
      throw NOT_FOUND('Product not found');
    }
    res.json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await Product.create({
      ...req.body,
      seller: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw NOT_FOUND('Product not found');
    }

    if (!isSellerMatch(product.seller as Types.ObjectId, req.user._id)) {
      throw FORBIDDEN('You can only update your own products');
    }

    // If images are being updated, delete old ones
    if (req.body.images && product.images) {
      const oldImages = product.images.map(img => img.split('/').pop() || '');
      deleteFiles(oldImages);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    res.json({
      status: 'success',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw NOT_FOUND('Product not found');
    }

    if (!isSellerMatch(product.seller as Types.ObjectId, req.user._id)) {
      throw FORBIDDEN('You can only delete your own products');
    }

    // Delete product images
    const images = product.images.map(img => img.split('/').pop() || '');
    deleteFiles(images);

    await product.deleteOne();

    res.json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get seller's products
export const getSellerProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email');

    res.json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Upload product images
export const uploadProductImages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      throw BAD_REQUEST('No images uploaded');
    }

    const results = processUploadedFiles(req.files);

    res.json({
      status: 'success',
      data: results.map(img => img.path),
    });
  } catch (error) {
    // If error occurs, clean up any uploaded files
    if (req.files && Array.isArray(req.files)) {
      const filenames = req.files.map(f => f.filename);
      deleteFiles(filenames);
    }
    next(error);
  }
};
