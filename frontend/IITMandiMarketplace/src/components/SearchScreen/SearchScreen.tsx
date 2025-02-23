import React from 'react';
import { SearchResultsScreen } from '../../screens/main/SearchResultsScreen';
import { MainTabParamList } from '../../navigation/types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type SearchProps = BottomTabScreenProps<MainTabParamList, 'Search'>;

const SearchScreenWrapper: React.FC<SearchProps> = ({ navigation, route }) => {
  return (
    <SearchResultsScreen
      navigation={navigation}
      route={route}
    />
  );
};

export default SearchScreenWrapper;

// Add index.ts for cleaner imports
export { SearchScreenWrapper as SearchScreen };
