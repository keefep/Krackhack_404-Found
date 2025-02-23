import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SearchBar } from '@rneui/themed';
import { ProductCard } from '../../components';
import { useTheme } from '../../theme/hooks';
import { ProductPreview } from '../../types/product';
import { searchProducts, getSuggestedSearches, getRecentSearches } from '../../services/search';
import debounce from 'lodash/debounce';

export const SearchResultsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ProductPreview[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const theme = useTheme();

  const loadRecentSearches = async () => {
    try {
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  React.useEffect(() => {
    loadRecentSearches();
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) return;
      try {
        const suggestions = await getSuggestedSearches(query);
        setSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    }, 300),
    []
  );

  const handleSearch = async (query: string, newSearch = false) => {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (newSearch) {
      setPage(1);
      setResults([]);
      setHasMore(true);
    }

    setLoading(true);
    setShowSuggestions(false);

    try {
      const response = await searchProducts(query, undefined, newSearch ? 1 : page);
      if (newSearch) {
        setResults(response.results);
      } else {
        setResults(prev => [...prev, ...response.results]);
      }
      setHasMore(response.results.length === response.pageSize);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      handleSearch(search);
    }
  };

  const handleInputChange = (text: string) => {
    setSearch(text);
    if (text.length >= 2) {
      setShowSuggestions(true);
      fetchSuggestions(text);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSearch(suggestion, true);
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={[theme.typography.variants.body1, { color: theme.colors.text.primary }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: ProductPreview }) => (
    <ProductCard
      title={item.title}
      price={item.price}
      image={{ uri: item.images[0] }}
      condition={item.condition}
      style={styles.productCard}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <SearchBar
        placeholder="Search products..."
        onChangeText={handleInputChange}
        onSubmitEditing={() => handleSearch(search, true)}
        value={search}
        platform="default"
        containerStyle={[
          styles.searchBarContainer,
          { backgroundColor: theme.colors.background.default },
        ]}
        inputContainerStyle={[
          styles.searchBarInput,
          { backgroundColor: theme.colors.background.paper },
        ]}
      />
      
      {showSuggestions && suggestions.length > 0 ? (
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item) => item}
          style={styles.suggestionsList}
        />
      ) : search.length < 2 && recentSearches.length > 0 ? (
        <View style={styles.recentContainer}>
          <Text style={[theme.typography.variants.subtitle1, styles.recentTitle]}>
            Recent Searches
          </Text>
          <FlatList
            data={recentSearches}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item}
          />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary.main}
                style={styles.loader}
              />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchBarInput: {
    borderRadius: 8,
  },
  listContainer: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
  },
  suggestionsList: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentContainer: {
    padding: 16,
  },
  recentTitle: {
    marginBottom: 8,
  },
  loader: {
    marginVertical: 16,
  },
});
