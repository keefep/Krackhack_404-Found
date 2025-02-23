import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '../../types/product';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import searchService, { SearchFilters } from '../../services/search';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen';
import { MainTabScreenProps } from '../../navigation/types';
import { Input } from '../../components/Input/Input';

type Props = MainTabScreenProps<'Search'>;

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'] as const;
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
] as const;

export const SearchResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadCategories = useCallback(async () => {
    try {
      const response = await searchService.getCategories();
      if (response.status === 'success') {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const searchProducts = useCallback(async (pageNum = 1, refresh = false) => {
    if (!searchQuery.trim() && !filters.category) {
      setProducts([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchService.search(searchQuery, filters, pageNum);
      if (response.status === 'success') {
        const { products: newProducts, hasMore: more } = response.data;
        setProducts(prev => refresh ? newProducts : [...prev, ...newProducts]);
        setHasMore(more);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (searchQuery || filters.category) {
      searchProducts(1, true);
    }
  }, [searchQuery, filters]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await searchProducts(1, true);
    setIsRefreshing(false);
    setPage(1);
  }, [searchProducts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isRefreshing) return;
    setPage(prev => {
      searchProducts(prev + 1);
      return prev + 1;
    });
  }, [hasMore, isLoading, isRefreshing, searchProducts]);

  const handleSearch = useCallback(() => {
    setPage(1);
    searchProducts(1, true);
  }, [searchProducts]);

  const toggleSortOrder = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleProductPress = useCallback((product: Product) => {
    navigation.getParent()?.navigate('Home', {
      screen: 'ProductDetails',
      params: { productId: product.id }
    });
  }, [navigation]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchInput: {
      flex: 1,
    },
    filterBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: 16,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    filterSection: {
      marginBottom: 16,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
    },
    chipText: {
      color: theme.colors.primary,
    },
    chipTextSelected: {
      color: theme.colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.text + '80',
      textAlign: 'center',
      marginTop: 8,
    },
    loadingMore: {
      padding: 16,
    },
  });

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <Card style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filters</Text>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Category</Text>
            <View style={styles.optionsContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    filters.category === category && styles.chipSelected,
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    category: prev.category === category ? undefined : category,
                  }))}
                >
                  <Text style={[
                    styles.chipText,
                    filters.category === category && styles.chipTextSelected,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.optionsContainer}>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    filters.sortBy === option.value && styles.chipSelected,
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    sortBy: option.value as typeof prev.sortBy,
                  }))}
                >
                  <Text style={[
                    styles.chipText,
                    filters.sortBy === option.value && styles.chipTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Apply Filters"
            onPress={() => setShowFilters(false)}
          />
        </Card>
      </View>
    </Modal>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="text-search"
        size={48}
        color={theme.colors.text + '80'}
      />
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No products found'
          : 'Enter a search term to find products'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || !hasMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Input
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Button
            title="Search"
            onPress={handleSearch}
          />
        </View>
      </View>

      <View style={styles.filterBar}>
        <Button
          title="Filters"
          onPress={() => setShowFilters(true)}
          variant="outlined"
          icon="filter-variant"
        />
        <Button
          title={filters.sortOrder === 'asc' ? 'Sort ↑' : 'Sort ↓'}
          onPress={toggleSortOrder}
          variant="outlined"
          icon="sort"
        />
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        numColumns={2}
        columnWrapperStyle={{ gap: 8, padding: 8 }}
      />

      {renderFiltersModal()}
    </View>
  );
};
