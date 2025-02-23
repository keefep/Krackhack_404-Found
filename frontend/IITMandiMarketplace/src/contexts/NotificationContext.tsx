import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import notificationService, { 
  Notification, 
  NotificationPreferences 
} from '../services/notification';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  loadNotifications: (page?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (page = 1) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(page);
      if (response.status === 'success') {
        setNotifications(prev => 
          page === 1 ? response.data.notifications : [...prev, ...response.data.notifications]
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const response = await notificationService.getUnreadCount();
      if (response.status === 'success') {
        setUnreadCount(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load unread count:', err);
    }
  }, [user]);

  const loadPreferences = useCallback(async () => {
    if (!user) return;
    try {
      const response = await notificationService.getPreferences();
      if (response.status === 'success') {
        setPreferences(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load preferences:', err);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.status === 'success') {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.status === 'success') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    try {
      const response = await notificationService.updatePreferences(prefs);
      if (response.status === 'success') {
        setPreferences(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize notifications
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
      loadPreferences();

      // Start polling for new notifications
      notificationService.startPolling((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        notificationService.stopPolling();
      };
    }
  }, [user, loadNotifications, loadUnreadCount, loadPreferences]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        isLoading,
        error,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        clearError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
