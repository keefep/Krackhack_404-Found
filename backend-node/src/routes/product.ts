import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getSellerProducts,
  uploadProductImages,
} from '../controllers/product';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../utils/upload';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    price: z.number().min(0),
    images: z.array(z.string()).min(1),
    category: z.string(),
    condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
    location: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    price: z.number().min(0).optional(),
    images: z.array(z.string()).min(1).optional(),
    category: z.string().optional(),
    condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).optional(),
    location: z.string().optional(),
    status: z.enum(['available', 'sold', 'reserved']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const querySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    category: z.string().optional(),
    condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']).optional(),
    status: z.enum(['available', 'sold', 'reserved']).optional(),
    minPrice: z.string().regex(/^\d+$/).optional(),
    maxPrice: z.string().regex(/^\d+$/).optional(),
    q: z.string().optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  }),
});

// Public routes
router.get('/', validate(querySchema), getProducts);
router.get('/search', validate(querySchema), searchProducts);
router.get('/:id', validate(idParamSchema), getProduct);

// Protected routes
router.use(protect);

// Image upload route
router.post('/upload-images', upload.array('images', 5), uploadProductImages);

router.post('/', validate(createProductSchema), createProduct);
router.patch('/:id', validate({
  body: updateProductSchema.shape.body,
  params: idParamSchema.shape.params
}), updateProduct);
router.delete('/:id', validate(idParamSchema), deleteProduct);
router.get('/seller/products', validate(querySchema), getSellerProducts);

export default router;
