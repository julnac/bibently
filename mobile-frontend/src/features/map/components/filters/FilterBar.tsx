import { View, StyleSheet, ScrollView } from 'react-native';
import { useState } from "react";
import FilterButton from "./FilterButton";
import FilterModal from "./FilterModal";
import { useFilterStore } from "@/src/core/store/useFilterStore";

type FilterType = 'category' | 'date' | 'price' | null;

const FilterBar = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const filters = useFilterStore((state) => state.filters);

  const openFilter = (type: FilterType) => setActiveFilter(type);
  const closeFilter = () => setActiveFilter(null);

  const isFilterSet = (type: FilterType) => {
    switch (type) {
      case 'category': return !!filters.Type;
      case 'date': return !!filters.StartDate;
      case 'price': return filters.MinPrice !== undefined || filters.MaxPrice !== undefined;
      default: return false;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.bar}
      >
        <FilterButton 
          label="Kategoria" 
          onPress={() => openFilter('category')} 
          isActive={activeFilter === 'category'} 
          isSet={isFilterSet('category')}
        />
        <FilterButton 
          label="Data" 
          onPress={() => openFilter('date')} 
          isActive={activeFilter === 'date'} 
          isSet={isFilterSet('date')}
        />
        <FilterButton 
          label="Cena" 
          onPress={() => openFilter('price')} 
          isActive={activeFilter === 'price'} 
          isSet={isFilterSet('price')}
        />
      </ScrollView>

      {activeFilter && (
        <FilterModal 
          type={activeFilter} 
          isVisible={true}
          onClose={closeFilter} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
  },
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 16, 
    alignItems: 'center',
    gap: 8, 
  }
});

export default FilterBar;