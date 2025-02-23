import { Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { ValidationError } from '../utils/errors';
import { processImages, deleteImages } from '../utils/upload';
import { AuthRequest, AuthFileRequest } from '../types/express';
import mongoose from 'mongoose';

export const uploadProductImages = async (
  req: AuthFileRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new ValidationError('No images uploaded');
    }

    const imageUrls = await processImages(req.files);

    res.status(200).json({
      status: 'success',
      data: {
        images: imageUrls
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.create({
      ...req.body,
      seller: req.user?._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, condition, status, minPrice, maxPrice } = req.query;
    const query: any = { deletedAt: null };

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name email rating');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email rating'
    );

    if (!product) {
      throw new ValidationError('Product not found');
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const oldProduct = await Product.findOne({
      _id: req.params.id,
      seller: req.user?._id,
    });

    if (!oldProduct) {
      throw new ValidationError('Product not found or unauthorized');
    }

    // If there are new images, delete old ones
    if (req.body.images && oldProduct.images) {
      const removedImages = oldProduct.images.filter(
        (img) => !req.body.images.includes(img)
      );
      if (removedImages.length > 0) {
        await deleteImages(removedImages);
      }
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user?._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user?._id,
    });

    if (!product) {
      throw new ValidationError('Product not found or unauthorized');
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
      await deleteImages(product.images);
    }

    // Soft delete the product
    product.deletedAt = new Date();
    product.status = 'sold';
    await product.save();

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    if (!q) {
      throw new ValidationError('Search query is required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query = {
      $text: { $search: q as string },
      deletedAt: null,
    };

    const products = await Product.find(query)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('seller', 'name email rating');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({
      seller: req.user?._id,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({
      seller: req.user?._id,
      deletedAt: null,
    });

    res.status(200).json({
      status: 'success',
      data: {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
