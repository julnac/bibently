import { useState, useMemo } from 'react';
import { 
  format, parseISO, eachDayOfInterval, 
  isFriday, nextFriday, nextSunday, endOfWeek 
} from 'date-fns';

export const useDateRange = (initialRange: { start: string | null; end: string | null }, onDatesSelected: any) => {
  const [selectedRange, setSelectedRange] = useState(initialRange);

  const handleDayPress = (dateString: string) => {
    let newRange = { ...selectedRange };

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      newRange = { start: dateString, end: null };
    } else {
      if (dateString < selectedRange.start) {
        newRange = { start: dateString, end: null };
      } else if (dateString === selectedRange.start) {
        newRange = { start: null, end: null };
      } else {
        newRange = { ...selectedRange, end: dateString };
      }
    }

    setSelectedRange(newRange);
    onDatesSelected(newRange);
  };

  const applyPreset = (type: 'today' | 'weekend' | 'week') => {
    const today = new Date();
    let start: Date = today;
    let end: Date = today;

    if (type === 'weekend') {
      start = (today.getDay() === 0 || today.getDay() === 6 || today.getDay() === 5) 
        ? today : nextFriday(today);
      end = nextSunday(start);
    } else if (type === 'week') {
      end = endOfWeek(today, { weekStartsOn: 1 });
    }

    const newRange = {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    };

    setSelectedRange(newRange);
    onDatesSelected(newRange);
  };

  const markedDates = useMemo(() => {
    if (!selectedRange.start) return {};
    const marked: any = {};

    if (selectedRange.start && !selectedRange.end) {
      marked[selectedRange.start] = { startingDay: true, endingDay: true, color: '#007AFF', textColor: 'white' };
    } else if (selectedRange.start && selectedRange.end) {
      try {
        const range = eachDayOfInterval({ 
          start: parseISO(selectedRange.start), 
          end: parseISO(selectedRange.end) 
        });
        range.forEach((date, index) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          marked[dateStr] = {
            startingDay: index === 0,
            endingDay: index === range.length - 1,
            color: '#007AFF',
            textColor: 'white',
            opacity: (index === 0 || index === range.length - 1) ? 1 : 0.7
          };
        });
      } catch (e) {}
    }
    return marked;
  }, [selectedRange]);

  return { selectedRange, handleDayPress, applyPreset, markedDates };
};