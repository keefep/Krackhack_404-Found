import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NotificationsScreenProps } from '../../navigation/types';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Notification } from '../../services/notification';
import { formatRelativeTime } from '../../utils/date';

type Props = NotificationsScreenProps<'NotificationsScreen'>;

const NotificationIcon = {
  TRANSACTION: 'currency-usd',
  CHAT: 'chat',
  PRODUCT: 'package-variant',
  SYSTEM: 'information',
} as const;

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const {
    notifications,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    error,
    clearError,
  } = useNotifications();

  const handleRefresh = useCallback(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  const handleLoadMore = useCallback(() => {
    // TODO: Implement pagination
  }, []);

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    const parentNav = navigation.getParent();
    if (!parentNav) return;

    switch (notification.type) {
      case 'TRANSACTION':
        parentNav.navigate('Profile', {
          screen: 'MyTransactions',
        });
        break;
      case 'CHAT':
        if (notification.data?.recipientId) {
          parentNav.navigate('Home', {
            screen: 'Chat',
            params: { recipientId: notification.data.recipientId }
          });
        }
        break;
      case 'PRODUCT':
        if (notification.data?.productId) {
          parentNav.navigate('Home', {
            screen: 'ProductDetails',
            params: { productId: notification.data.productId }
          });
        }
        break;
    }
  }, [markAsRead, navigation]);

  const handleMarkAllAsRead = useCallback(() => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: markAllAsRead,
        },
      ]
    );
  }, [markAllAsRead]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    notificationContainer: {
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      marginRight: 12,
    },
    notificationTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    notificationMessage: {
      fontSize: 14,
      color: theme.colors.text + '99',
      marginBottom: 8,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.text + '80',
    },
    unreadIndicator: {
      backgroundColor: theme.colors.primary + '20',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.text + '80',
      textAlign: 'center',
      marginTop: 8,
    },
  });

  const getNotificationStyles = useCallback((isUnread: boolean): StyleProp<ViewStyle> => {
    const baseStyle = styles.notificationContainer;
    if (isUnread) {
      return [baseStyle, styles.unreadIndicator];
    }
    return baseStyle;
  }, []);

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <Card style={getNotificationStyles(!item.read)}>
        <View style={styles.notificationHeader}>
          <MaterialCommunityIcons
            name={NotificationIcon[item.type]}
            size={24}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.notificationTitle}>{item.title}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="bell-outline"
        size={48}
        color={theme.colors.text + '80'}
      />
      <Text style={styles.emptyText}>
        No notifications yet
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={theme.colors.error}
        />
        <Text style={[styles.emptyText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <Button title="Retry" onPress={clearError} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Button
          title="Mark All as Read"
          onPress={handleMarkAllAsRead}
          disabled={notifications.every(n => n.read)}
        />
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};
