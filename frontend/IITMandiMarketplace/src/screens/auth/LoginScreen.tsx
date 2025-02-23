import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input, LoadingScreen } from '../../components';
import { useTheme } from '../../theme';
import { useAuth } from '../../contexts';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await signIn(email, password);
    } catch (error) {
      setError('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  if (isSubmitting) {
    return <LoadingScreen message="Signing in..." />;
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.background.default }
    ]}>
      <View style={styles.form}>
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
        <Input
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          error={error}
          secureTextEntry
          required
        />
        <Button
          title="Log In"
          onPress={handleLogin}
          style={styles.button}
          size="large"
          fullWidth
          loading={isSubmitting}
        />
        <Button
          title="Forgot Password?"
          onPress={handleForgotPassword}
          variant="text"
          style={styles.textButton}
        />
        <Button
          title="Create Account"
          onPress={handleRegister}
          variant="outlined"
          style={styles.button}
          fullWidth
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
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
    marginTop: 16,
  },
  textButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
});
