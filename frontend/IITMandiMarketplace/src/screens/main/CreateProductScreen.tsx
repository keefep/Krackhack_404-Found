import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@react-navigation/native';
import { z } from 'zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { HomeScreenProps } from '../../navigation/types';
import { useFormValidation } from '../../hooks/useFormValidation';
import productService, { CreateProductData } from '../../services/product';

type Props = HomeScreenProps<'CreateProduct'>;

const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

type FormData = z.infer<typeof createProductSchema>;

export const CreateProductScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { errors, validateField, validateForm } = useFormValidation(createProductSchema);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    condition: 'good',
    images: [],
  });

  const handleChange = useCallback((field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'price' ? Number(value) : value,
    }));
    validateField(field, value);
  }, [validateField]);

  const handleImagePick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri],
      }));
    }
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm(formData)) {
      Alert.alert('Validation Error', 'Please check your input and try again.');
      return;
    }

    setIsLoading(true);
    try {
      await productService.createProduct(formData);
      Alert.alert('Success', 'Product listed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigation, validateForm]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    imageCard: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    addImageButton: {
      width: 100,
      height: 100,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeImageButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 4,
    },
    categoryPicker: {
      marginBottom: 16,
    },
    conditionPicker: {
      marginBottom: 16,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Title"
        value={formData.title}
        onChangeText={(value) => handleChange('title', value)}
        error={errors.title}
        placeholder="Enter product title"
      />

      <Input
        label="Description"
        value={formData.description}
        onChangeText={(value) => handleChange('description', value)}
        error={errors.description}
        placeholder="Describe your product"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Input
        label="Price"
        value={formData.price.toString()}
        onChangeText={(value) => handleChange('price', value)}
        error={errors.price}
        placeholder="Enter price"
        keyboardType="numeric"
      />

      <View style={styles.imagesContainer}>
        {formData.images.map((uri, index) => (
          <Card key={index} style={styles.imageCard}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => handleRemoveImage(index)}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={24}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </Card>
        ))}
        {formData.images.length < 5 && (
          <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
            <MaterialCommunityIcons
              name="plus"
              size={32}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Button
        title="Create Listing"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      />
    </ScrollView>
  );
};
