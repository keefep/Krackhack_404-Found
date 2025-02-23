import api, { APIResponse } from './api';
import { CONFIG } from '../config';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TRANSACTION' | 'CHAT' | 'PRODUCT' | 'SYSTEM';
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  types: {
    transactions: boolean;
    chat: boolean;
    products: boolean;
    system: boolean;
  };
}

interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

class NotificationService {
  private pollingInterval: NodeJS.Timeout | null = null;

  async getNotifications(page = 1, limit: number = CONFIG.DEFAULT_PAGE_SIZE): Promise<APIResponse<NotificationListResponse>> {
    return api.get(`/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadCount(): Promise<APIResponse<number>> {
    return api.get('/notifications/unread/count');
  }

  async markAsRead(notificationId: string): Promise<APIResponse<void>> {
    return api.post(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<APIResponse<void>> {
    return api.post('/notifications/read-all');
  }

  async getPreferences(): Promise<APIResponse<NotificationPreferences>> {
    return api.get('/notifications/preferences');
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<APIResponse<NotificationPreferences>> {
    return api.patch('/notifications/preferences', preferences);
  }

  startPolling(callback: (notification: Notification) => void): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      try {
        const response = await this.getNotifications(1, 1);
        if (response.status === 'success' && response.data.notifications.length > 0) {
          const latestNotification = response.data.notifications[0];
          const notificationDate = new Date(latestNotification.createdAt);
          if (notificationDate.getTime() > Date.now() - CONFIG.NOTIFICATION_POLL_INTERVAL) {
            callback(latestNotification);
          }
        }
      } catch (error) {
        console.error('Failed to poll notifications:', error);
      }
    }, CONFIG.NOTIFICATION_POLL_INTERVAL);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Helper method to parse notification dates
  private parseNotificationDate(date: string | Date): Date {
    return date instanceof Date ? date : new Date(date);
  }
}

export default new NotificationService();
