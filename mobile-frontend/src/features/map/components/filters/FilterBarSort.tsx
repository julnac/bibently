import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, interpolate, Extrapolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useFilterStore } from '@/src/core/store/useFilterStore';

const SORT_OPTIONS = [
  { label: 'Najbliższe daty', key: 'StartDate', order: 'Ascending' },
  { label: 'Najtańsze', key: 'Price', order: 'Ascending' },
  { label: 'Najnowsze', key: 'CreatedAt', order: 'Descending' },
];

export const FilterBarSort = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setSorting } = useFilterStore();

  // Animacja wysokości i opacity
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isOpen ? 195 : 40, { duration: 300 }),
      backgroundColor: withTiming(isOpen ? '#fff' : '#f3f4f6', { duration: 300 }),
      padding: withTiming(isOpen ? 6 : 0, { duration: 300 }),
    };
  });

  const optionsStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isOpen ? 1 : 0, { duration: 200 }),
      display: isOpen ? 'flex' : 'none',
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Główny przycisk (zawsze widoczny na górze) */}
      <Pressable 
        onPress={() => setIsOpen(!isOpen)} 
        style={styles.header}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <Ionicons name="swap-vertical" size={18} color={isOpen ? '#4F46E5' : '#666'} />
          <Text className="ml-2 font-medium text-gray-700">
            {isOpen ? 'Sortuj' : (filters.SortKey ? 'Sortuj' : 'Sortuj')}
          </Text>
        </View>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="#666" />
      </Pressable>

      {/* Rozwijana lista opcji */}
      <Animated.View style={[styles.optionsList, optionsStyle]}>
        {SORT_OPTIONS.map((option) => {
          const isActive = filters.SortKey === option.key && filters.Order === option.order;
          return (
            <Pressable
              key={`${option.key}-${option.order}`}
              onPress={() => {
                setSorting(option.key as any, option.order as any);
                setIsOpen(false);
              }}
              className={`py-3 px-2 rounded-2xl mb-1 flex-row justify-between items-center gap-2 ${isActive ? 'bg-indigo-50' : ''}`}
            >
              <Text className={isActive ? 'text-indigo-600 font-bold' : 'text-gray-600'}>
                {option.label}
              </Text>
              {isActive && <Ionicons name="checkmark" size={18} color="#4F46E5" />}
            </Pressable>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    // width: 160,
    // marginRight: 8,
  },
  header: {
    height: 38,
    paddingHorizontal: 12,
  },
  optionsList: {
    marginTop: 8,
  }
});