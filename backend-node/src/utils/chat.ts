import { Types } from 'mongoose';
import { Chat, IChat, IMessageData } from '../models/Chat';
import { ValidationError } from './errors';
import { chatEvents } from './socket';

export interface CreateChatParams {
  participants: Types.ObjectId[];
  product?: Types.ObjectId;
  initialMessage?: string;
  sender: Types.ObjectId;
}

export interface SendMessageParams {
  chatId: Types.ObjectId;
  content: string;
  sender: Types.ObjectId;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * Create a new chat between users
 */
export const createChat = async ({
  participants,
  product,
  initialMessage,
  sender
}: CreateChatParams): Promise<IChat> => {
  // Validate participants
  if (participants.length < 2) {
    throw new ValidationError('Chat must have at least 2 participants');
  }

  // Check if chat already exists between these users for this product
  const existingChat = await Chat.findOne({
    participants: { $all: participants },
    ...(product && { product }),
  });

  if (existingChat) {
    return existingChat;
  }

  // Create new chat
  const chat = new Chat({
    participants,
    product,
    active: true,
  });

  // Add initial message if provided
  if (initialMessage) {
    const message: IMessageData = {
      sender,
      content: initialMessage,
      type: 'text',
      readBy: [sender],
      deleted: false,
    };
    await chat.addMessage(message);
  }

  await chat.save();

  // Notify all participants about the new chat
  await chatEvents.newChat(chat);

  return chat;
};

/**
 * Send a new message in a chat
 */
export const sendMessage = async ({
  chatId,
  content,
  sender,
  type = 'text',
  fileUrl,
  fileName,
  fileSize,
}: SendMessageParams): Promise<IChat> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ValidationError('Chat not found');
  }

  if (!chat.participants.some(p => p.toString() === sender.toString())) {
    throw new ValidationError('Sender is not a participant in this chat');
  }

  const message: IMessageData = {
    sender,
    content,
    type,
    fileUrl,
    fileName,
    fileSize,
    readBy: [sender],
    deleted: false,
  };

  await chat.addMessage(message);

  // Notify chat participants about the new message
  const savedChat = await chat.save();
  const newMessage = savedChat.messages[savedChat.messages.length - 1];
  await chatEvents.newMessage(chatId.toString(), newMessage);

  return savedChat;
};

/**
 * Mark all messages in a chat as read for a user
 */
export const markChatAsRead = async (
  chatId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<IChat> => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ValidationError('Chat not found');
  }

  if (!chat.participants.some(p => p.toString() === userId.toString())) {
    throw new ValidationError('User is not a participant in this chat');
  }

  const unreadMessages = chat.messages.filter(m => !m.readBy.includes(userId));
  const messageIds = unreadMessages.map(m => m._id as Types.ObjectId);

  const updatedChat = await chat.markAsRead(userId);

  // Notify chat participants about messages being read
  if (messageIds.length > 0) {
    await chatEvents.messageRead(chatId.toString(), userId, messageIds);
  }

  return updatedChat;
};

/**
 * Get all chats for a user with pagination
 */
export const getUserChats = async (
  userId: Types.ObjectId,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [chats, total] = await Promise.all([
    Chat.find({ participants: userId, active: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'name avatar')
      .populate('product', 'title images')
      .populate('lastMessage.sender', 'name avatar'),
    Chat.countDocuments({ participants: userId, active: true }),
  ]);

  return {
    chats,
    total,
    page,
    limit,
    hasMore: skip + chats.length < total,
  };
};

/**
 * Get chat messages with pagination
 */
export const getChatMessages = async (
  chatId: Types.ObjectId,
  page: number = 1,
  limit: number = 50
) => {
  const chat = await Chat.findById(chatId)
    .populate('messages.sender', 'name avatar')
    .populate('messages.readBy', 'name avatar');

  if (!chat) {
    throw new ValidationError('Chat not found');
  }

  const skip = (page - 1) * limit;
  const messages = chat.messages.slice(skip, skip + limit);
  const total = chat.messages.length;

  return {
    messages,
    total,
    page,
    limit,
    hasMore: skip + messages.length < total,
  };
};
