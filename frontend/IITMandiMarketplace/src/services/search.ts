import { ProductPreview } from '../types/product';

interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
}

interface SearchResponse {
  results: ProductPreview[];
  total: number;
  page: number;
  pageSize: number;
}

export const searchProducts = async (
  query: string,
  filters?: SearchFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResponse> => {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock response
    const mockResults: ProductPreview[] = Array(10)
      .fill(null)
      .map((_, index) => ({
        id: `${page}-${index}`,
        title: `Product matching "${query}" ${index + 1}`,
        price: Math.floor(Math.random() * 1000) + 100,
        condition: 'like-new',
        images: ['https://via.placeholder.com/300'],
        location: 'North Campus',
      }));

    return {
      results: mockResults,
      total: 100,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
};

export const getSuggestedSearches = async (
  query: string
): Promise<string[]> => {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock suggestions
    return [
      `${query} in electronics`,
      `${query} near me`,
      `${query} under 1000`,
      `${query} used`,
    ];
  } catch (error) {
    console.error('Search suggestions API error:', error);
    throw error;
  }
};

export const getRecentSearches = async (): Promise<string[]> => {
  try {
    // TODO: Implement local storage for recent searches
    return [
      'laptop',
      'textbooks',
      'bicycle',
      'calculator',
    ];
  } catch (error) {
    console.error('Recent searches error:', error);
    throw error;
  }
};
