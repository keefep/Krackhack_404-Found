import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { HomeScreenProps } from '../../navigation/types';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { CONFIG } from '../../config';
import { io } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

type Props = HomeScreenProps<'Chat'>;

// Initialize socket with auto-connect disabled
const socket = io(CONFIG.API_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { recipientId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Load chat history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // TODO: Implement chat history loading from API
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [recipientId]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!user?._id) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.auth = { token: user.token };
      socket.connect();
    }

    // Join chat room
    socket.emit('joinChat', { userId: user._id, recipientId });

    // Listen for new messages
    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Mark message as read if we're the recipient
      if (message.recipientId === user._id) {
        socket.emit('markAsRead', { messageId: message.id });
      }
    });

    // Listen for typing status
    socket.on('typing', ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      if (userId === recipientId) {
        setIsTyping(typing);
      }
    });

    // Handle reconnection attempts
    socket.on('connect_error', () => {
      if (reconnectAttempts < CONFIG.CHAT_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          socket.connect();
          setReconnectAttempts(prev => prev + 1);
        }, CONFIG.CHAT_RECONNECT_DELAY);
      }
    });

    return () => {
      socket.emit('leaveChat', { userId: user._id, recipientId });
      socket.off('newMessage');
      socket.off('typing');
      socket.off('connect_error');
    };
  }, [user?._id, recipientId, reconnectAttempts]);

  const handleSend = useCallback(() => {
    if (!messageText.trim() || !user?._id) return;

    const message = {
      senderId: user._id,
      recipientId,
      text: messageText.trim(),
      timestamp: new Date(),
    };

    socket.emit('sendMessage', message);
    setMessageText('');
  }, [messageText, user?._id, recipientId]);

  const handleTyping = useCallback((text: string) => {
    setMessageText(text);
    if (!user?._id) return;

    socket.emit('typing', {
      userId: user._id,
      recipientId,
      isTyping: text.length > 0,
    });
  }, [user?._id, recipientId]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    messageList: {
      flex: 1,
      padding: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    input: {
      flex: 1,
    },
    messageContainer: {
      maxWidth: '80%',
      marginBottom: 8,
    },
    message: {
      padding: 12,
      borderRadius: 16,
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.primary + '20',
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.card,
    },
    messageText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.text + '80',
      marginTop: 4,
    },
    typingIndicator: {
      padding: 8,
      fontSize: 12,
      color: theme.colors.text + '80',
      textAlign: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <FlatList
        data={messages}
        contentContainerStyle={styles.messageList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === user?._id ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            <Card style={styles.message}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </Text>
            </Card>
          </View>
        )}
      />

      {isTyping && (
        <Text style={styles.typingIndicator}>Typing...</Text>
      )}

      <View style={styles.inputContainer}>
        <Input
          value={messageText}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          style={styles.input}
          multiline
        />
        <Button
          title="Send"
          onPress={handleSend}
          disabled={!messageText.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
