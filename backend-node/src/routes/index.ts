import { Router } from 'express';
import productRoutes from './product';
import authRoutes from './auth';
import chatRoutes from './chat';
import notificationRoutes from './notification';
import transactionRoutes from './transaction';
import reviewRoutes from './review';

const router = Router();

// Mount routes
router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/transactions', transactionRoutes);
router.use('/reviews', reviewRoutes);

// Version info endpoint
router.get('/version', (req, res) => {
  res.json({
    name: 'IIT Mandi Marketplace API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
