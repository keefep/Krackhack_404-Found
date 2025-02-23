import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreenProps } from '../../navigation/types';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Input } from '../../components/Input/Input';
import productService, { ProductFilters } from '../../services/product';

type Props = HomeScreenProps<'HomeScreen'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});

  const loadProducts = useCallback(async (pageNum = 1, refresh = false) => {
    if (!refresh && !hasMore) return;

    try {
      const response = await productService.getProducts({
        page: pageNum,
        limit: 20,
        filters,
      });

      if (response.status === 'success') {
        const { products: newProducts, hasMore: more } = response.data;
        setProducts(prev => (pageNum === 1 ? newProducts : [...prev, ...newProducts]));
        setHasMore(more);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, hasMore]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadProducts(1, true);
  }, [loadProducts]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadProducts(page + 1);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleCreateProduct = () => {
    navigation.navigate('CreateProduct');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchContainer: {
      flex: 1,
    },
    iconButton: {
      padding: 8,
    },
    content: {
      flex: 1,
    },
    productList: {
      padding: 16,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: theme.colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading && page === 1) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            leftIcon="magnify"
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color={Object.keys(filters).length > 0 ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={() =>
          isLoading && hasMore ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ padding: 16 }}
            />
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateProduct}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};
