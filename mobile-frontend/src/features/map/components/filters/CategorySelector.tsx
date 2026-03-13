import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// Definiujemy mapowanie nazw
const CATEGORIES = [
  { id: 'NETWORKING', label: 'Networking', icon: '🤝' },
  { id: 'MUSIC', label: 'Muzyka', icon: '🎵' },
  { id: 'SPORT', label: 'Sport', icon: '⚽' },
  { id: 'COMMUNITY', label: 'Społeczność', icon: '🏘️' },
];

interface CategorySelectorProps {
  selectedCategory: string | undefined;
  onSelected: (categoryId: string | undefined) => void;
}

const CategorySelector = ({ selectedCategory, onSelected }: CategorySelectorProps) => {

  return (
    <ScrollView style={styles.container}>
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        
        return (
          <TouchableOpacity 
            key={cat.id} 
            style={[styles.option, isSelected && styles.activeOption]} 
            onPress={() => onSelected(isSelected ? undefined : cat.id)}
          >
            <View style={styles.row}>
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text style={[styles.label, isSelected && styles.activeLabel]}>
                {cat.label}
              </Text>
            </View>
            {isSelected && <View style={styles.checkDot} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400, // Żeby modal nie "uciekł" poza ekran
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeOption: {
    backgroundColor: '#F0F7FF', // Delikatny błękit dla zaznaczenia
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  }
});

export default CategorySelector;