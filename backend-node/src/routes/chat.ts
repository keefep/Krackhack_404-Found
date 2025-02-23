import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import {
  createChat,
  sendMessage,
  getMessages,
  markAsRead,
  getUserChats,
} from '../controllers/chat';
import { AuthRequest } from '../types/express';

const router = express.Router();

// Validation schemas
const createChatSchema = z.object({
  body: z.object({
    participantId: z.string().nonempty(),
    message: z.string().min(1).max(1000),
  }),
});

const sendMessageSchema = z.object({
  body: z.object({
    chatId: z.string().nonempty(),
    message: z.string().min(1).max(1000),
  }),
});

// Type definitions for request handlers
type CreateChatRequest = Request & { body: z.infer<typeof createChatSchema>['body'] };
type SendMessageRequest = Request & { body: z.infer<typeof sendMessageSchema>['body'] };

interface TypedRequestHandler<T extends Request = Request> extends RequestHandler {
  (req: T, res: Response, next: NextFunction): Promise<void>;
}

// Apply authentication middleware to all routes
router.use(protect);

// Chat routes with proper typing
router.post('/',
  validate(createChatSchema),
  createChat as TypedRequestHandler<CreateChatRequest>
);

router.post('/message',
  validate(sendMessageSchema),
  sendMessage as TypedRequestHandler<SendMessageRequest>
);

router.get('/messages/:chatId',
  getMessages as TypedRequestHandler<AuthRequest>
);

router.post('/messages/:chatId/read',
  markAsRead as TypedRequestHandler<AuthRequest>
);

router.get('/',
  getUserChats as TypedRequestHandler<AuthRequest>
);

export default router;
