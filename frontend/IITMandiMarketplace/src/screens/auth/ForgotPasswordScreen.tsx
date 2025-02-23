import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input, LoadingScreen } from '../../components';
import { useTheme } from '../../theme';
import { useAuth } from '../../contexts';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setIsEmailSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingScreen message="Sending reset instructions..." />;
  }

  if (isEmailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
        <View style={styles.content}>
          <Text style={[styles.successMessage, { color: theme.colors.success.main }]}>
            Password reset email sent!
          </Text>
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Please check your email for instructions to reset your password.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            variant="outlined"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <View style={styles.content}>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          error={error}
          autoCapitalize="none"
          keyboardType="email-address"
          required
        />
        <Button
          title="Reset Password"
          onPress={handleSubmit}
          style={styles.button}
          size="large"
          fullWidth
        />
        <Button
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
          variant="text"
          style={styles.textButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  description: {
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  successMessage: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  textButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});
