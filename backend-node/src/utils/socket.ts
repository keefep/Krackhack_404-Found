import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './tokenManager';
import { AuthenticationError } from './errors';
import { UserDocument } from '../models/User';
import { EncryptedMessage } from './encryption';

interface SocketWithUser extends Socket {
  userId?: string;
  userData?: UserDocument;
}

let io: Server;

export const initializeSocket = (server: HTTPServer): void => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: SocketWithUser, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new AuthenticationError('No token provided');
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new AuthenticationError('Invalid token'));
    }
  });

  io.on('connection', (socket: SocketWithUser) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for direct messages
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Handle joining chat rooms
    socket.on('joinChat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on('leaveChat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Handle typing indicators
    socket.on('typing', ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${chatId}`).emit('userTyping', {
        userId: socket.userId,
        isTyping,
      });
    });

    // Handle encrypted message
    socket.on('encryptedMessage', (data: {
      chatId: string;
      message: EncryptedMessage;
      timestamp: Date;
    }) => {
      socket.to(`chat:${data.chatId}`).emit('newEncryptedMessage', {
        senderId: socket.userId,
        ...data,
      });
    });

    // Handle read receipts
    socket.on('messageRead', ({ chatId, messageIds }: { chatId: string; messageIds: string[] }) => {
      socket.to(`chat:${chatId}`).emit('messagesRead', {
        userId: socket.userId,
        messageIds,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

// Utility functions for emitting events
export const emitToUser = (userId: string, event: string, data: any): void => {
  io.to(userId).emit(event, data);
};

export const emitToChat = (chatId: string, event: string, data: any): void => {
  io.to(`chat:${chatId}`).emit(event, data);
};

// Export io instance
export { io };

// Types for socket events
export interface SocketEvents {
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  typing: (data: { chatId: string; isTyping: boolean }) => void;
  encryptedMessage: (data: {
    chatId: string;
    message: EncryptedMessage;
    timestamp: Date;
  }) => void;
  messageRead: (data: { chatId: string; messageIds: string[] }) => void;
}

export interface ServerToClientEvents {
  userTyping: (data: { userId: string; isTyping: boolean }) => void;
  newEncryptedMessage: (data: {
    senderId: string;
    chatId: string;
    message: EncryptedMessage;
    timestamp: Date;
  }) => void;
  messagesRead: (data: { userId: string; messageIds: string[] }) => void;
}
