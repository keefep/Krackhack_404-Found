import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { AuthScreenProps } from '../../navigation/types';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { useAuth } from '../../contexts/AuthContext';
import { z } from 'zod';
import { useFormValidation, commonSchemas } from '../../hooks/useFormValidation';

const loginSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
});

type LoginForm = z.infer<typeof loginSchema>;

type Props = AuthScreenProps<'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { errors, validateField, validateForm } = useFormValidation<LoginForm>(loginSchema);
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const handleChange = useCallback((field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm(formData)) {
      Alert.alert('Validation Error', 'Please check your input and try again.');
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }, [formData, login, validateForm]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    card: {
      padding: 16,
    },
    forgotPassword: {
      marginTop: 16,
      alignItems: 'center',
    },
    register: {
      marginTop: 24,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />

        <Input
          label="Password"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          error={errors.password}
        />

        <Button
          title="Login"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        />

        <Button
          title="Forgot Password?"
          onPress={() => navigation.navigate('ForgotPassword')}
          variant="text"
          style={styles.forgotPassword}
        />

        <Button
          title="Don't have an account? Register"
          onPress={() => navigation.navigate('Register')}
          variant="text"
          style={styles.register}
        />
      </Card>
    </View>
  );
};
