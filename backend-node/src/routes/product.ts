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
import { protect, withAuth, AuthenticatedHandler } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';
import { upload } from '../utils/upload';

const router = Router();

// Public routes
router.get('/', validate({
  query: schemas.product.search.query
}), withAuth(getProducts as AuthenticatedHandler));

router.get('/search', validate({
  query: schemas.product.search.query
}), withAuth(searchProducts as AuthenticatedHandler));

router.get('/:id', validate({
  params: schemas.product.getById.params
}), withAuth(getProduct as AuthenticatedHandler));

// Protected routes - apply auth middleware
router.use(protect());

// Image upload route with size and type validation
router.post(
  '/upload-images',
  upload.array('images', 5),
  withAuth(uploadProductImages as AuthenticatedHandler)
);

// Create product
router.post(
  '/',
  validate({
    body: schemas.product.create.body
  }),
  withAuth(createProduct as AuthenticatedHandler)
);

// Update product
router.patch(
  '/:id',
  validate({
    params: schemas.product.update.params,
    body: schemas.product.update.body
  }),
  withAuth(updateProduct as AuthenticatedHandler)
);

// Delete product
router.delete(
  '/:id',
  validate({
    params: schemas.product.getById.params
  }),
  withAuth(deleteProduct as AuthenticatedHandler)
);

// Get seller products
router.get(
  '/seller/products',
  validate({
    query: schemas.product.search.query
  }),
  withAuth(getSellerProducts as AuthenticatedHandler)
);

export default router;
