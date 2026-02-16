import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const PRICE_PRESETS = [
  { label: 'Darmowe', min: 0, max: 0 },
  { label: 'Do 50 zł', min: 0, max: 50 },
  { label: 'Do 100 zł', min: 0, max: 100 },
  { label: 'Wszystkie', min: undefined, max: undefined },
];

interface PriceRange {
  min: number | null;
  max: number | null;
}

interface PriceSelectorProps {
  onSelected: (range: PriceRange) => void;
  initialRange: PriceRange;
}

const PriceSelector = ({ onSelected, initialRange }: PriceSelectorProps) => {
  const [minInput, setMinInput] = useState(initialRange.min?.toString() ?? '');
  const [maxInput, setMaxInput] = useState(initialRange.max?.toString() ?? '');

  const minNum = parseFloat(minInput.replace(',', '.'));
  const maxNum = parseFloat(maxInput.replace(',', '.'));
  const isInvalid = minInput !== '' && maxInput !== '' && minNum > maxNum;

  const updateRange = (newMin: string, newMax: string) => {
    const minVal = newMin.trim() === '' ? null : parseFloat(newMin.replace(',', '.'));
    const maxVal = newMax.trim() === '' ? null : parseFloat(newMax.replace(',', '.'));
    onSelected({ min: minVal, max: maxVal });
  }; 

  const handlePreset = (pMin: number | null, pMax: number | null) => {
    const newMinStr = pMin?.toString() ?? (pMin === 0 ? '0' : '');
    const newMaxStr = pMax?.toString() ?? (pMax === 0 ? '0' : '');

    setMinInput(newMinStr);
    setMaxInput(newMaxStr);
    onSelected({ min: pMin, max: pMax });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Szybki wybór</Text>
      <View style={styles.presetsRow}>
        {PRICE_PRESETS.map((p) => {
          const isActive = initialRange.max === p.max && initialRange.min === p.min;
          return (
            <TouchableOpacity 
              key={p.label}
              style={[styles.presetChip, isActive && styles.activeChip]}
              onPress={() => handlePreset(p.min ?? null, p.max ?? null)}
            >
              <Text style={[styles.presetText, isActive && styles.activePresetText]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        <Text style={styles.sectionTitle}>Zakres własny (zł)</Text>
        {isInvalid && <Text style={styles.errorLabel}>Cena Od jest większa niż Do</Text>}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, isInvalid && styles.inputError]}
          keyboardType="numeric"
          value={minInput}
          placeholder="Od"
          onChangeText={(val) => {
            setMinInput(val);
            updateRange(val, maxInput);
          }}
        />
        <TextInput
          style={[styles.input, isInvalid && styles.inputError]}
          keyboardType="numeric"
          value={maxInput}
          placeholder="Do"
          onChangeText={(val) => {
            setMaxInput(val);
            updateRange(minInput, val);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12, marginTop: 10 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  activeChip: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  presetText: { color: '#333', fontSize: 14 },
  activePresetText: { color: '#FFF', fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', gap: 16 },
  inputWrapper: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9'
  },
  errorLabel: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#FF3B30', 
    backgroundColor: '#FFF9F9', 
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  }
});

export default PriceSelector;