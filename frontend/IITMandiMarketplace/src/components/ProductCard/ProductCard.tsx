import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Card } from '../Card/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 8,
    },
    imageContainer: {
      aspectRatio: 1,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    content: {
      padding: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    price: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    condition: {
      fontSize: 12,
      color: theme.colors.text + '99',
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: 12,
      color: theme.colors.text + '99',
      marginLeft: 4,
    },
    status: {
      position: 'absolute',
      top: 8,
      right: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    statusText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <Card>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[0] }}
            style={styles.image}
          />
          {product.status !== 'AVAILABLE' && (
            <View style={styles.status}>
              <Text style={styles.statusText}>{product.status}</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.price}>₹{product.price}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.condition}>{product.condition}</Text>
            {product.rating && (
              <View style={styles.rating}>
                <MaterialCommunityIcons
                  name="star"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
