import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Chat, IMessageData } from '../models/Chat';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { io } from '../utils/socket';
import { AuthRequest } from '../types/express';

export const chatController = {
  // Create a new chat between users
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { participantIds, productId } = req.body;
      const chat = await Chat.create({
        participants: participantIds,
        product: productId,
        messages: []
      });
      res.status(201).json({ status: 'success', data: chat });
      return;
    } catch (error) {
      next(error);
    }
  },
  getChats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }
      const chats = await Chat.find({ 
        participants: userId,
        active: true 
      }).sort({ updatedAt: -1 });
      res.status(200).json({ status: 'success', data: chats });
      return;
    } catch (error) {
      next(error);
    }
  },
  getMessages: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ status: 'error', message: 'Chat not found' });
      }

      // Decrypt messages before sending
      const decryptedMessages = chat.messages.map(msg => ({
        ...msg.toObject(),
        content: msg.type === 'text' ? decryptMessage(msg.content) : msg.content
      }));

      res.status(200).json({ status: 'success', data: decryptedMessages });
      return;
    } catch (error) {
      next(error);
    }
  },
  sendMessage: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const { content, type = 'text' } = req.body;
      const senderId = req.user?._id;

      if (!senderId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ status: 'error', message: 'Chat not found' });
      }

      // Encrypt message content if it's text
      const messageData: IMessageData = {
        sender: senderId,
        content: type === 'text' ? encryptMessage(content) : content,
        type,
        readBy: [senderId],
        deleted: false
      };

      await chat.addMessage(messageData);

      // Notify other participants
      chat.participants
        .filter(participantId => participantId.toString() !== senderId.toString())
        .forEach(participantId => {
          io.to(`user_${participantId}`).emit('new_message', {
            chatId,
            message: {
              ...messageData,
              content: content // Send decrypted content for real-time display
            }
          });
        });

      res.status(200).json({ status: 'success', data: 'Message sent' });
      return;
    } catch (error) {
      next(error);
    }
  },
  markAsRead: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ status: 'error', message: 'Chat not found' });
      }

      await chat.markAsRead(userId);

      // Notify other participants about read status
      chat.participants
        .filter(participantId => participantId.toString() !== userId.toString())
        .forEach(participantId => {
          io.to(`user_${participantId}`).emit('messages_read', {
            chatId,
            userId
          });
        });

      res.status(200).json({ status: 'success', data: 'Messages marked as read' });
      return;
    } catch (error) {
      next(error);
    }
  },
  deleteChat: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { chatId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ status: 'error', message: 'Chat not found' });
      }

      if (!chat.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({ status: 'error', message: 'Not authorized to delete this chat' });
      }

      // Soft delete by setting active to false
      chat.active = false;
      await chat.save();

      // Notify other participants
      chat.participants
        .filter(participantId => participantId.toString() !== userId.toString())
        .forEach(participantId => {
          io.to(`user_${participantId}`).emit('chat_deleted', {
            chatId
          });
        });

      res.status(200).json({ status: 'success', data: 'Chat deleted' });
      return;
    } catch (error) {
      next(error);
    }
  },
};
