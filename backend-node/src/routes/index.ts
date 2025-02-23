import { Router } from 'express';
import chatRoutes from './chat';
import authRoutes from './auth';
import productRoutes from './product';
import reviewRoutes from './review';
import notificationRoutes from './notification';

const router = Router();

// Default route
router.get('/', (req, res) => {
  res.send('API is running.');
});

// API Routes
router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);

export default router;
