import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Chat, IChat } from '../models/Chat';
import { AuthRequest } from '../types/express';
import { ValidationError } from '../utils/errors';
import { encrypt, decrypt, generateChatRoomSecret, EncryptedMessage } from '../utils/encryption';
import { io } from '../utils/socket';

interface CreateChatRequest extends Request {
  body: {
    participantId: string;
    message: string;
  };
}

interface SendMessageRequest extends Request {
  body: {
    chatId: string;
    message: string;
  };
}

export const createChat = async (
  req: CreateChatRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { participantId, message } = req.body;
    const userId = (req as AuthRequest).user._id;

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: {
        $all: [userId, new Types.ObjectId(participantId)],
        $size: 2
      }
    });

    if (existingChat) {
      return res.status(200).json({
        status: 'success',
        data: { chat: existingChat }
      });
    }

    // Generate encryption key for the new chat
    const encryptionKey = generateChatRoomSecret();

    // Encrypt the first message
    const encryptedContent = encrypt(message, encryptionKey);

    // Create new chat
    const chat = await Chat.create({
      participants: [userId, participantId],
      encryptionKey,
      messages: [{
        sender: userId,
        content: encryptedContent,
        readBy: [userId]
      }],
      lastMessage: {
        sender: userId,
        timestamp: new Date(),
        preview: message.substring(0, 50) // Store truncated preview
      }
    });

    // Notify the other participant
    io.to(participantId).emit('newChat', {
      chatId: chat._id,
      senderId: userId
    });

    res.status(201).json({
      status: 'success',
      data: { chat }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: SendMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, message } = req.body;
    const userId = (req as AuthRequest).user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ValidationError('Chat not found');
    }

    // Verify user is a participant
    if (!chat.participants.includes(userId)) {
      throw new ValidationError('Not authorized to send messages in this chat');
    }

    // Encrypt the message
    const encryptedContent = encrypt(message, chat.encryptionKey);

    // Add message to chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          messages: {
            sender: userId,
            content: encryptedContent,
            readBy: [userId]
          }
        },
        $set: {
          lastMessage: {
            sender: userId,
            timestamp: new Date(),
            preview: message.substring(0, 50)
          }
        }
      },
      { new: true }
    );

    // Notify other participants
    chat.participants.forEach((participantId) => {
      if (!participantId.equals(userId)) {
        io.to(participantId.toString()).emit('newMessage', {
          chatId,
          senderId: userId,
          message: encryptedContent
        });
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: {
          sender: userId,
          content: encryptedContent,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ValidationError('Chat not found');
    }

    // Verify user is a participant
    if (!chat.participants.includes(userId)) {
      throw new ValidationError('Not authorized to view these messages');
    }

    // Decrypt messages
    const decryptedMessages = chat.messages.map(msg => ({
      ...msg.toObject(),
      content: decrypt(msg.content as EncryptedMessage, chat.encryptionKey)
    }));

    res.status(200).json({
      status: 'success',
      data: {
        messages: decryptedMessages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      {
        $addToSet: {
          'messages.$[].readBy': userId
        }
      },
      { new: true }
    );

    if (!chat) {
      throw new ValidationError('Chat not found');
    }

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getUserChats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .sort({ 'lastMessage.timestamp': -1 })
      .populate('participants', 'name email');

    res.status(200).json({
      status: 'success',
      data: { chats }
    });
  } catch (error) {
    next(error);
  }
};
