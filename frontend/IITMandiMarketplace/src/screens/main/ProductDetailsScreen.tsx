import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Button } from '../../components/Button/Button';
import { HomeScreenProps } from '../../navigation/types';
import { Card } from '../../components/Card/Card';
import { Product } from '../../components/ProductCard/ProductCard';
import { useAuth } from '../../contexts/AuthContext';

type Props = HomeScreenProps<'ProductDetails'>;

export const ProductDetailsScreen: React.FC<Props> = ({ 
  route,
  navigation 
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { productId } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with API call
  const product: Product = {
    id: productId,
    title: 'Engineering Textbook',
    price: 500,
    image: 'https://example.com/book.jpg',
    description: 'Used engineering textbook in good condition. Perfect for first-year students. Includes practice problems and solutions.',
    seller: {
      id: 'user1',
      name: 'John Doe',
    },
  };

  const handleContactSeller = () => {
    // Navigate to Chat screen directly within the same stack
    navigation.navigate('Chat', { recipientId: product.seller.id });
  };

  const handleBuyNow = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement purchase logic with API call
      Alert.alert('Success', 'Transaction initiated. Please check your notifications.');
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    image: {
      width: '100%',
      height: 300,
      borderRadius: 8,
      marginBottom: 16,
    },
    infoCard: {
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    price: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 16,
      lineHeight: 24,
    },
    sellerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    sellerName: {
      fontSize: 16,
      color: theme.colors.text,
    },
    buttonsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
  });

  const isOwnProduct = user?._id === product.seller.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <Card style={styles.infoCard}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>₹{product.price}</Text>
        <Text style={styles.description}>{product.description}</Text>
        
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>
            Seller: {product.seller.name}
          </Text>
        </View>

        {!isOwnProduct && (
          <View style={styles.buttonsContainer}>
            <Button
              title="Contact Seller"
              onPress={handleContactSeller}
              style={{ flex: 1 }}
            />
            <Button
              title="Buy Now"
              onPress={handleBuyNow}
              loading={isLoading}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};
