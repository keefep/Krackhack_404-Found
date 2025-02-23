import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { z } from 'zod';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useFormValidation, commonSchemas } from '../../hooks/useFormValidation';
import { APIError } from '../../services/api';
import { AuthScreenProps } from '../../navigation/types';

const registerSchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
  password: commonSchemas.password,
  collegeId: z
    .string()
    .regex(/^[A-Z0-9]{6,10}$/, 'Enter a valid college ID (e.g., B20001)'),
  phoneNumber: commonSchemas.phoneNumber,
}).strict();

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterScreen: React.FC<AuthScreenProps<'Register'>> = ({ navigation }) => {
  const theme = useTheme();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { errors, validateField, validateForm } = useFormValidation(registerSchema);
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    collegeId: '',
    phoneNumber: '',
  });

  const handleChange = useCallback((field: keyof RegisterForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'collegeId' ? value.toUpperCase() : value,
    }));
    validateField(field, value);
  }, [validateField]);

  const handleRegister = useCallback(async () => {
    if (!validateForm(formData)) {
      Alert.alert('Validation Error', 'Please check your input and try again.');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      // Navigation will be handled by AuthNavigator based on auth state
    } catch (error) {
      const message = error instanceof APIError
        ? error.message
        : 'An unexpected error occurred';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, register, validateForm]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 24,
      textAlign: 'center',
    },
    loginLink: {
      marginTop: 16,
      marginBottom: 32,
      alignItems: 'center',
    },
    infoText: {
      color: theme.colors.text,
      fontSize: 12,
      marginTop: 4,
      marginBottom: 16,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Full Name"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          error={errors.name}
          placeholder="Enter your full name"
          autoCapitalize="words"
          textContentType="name"
        />

        <Input
          label="Email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          error={errors.email}
          placeholder="Enter your IIT Mandi email"
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
        />

        <Input
          label="Password"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          error={errors.password}
          placeholder="Create a strong password"
          secureTextEntry
          textContentType="newPassword"
        />

        <Input
          label="College ID"
          value={formData.collegeId}
          onChangeText={(value) => handleChange('collegeId', value)}
          error={errors.collegeId}
          placeholder="Enter your college ID"
          autoCapitalize="characters"
        />

        <Input
          label="Phone Number (Optional)"
          value={formData.phoneNumber}
          onChangeText={(value) => handleChange('phoneNumber', value)}
          error={errors.phoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />

        <Button
          title="Register"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
        />

        <View style={styles.loginLink}>
          <Button
            title="Already have an account? Login"
            onPress={() => navigation.navigate('Login')}
            variant="text"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
