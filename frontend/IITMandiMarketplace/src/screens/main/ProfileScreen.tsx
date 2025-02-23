import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from '../../navigation/types';
import { Button } from '../../components';
import { useTheme } from '../../theme';
import { useAuth } from '../../contexts';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<MainStackParamList>
>;

interface MenuOption {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const menuOptions: MenuOption[] = [
    {
      icon: 'cube-outline',
      label: 'My Products',
      onPress: () => {
        // TODO: Navigate to my products screen
      },
    },
    {
      icon: 'heart-outline',
      label: 'Saved Items',
      onPress: () => {
        // TODO: Navigate to saved items screen
      },
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const renderMenuItem = ({ icon, label, onPress }: MenuOption) => (
    <Pressable
      key={label}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { opacity: 0.7 },
        { borderBottomColor: theme.colors.border.main },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <Ionicons
            name={icon}
            size={24}
            color={theme.colors.text.primary}
            style={styles.menuItemIcon}
          />
          <Text style={[theme.typography.variants.body1, { color: theme.colors.text.primary }]}>
            {label}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.colors.text.secondary}
        />
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.default }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.background.paper }]}>
        <Image
          source={user?.avatar ? { uri: user.avatar } : require('../../../assets/default-avatar.png')}
          style={styles.avatar}
        />
        <Text style={[theme.typography.variants.h4, styles.name]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[theme.typography.variants.body2, { color: theme.colors.text.secondary }]}>
          {user?.email}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.background.paper }]}>
        {menuOptions.map(renderMenuItem)}
      </View>

      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outlined"
        style={styles.signOutButton}
        fullWidth
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  menuItem: {
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  signOutButton: {
    marginHorizontal: 20,
  },
});
