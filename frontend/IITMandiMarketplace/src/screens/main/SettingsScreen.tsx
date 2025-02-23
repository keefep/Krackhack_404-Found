import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

interface Setting {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export const SettingsScreen: React.FC<Props> = () => {
  const theme = useTheme();

  const [notifications, setNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  const settingsGroups: { title: string; settings: Setting[] }[] = [
    {
      title: 'Notifications',
      settings: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: 'mail-outline',
          label: 'Email Notifications',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
      ],
    },
    {
      title: 'Privacy',
      settings: [
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          onPress: () => {
            // TODO: Implement change password
          },
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          onPress: () => {
            // TODO: Show privacy policy
          },
        },
      ],
    },
    {
      title: 'About',
      settings: [
        {
          icon: 'information-circle-outline',
          label: 'App Version',
          onPress: () => {
            // TODO: Show app version info
          },
        },
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          onPress: () => {
            // TODO: Navigate to help section
          },
        },
      ],
    },
  ];

  const renderSetting = (setting: Setting) => (
    <Pressable
      key={setting.label}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && setting.onPress && { opacity: 0.7 },
        { borderBottomColor: theme.colors.border.main },
      ]}
      onPress={setting.onPress}
      disabled={!setting.onPress}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingLeft}>
          <Ionicons
            name={setting.icon}
            size={24}
            color={theme.colors.text.primary}
            style={styles.settingIcon}
          />
          <Text style={[theme.typography.variants.body1, { color: theme.colors.text.primary }]}>
            {setting.label}
          </Text>
        </View>
        {setting.onToggle !== undefined ? (
          <Switch
            value={setting.value}
            onValueChange={setting.onToggle}
            trackColor={{
              false: theme.colors.text.disabled,
              true: theme.colors.primary.main,
            }}
          />
        ) : setting.onPress && (
          <Ionicons
            name="chevron-forward"
            size={24}
            color={theme.colors.text.secondary}
          />
        )}
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.default }]}
    >
      {settingsGroups.map((group, index) => (
        <View 
          key={group.title}
          style={[
            styles.section,
            { backgroundColor: theme.colors.background.paper },
            index > 0 && styles.sectionMargin
          ]}
        >
          <Text
            style={[
              theme.typography.variants.overline,
              styles.sectionTitle,
              { color: theme.colors.text.secondary }
            ]}
          >
            {group.title}
          </Text>
          {group.settings.map(renderSetting)}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingTop: 12,
  },
  sectionMargin: {
    marginTop: 24,
  },
  sectionTitle: {
    marginLeft: 20,
    marginBottom: 8,
  },
  settingItem: {
    borderBottomWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
});
