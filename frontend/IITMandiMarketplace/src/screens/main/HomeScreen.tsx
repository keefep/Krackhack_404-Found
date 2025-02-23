import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ListRenderItem,
  Image,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from '../../navigation/types';
import { ProductCard, LoadingScreen } from '../../components';
import { useTheme } from '../../theme';
import { ProductPreview, ProductCondition } from '../../types/product';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState<ProductPreview[]>([]);

  const fetchProducts = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    }

    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Temporary mock data
      const conditions: ProductCondition[] = ['new', 'like-new', 'good', 'fair'];
      const locations = ['North Campus', 'South Campus', 'Main Campus', 'Library'];
      const mockProducts: ProductPreview[] = Array(10).fill(null).map((_, index) => ({
        id: index.toString(),
        title: `Product ${index + 1}`,
        price: Math.floor(Math.random() * 1000) + 100,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        images: ['https://via.placeholder.com/300'],
        location: locations[Math.floor(Math.random() * locations.length)],
      }));

      setProducts(mockProducts);
    } catch (error) {
      // TODO: Handle error
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    fetchProducts(true);
  };

  const handleProductPress = (product: ProductPreview) => {
    navigation.navigate('ProductDetails', {
      productId: product.id,
      title: product.title,
    });
  };

  const renderProduct: ListRenderItem<ProductPreview> = ({ item }) => (
    <ProductCard
      title={item.title}
      price={item.price}
      image={{ uri: item.images[0] }}
      condition={item.condition}
      onPress={() => handleProductPress(item)}
      style={styles.productCard}
    />
  );

  if (isLoading) {
    return <LoadingScreen message="Loading products..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary.main]}
            tintColor={theme.colors.primary.main}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
});
