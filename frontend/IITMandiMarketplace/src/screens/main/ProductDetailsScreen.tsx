import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { Button, LoadingScreen } from '../../components';
import { ProductDetails } from '../../types/product';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = NativeStackScreenProps<MainStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const [product, setProduct] = React.useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setProduct({
          id: route.params.productId,
          title: route.params.title,
          price: 999,
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          category: 'Electronics',
          condition: 'like-new',
          images: ['https://via.placeholder.com/600'],
          location: 'North Campus',
          seller: {
            id: '1',
            name: 'John Doe',
            rating: 4.5,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'available',
        });
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [route.params.productId]);

  const handleContact = () => {
    if (product) {
      navigation.navigate('Chat', {
        recipientId: product.seller.id,
        recipientName: product.seller.name,
      });
    }
  };

  if (isLoading || !product) {
    return <LoadingScreen message="Loading product details..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <ScrollView>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={[theme.typography.variants.h4, styles.title]}>
            {product.title}
          </Text>
          <Text style={[theme.typography.variants.h3, styles.price]}>
            ₹{product.price.toLocaleString()}
          </Text>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={[theme.typography.variants.caption, styles.infoLabel]}>
                Condition
              </Text>
              <Text style={theme.typography.variants.subtitle1}>
                {product.condition}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[theme.typography.variants.caption, styles.infoLabel]}>
                Category
              </Text>
              <Text style={theme.typography.variants.subtitle1}>
                {product.category}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[theme.typography.variants.caption, styles.infoLabel]}>
                Status
              </Text>
              <Text style={theme.typography.variants.subtitle1}>
                {product.status}
              </Text>
            </View>
          </View>

          <Text style={[theme.typography.variants.subtitle1, styles.sectionTitle]}>
            Description
          </Text>
          <Text style={[theme.typography.variants.body1, styles.description]}>
            {product.description}
          </Text>

          <Pressable
            style={styles.sellerContainer}
            onPress={() => {/* TODO: Navigate to seller profile */}}
          >
            <View style={styles.sellerInfo}>
              <Text style={theme.typography.variants.subtitle1}>
                {product.seller.name}
              </Text>
              <Text style={[theme.typography.variants.caption, { color: theme.colors.text.secondary }]}>
                Rating: {product.seller.rating.toFixed(1)} ★
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.text.secondary}
            />
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border.main }]}>
        <Button
          title="Contact Seller"
          onPress={handleContact}
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  price: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoItem: {
    marginRight: 32,
  },
  infoLabel: {
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 24,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
