import { Text, TouchableOpacity, StyleSheet } from 'react-native';

type FilterButtonProps = {
    label: string,
    onPress: () => void,
    isActive: boolean,
    isSet: boolean
}

const FilterButton = ({ label, onPress, isActive, isSet }: FilterButtonProps) => (
  <TouchableOpacity 
    style={[styles.button, isActive && styles.activeButton, isSet && styles.activeButton]} 
    onPress={onPress}
  >
    <Text style={[styles.buttonText, isActive && styles.activeText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#e6f0ff',
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  }
});

export default FilterButton;