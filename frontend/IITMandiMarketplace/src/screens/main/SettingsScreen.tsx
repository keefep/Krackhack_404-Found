import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { ProfileScreenProps } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = ProfileScreenProps<'Settings'>;

interface SettingOption {
  key: string;
  title: string;
  description: string;
  type: 'toggle' | 'button';
  icon: string;
  action?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    // TODO: Update user preferences in backend
  };

  const handleEmailNotificationToggle = (value: boolean) => {
    setEmailNotifications(value);
    // TODO: Update user preferences in backend
  };

  const handleChangePassword = () => {
    // TODO: Implement change password flow
    Alert.alert('Coming Soon', 'Password change functionality will be available soon.');
  };

  const handlePrivacySettings = () => {
    // TODO: Implement privacy settings
    Alert.alert('Coming Soon', 'Privacy settings will be available soon.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // TODO: Implement account deletion
              Alert.alert('Success', 'Your account has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const settings: SettingOption[] = [
    {
      key: 'notifications',
      title: 'Push Notifications',
      description: 'Receive notifications about your transactions and messages',
      type: 'toggle',
      icon: 'bell-outline',
      value: notificationsEnabled,
      onValueChange: handleNotificationToggle,
    },
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive important updates via email',
      type: 'toggle',
      icon: 'email-outline',
      value: emailNotifications,
      onValueChange: handleEmailNotificationToggle,
    },
    {
      key: 'password',
      title: 'Change Password',
      description: 'Update your account password',
      type: 'button',
      icon: 'lock-outline',
      action: handleChangePassword,
    },
    {
      key: 'privacy',
      title: 'Privacy Settings',
      description: 'Manage your privacy preferences',
      type: 'button',
      icon: 'shield-outline',
      action: handlePrivacySettings,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    settingCard: {
      marginBottom: 12,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.text + '99',
    },
    dangerZone: {
      marginTop: 32,
      marginBottom: 16,
    },
    dangerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.error,
      marginBottom: 8,
    },
  });

  const renderSetting = (setting: SettingOption) => (
    <Card key={setting.key} style={styles.settingCard}>
      <View style={styles.settingItem}>
        <MaterialCommunityIcons
          name={setting.icon as any}
          size={24}
          color={theme.colors.text}
          style={styles.settingIcon}
        />
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{setting.title}</Text>
          <Text style={styles.settingDescription}>{setting.description}</Text>
        </View>
        {setting.type === 'toggle' ? (
          <Switch
            value={setting.value}
            onValueChange={setting.onValueChange}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={setting.value ? theme.colors.primary : '#f4f3f4'}
          />
        ) : (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.text + '99'}
            onPress={setting.action}
          />
        )}
      </View>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      {settings.map(renderSetting)}

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          loading={isLoading}
          disabled={isLoading}
          variant="primary"
          style={{ backgroundColor: theme.colors.error }}
        />
      </View>
    </ScrollView>
  );
};
