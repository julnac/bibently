'use client';

import { useState, useMemo, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { pl, enUS } from 'date-fns/locale';
import {
    startOfWeek,
    endOfWeek,
    nextSaturday,
    nextSunday,
    isSaturday,
    format,
    addDays,
    startOfMonth,
    endOfMonth,
    isToday,
} from 'date-fns';

interface DatePickerProps {
    startDate: string | null;
    endDate: string | null;
    onSelect: (start: string | null, end: string | null) => void;
}

function toDateStr(d: Date): string {
    return format(d, 'yyyy-MM-dd');
}

export default function DatePickerPopover({
    startDate,
    endDate,
    onSelect,
}: DatePickerProps) {
    const initialRange: DateRange | undefined = useMemo(() => {
        if (!startDate) return undefined;
        const from = new Date(startDate);
        const to = endDate ? new Date(endDate) : from;
        return { from, to };
    }, [startDate, endDate]);

    const [range, setRange] = useState<DateRange | undefined>(initialRange);
    const [activeQuickPick, setActiveQuickPick] = useState<'today' | 'tomorrow' | 'weekend' | 'thisWeek' | 'thisMonth' | null>(null);

    // Sync active tile with the visually selected range dynamically
    useEffect(() => {
        if (!range?.from || !range?.to) {
            setActiveQuickPick(null);
            return;
        }
        const fromStr = toDateStr(range.from);
        const toStr = toDateStr(range.to);
        const today = new Date();

        const sat = isSaturday(today) ? today : nextSaturday(today);
        const sun = nextSunday(sat);

        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);

        if (fromStr === toDateStr(today) && toStr === toDateStr(today)) {
            setActiveQuickPick('today');
        } else if (fromStr === toDateStr(addDays(today, 1)) && toStr === toDateStr(addDays(today, 1))) {
            setActiveQuickPick('tomorrow');
        } else if (fromStr === toDateStr(sat) && toStr === toDateStr(sun)) {
            setActiveQuickPick('weekend');
        } else if (fromStr === toDateStr(weekStart) && toStr === toDateStr(weekEnd)) {
            setActiveQuickPick('thisWeek');
        } else if (fromStr === toDateStr(monthStart) && toStr === toDateStr(monthEnd)) {
            setActiveQuickPick('thisMonth');
        } else {
            setActiveQuickPick(null);
        }
    }, [range]);

    const handleSelect = (newRange: DateRange | undefined) => {
        setRange(newRange);
        if (newRange?.from) {
            const start = toDateStr(newRange.from);
            const end = newRange.to ? toDateStr(newRange.to) : start;
            onSelect(start, end);
        }
    };

    const handleQuickSelect = (from: Date, to: Date) => {
        const newRange = { from, to };
        setRange(newRange);
        onSelect(toDateStr(from), toDateStr(to));
    };

    const handleToday = () => {
        const today = new Date();
        handleQuickSelect(today, today);
    };

    const handleTomorrow = () => {
        const tomorrow = addDays(new Date(), 1);
        handleQuickSelect(tomorrow, tomorrow);
    };

    const handleWeekend = () => {
        const today = new Date();
        const sat = isSaturday(today) ? today : nextSaturday(today);
        const sun = nextSunday(sat);
        handleQuickSelect(sat, sun);
    };

    const handleThisWeek = () => {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        handleQuickSelect(weekStart, weekEnd);
    };

    const handleThisMonth = () => {
        const today = new Date();
        handleQuickSelect(startOfMonth(today), endOfMonth(today));
    };

    const activeButtonClass = "bg-foreground text-white border-foreground";
    const inactiveButtonClass = "bg-white text-text-primary border-border hover:border-text-secondary";

    return (
        <div className="bg-white rounded-3xl shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-6" onClick={(e) => e.stopPropagation()}>
            {/* Quick-select pills */}
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                <button
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors border ${activeQuickPick === 'today' ? activeButtonClass : inactiveButtonClass}`}
                    onClick={handleToday}
                >
                    Today
                </button>
                <button
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors border ${activeQuickPick === 'tomorrow' ? activeButtonClass : inactiveButtonClass}`}
                    onClick={handleTomorrow}
                >
                    Tomorrow
                </button>
                <button
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors border ${activeQuickPick === 'weekend' ? activeButtonClass : inactiveButtonClass}`}
                    onClick={handleWeekend}
                >
                    Weekend
                </button>
                <button
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors border ${activeQuickPick === 'thisWeek' ? activeButtonClass : inactiveButtonClass}`}
                    onClick={handleThisWeek}
                >
                    This week
                </button>
                <button
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors border ${activeQuickPick === 'thisMonth' ? activeButtonClass : inactiveButtonClass}`}
                    onClick={handleThisMonth}
                >
                    This month
                </button>
            </div>

            {/* Calendar */}
            <div className="flex justify-center">
                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleSelect}
                    locale={enUS}
                    weekStartsOn={1}
                    numberOfMonths={2}
                    showOutsideDays={false}
                    classNames={{
                        root: 'rdp-bibently',
                        months: 'flex gap-8',
                        month_caption: 'text-sm font-bold text-center mb-4',
                        nav: 'absolute top-0 w-full flex justify-between z-10 pointer-events-none',
                        button_previous: 'pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover transition-colors absolute left-0',
                        button_next: 'pointer-events-auto flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-hover transition-colors absolute right-0',
                        month_grid: 'w-full border-collapse',
                        weekdays: 'text-xs text-text-secondary font-medium pb-2 flex justify-center',
                        weekday: 'w-10 h-10 text-center font-normal text-[11px]',
                        weeks: '',
                        week: 'flex w-full',
                        day: 'relative w-10 h-10 p-0 m-0 text-sm flex items-center justify-center cursor-pointer',
                        day_button: 'w-10 h-10 rounded-lg hover:border hover:border-foreground flex items-center justify-center transition-all',
                        selected: 'bg-primary text-white rounded-lg font-bold',
                        range_start: 'bg-primary text-white rounded-l-lg rounded-r-[0] font-bold before:absolute before:inset-0 before:bg-primary/5 before:rounded-l-lg before:-z-10',
                        range_end: 'bg-primary text-white rounded-r-lg rounded-l-[0] font-bold before:absolute before:inset-0 before:bg-primary/5 before:rounded-r-lg before:-z-10',
                        range_middle: 'bg-primary/50 text-white rounded-none',
                        today: 'font-bold underline underline-offset-4',
                        outside: 'text-text-muted',
                    }}
                />
            </div>
        </div>
    );
}
