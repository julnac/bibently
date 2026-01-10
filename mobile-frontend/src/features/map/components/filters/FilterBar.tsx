import { ScrollView, View } from "react-native";
import FilterChip from "./FilterChip";

interface FilterBarProps {
  activeFilters: {
    types: string[];
    dates: string[];
    prices: string[];
    distance: string | null;
    neighborhoods: string[];
    climate: string[];
  };
  onFilterPress: (filterType: string) => void;
}

const FilterBar = ({ activeFilters, onFilterPress }: FilterBarProps) => {
  const filterConfigs = [
    { key: 'types', label: 'Type', icon: 'grid-outline' },
    { key: 'dates', label: 'Date', icon: 'calendar-outline' },
    { key: 'prices', label: 'Price', icon: 'pricetag-outline' },
    { key: 'distance', label: 'Distance', icon: 'navigate-outline' },
    { key: 'neighborhoods', label: 'Neighborhood', icon: 'location-outline' },
    { key: 'climate', label: 'Climate', icon: 'partly-sunny-outline' },
  ];

  const getFilterCount = (key: string) => {
    const filterValue = activeFilters[key as keyof typeof activeFilters];
    if (Array.isArray(filterValue)) {
      return filterValue.length;
    }
    return filterValue ? 1 : 0;
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {filterConfigs.map((filter) => {
          const count = getFilterCount(filter.key);
          return (
            <FilterChip
              key={filter.key}
              label={filter.label}
              isActive={count > 0}
              count={count > 0 ? count : undefined}
              onPress={() => onFilterPress(filter.key)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FilterBar;
