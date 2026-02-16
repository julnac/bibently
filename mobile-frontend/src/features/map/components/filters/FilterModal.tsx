import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import CategorySelector from "./CategorySelector";
import PriceSelector from "./PriceSelector";
import DateSelector from "./DateSelector";
import { useFilterStore } from '@/src/core/store/useFilterStore';
import { useState } from 'react';

interface FilterModalProps {
  type: 'category' | 'date' | 'price' | null;
  isVisible: boolean;
  onClose: () => void;
}

const FilterModal = ({ type, isVisible, onClose }: FilterModalProps) => {
  const { filters, setDates, setPrices, setCategory } = useFilterStore();

  const [dateRange, setDateRange] = useState({
    start: filters.StartDate?.split('T')[0] || null,
    end: filters.EndDate?.split('T')[0] || null,
  });

  const [priceRange, setPriceRange] = useState({
    min: filters.MinPrice ?? null,
    max: filters.MaxPrice ?? null,
  });

  const [selectedCat, setSelectedCat] = useState<string | undefined>(filters.Type);

  const handleApply = () => {
    switch (type) {
      case 'date':
        setDates(dateRange.start, dateRange.end);
        break;
      case 'price':
        setPrices(priceRange.min, priceRange.max);
        break;
      case 'category':
        setCategory(selectedCat);
        break;
    }
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case 'category':
        return <CategorySelector selectedCategory={selectedCat} onSelected={setSelectedCat} />;
      case 'date':
        return <DateSelector onDatesSelected={setDateRange} initialDateRange={dateRange} />;
      case 'price':
        return <PriceSelector onSelected={setPriceRange} initialRange={priceRange} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      
      <View style={styles.sheet}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <Text style={styles.title}>
            {type === 'category' ? 'Rodzaj wydarzenia' : type === 'date' ? 'Kiedy?' : 'Cena'}
          </Text>
        </View>

        <View style={styles.content}>
          {renderContent()}
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Pokaż wyniki</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: '40%', // Dostosuj do potrzeb
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: 2
  }
});

export default FilterModal;