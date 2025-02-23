import { Router, Request, Response, NextFunction } from 'express';
import { chatController } from '../controllers/chat';
import { authenticate } from '../middleware/authenticate';
import { validateLegacy as validate } from '../middleware/validate';
import { AuthRequest } from '../types/express';

const router = Router();

// Helper type for async route handlers
type AsyncHandler<T = any> = (
  req: Request | AuthRequest,
  res: Response<T>,
  next: NextFunction
) => Promise<any>;

// Helper to wrap async handlers
const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Apply authentication to all chat routes
router.use(authenticate);

// Cast controller methods to AsyncHandler type
router.post('/', validate.chat, asyncHandler(chatController.create as AsyncHandler));

router.get('/', validate.pagination, asyncHandler(chatController.getChats as AsyncHandler));

router.get('/:chatId/messages',
  validate.chatId,
  validate.pagination,
  asyncHandler(chatController.getMessages as AsyncHandler)
);

router.post('/:chatId/messages',
  validate.chatId,
  validate.message,
  asyncHandler(chatController.sendMessage as AsyncHandler)
);

router.post('/:chatId/read',
  validate.chatId,
  asyncHandler(chatController.markAsRead as AsyncHandler)
);

router.delete('/:chatId',
  validate.chatId,
  asyncHandler(chatController.deleteChat as AsyncHandler)
);

export default router;
