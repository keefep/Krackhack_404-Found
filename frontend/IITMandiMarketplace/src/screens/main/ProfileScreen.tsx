import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { ProfileScreenProps } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = ProfileScreenProps<'ProfileScreen'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const handleVerifyId = () => {
    // TODO: Implement ID verification flow
    Alert.alert('Coming Soon', 'ID verification will be available soon.');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    profileCard: {
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 36,
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 16,
      color: theme.colors.text + '99',
      marginBottom: 8,
    },
    infoCard: {
      padding: 16,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.colors.text + '99',
    },
    infoValue: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    verificationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    verificationText: {
      color: theme.colors.primary,
      marginLeft: 4,
      fontWeight: '500',
    },
    buttonContainer: {
      gap: 12,
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(user?.name || 'User')}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.verificationBadge}>
          <MaterialCommunityIcons
            name={user?.idCardVerified ? 'check-circle' : 'clock-outline'}
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.verificationText}>
            {user?.idCardVerified ? 'Verified' : 'Verification Pending'}
          </Text>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>College ID</Text>
          <Text style={styles.infoValue}>{user?.collegeId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Credibility Score</Text>
          <Text style={styles.infoValue}>{user?.credibilityScore || 0}</Text>
        </View>
        {user?.phoneNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phoneNumber}</Text>
          </View>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        {!user?.idCardVerified && (
          <Button
            title="Verify College ID"
            onPress={handleVerifyId}
            variant="secondary"
          />
        )}
        <Button
          title="Settings"
          onPress={navigateToSettings}
          variant="secondary"
        />
        <Button
          title="Logout"
          onPress={handleLogout}
          loading={isLoading}
          disabled={isLoading}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
};
