import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UniversalMap() {
  return (
    <View style={styles.webPlaceholder}>
      <Text style={styles.text}>Map View is coming soon to Web</Text>
      <Text style={styles.subtext}>Use mobile app for full interactive experience</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webPlaceholder: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  text: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  subtext: { color: '#6b7280', marginTop: 8 }
});