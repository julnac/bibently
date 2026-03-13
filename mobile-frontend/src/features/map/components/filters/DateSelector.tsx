import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useDateRange } from '@/src/core/hooks/useDateRange';

LocaleConfig.locales['pl'] = {
  monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
  dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
  dayNamesShort: ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'],
  today: 'Dzisiaj'
};
LocaleConfig.defaultLocale = 'pl';

interface DateSelectorProps {
  onDatesSelected: (range: { start: string | null; end: string | null }) => void;
  initialDateRange: { start: string | null; end: string | null };
}

const DateSelector = ({ onDatesSelected, initialDateRange }: DateSelectorProps) => {
  const { selectedRange, handleDayPress, applyPreset, markedDates } = useDateRange(initialDateRange, onDatesSelected);

  return (
    <View style={styles.container}>
      <View style={styles.presets}>
        <PresetButton label="Dziś" onPress={() => applyPreset('today')} />
        <PresetButton label="Weekend" onPress={() => applyPreset('weekend')} />
        <PresetButton label="Ten tydzień" onPress={() => applyPreset('week')} />
      </View>

      <Calendar
        markingType={'period'}
        markedDates={markedDates}
        onDayPress={(day) => handleDayPress(day.dateString)}
        theme={{
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
          dotColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
        }}
      />
    </View>
  );
};

const PresetButton = ({ label, onPress }: { label: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.presetBtn} onPress={onPress}>
    <Text style={styles.presetText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  presetBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  presetText: { fontSize: 13 },
  calendarPlaceholder: {
    height: 200,
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCC'
  }
});

export default DateSelector;