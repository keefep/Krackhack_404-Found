import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input, LoadingScreen } from '../../components';
import { useTheme } from '../../theme';
import { useAuth } from '../../contexts';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        await signUp(formData.email, formData.password, formData.name);
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({
          email: 'An account with this email already exists',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isSubmitting) {
    return <LoadingScreen message="Creating your account..." />;
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background.default }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Input
          label="Full Name"
          value={formData.name}
          onChangeText={handleChange('name')}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          value={formData.email}
          onChangeText={handleChange('email')}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          required
        />
        <Input
          label="Password"
          value={formData.password}
          onChangeText={handleChange('password')}
          error={errors.password}
          secureTextEntry
          required
        />
        <Input
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          secureTextEntry
          required
        />
        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={handleChange('phone')}
          error={errors.phone}
          keyboardType="phone-pad"
          required
        />
        <Button
          title="Create Account"
          onPress={handleRegister}
          style={styles.button}
          size="large"
          fullWidth
        />
        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate('Login')}
          variant="text"
          style={styles.textButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
    marginTop: 24,
  },
  textButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});
