import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookedDateRange } from '../models';

interface DatePickerProps {
    id: string;
    label: string;
    selectedDate: string | null;
    onDateSelect: (date: string | null) => void;
    minDate?: string | null;
    bookedDates?: BookedDateRange[];
    disabled?: boolean;
}

const getDateParts = (date: Date): { year: number, month: number, day: number } => {
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
};
const createUtcDate = (year: number, month: number, day: number): Date => {
     return new Date(Date.UTC(year, month, day));
};
const parseDateString = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return createUtcDate(year, month, day);
        }
    }
    return null;
};
const formatDateToString = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DatePicker: React.FC<DatePickerProps> = ({
    id,
    label,
    selectedDate,
    onDateSelect,
    minDate: minDateProp,
    bookedDates = [],
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const initialDisplayDate = parseDateString(selectedDate) || new Date();
    const [displayMonthDate, setDisplayMonthDate] = useState(createUtcDate(initialDisplayDate.getFullYear(), initialDisplayDate.getMonth(), 1));
    const pickerRef = useRef<HTMLDivElement>(null);

    const minSelectableDate = parseDateString(minDateProp);
    const today = createUtcDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isDateDisabled = useCallback((date: Date): boolean => {
        if (minSelectableDate && date < minSelectableDate) {
            return true;
        }
        if (date < today) {
            return true;
        }

        for (const booked of bookedDates) {
            const bookedStart = parseDateString(booked.check_in_date);
            const bookedEnd = parseDateString(booked.check_out_date);

            if (bookedStart && bookedEnd && date >= bookedStart && date < bookedEnd) {
                return true;
            }
        }
        return false;
    }, [minSelectableDate, today, bookedDates]);

    const renderCalendar = () => {
        const { year: currentYear, month: currentMonth } = getDateParts(displayMonthDate);

        const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
        let firstDayOfMonthWeekday = displayMonthDate.getUTCDay(); // 0 (Sun) to 6 (Sat)

        firstDayOfMonthWeekday = (firstDayOfMonthWeekday === 0) ? 6 : firstDayOfMonthWeekday - 1; // here mon to sat

        const weeks: (Date | null)[][] = [];
        let currentWeek: (Date | null)[] = [];
        let dayOfMonth = 1;

        for (let i = 0; i < firstDayOfMonthWeekday; i++) {
            currentWeek.push(null);
        }

        while (dayOfMonth <= daysInMonth) {
            currentWeek.push(createUtcDate(currentYear, currentMonth, dayOfMonth));
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            dayOfMonth++;
        }
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                 currentWeek.push(null);
             }
            weeks.push(currentWeek);
        }


        const handleDayClick = (date: Date) => {
            if (!isDateDisabled(date)) {
                onDateSelect(formatDateToString(date));
                setIsOpen(false);
            }
        };

        const selectedUtcDate = parseDateString(selectedDate);


        return (
            <div style={calendarStyles.dropdown}>
                <div style={calendarStyles.header}>
                   <button type="button" onClick={prevMonth} style={calendarStyles.navButton}>&lt;</button>
                   <span>{displayMonthDate.toLocaleDateString('ru', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
                   <button type="button" onClick={nextMonth} style={calendarStyles.navButton}>&gt;</button>
                </div>
                <div style={calendarStyles.weekdays}>
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                        <div key={day} style={calendarStyles.weekday}>{day}</div>
                    ))}
                </div>
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} style={calendarStyles.week}>
                        {week.map((date, dayIndex) => {
                            if (!date) {
                                return <div key={`empty-${weekIndex}-${dayIndex}`} style={{ ...calendarStyles.dayCell, ...calendarStyles.emptyDayCell }}></div>;
                            }
                            const isDisabled = isDateDisabled(date);
                            const isSelected = selectedUtcDate && date.getTime() === selectedUtcDate.getTime();

                            return (
                                <div key={date.toISOString()} style={calendarStyles.dayCell}>
                                    <button
                                        type="button"
                                        onClick={() => handleDayClick(date)}
                                        disabled={isDisabled}
                                        style={{
                                            ...calendarStyles.dayButton,
                                            ...(isDisabled ? calendarStyles.disabledDay : {}),
                                            ...(isSelected ? calendarStyles.selectedDay : {}),
                                        }}
                                    >
                                        {date.getUTCDate()}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    const prevMonth = () => { 
         setDisplayMonthDate(prev => createUtcDate(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1));
    };
    const nextMonth = () => {
         setDisplayMonthDate(prev => createUtcDate(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1));
    };

    const toggleCalendar = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div style={calendarStyles.container} ref={pickerRef}>
            <label htmlFor={id} className="form-label">{label}</label>
            <input
                type="text"
                id={id}
                className="form-control"
                value={selectedDate || ''}
                onClick={toggleCalendar}
                readOnly
                placeholder="YYYY-MM-DD"
                disabled={disabled}
                style={{ backgroundColor: 'white', cursor: disabled ? 'not-allowed' : 'pointer' }}
            />
            {isOpen && !disabled && renderCalendar()}
        </div>
    );
};


// styles need to move but i dont care :)
const calendarStyles: { [key: string]: React.CSSProperties } = {
    container: {
        position: 'relative',
        display: 'inline-block',
        width: '100%',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
        zIndex: 100,
        padding: '10px',
        minWidth: '280px',
         width: '100%',
         boxSizing: 'border-box',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        fontWeight: 'bold',
    },
    navButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px 10px',
        fontSize: '1rem',
    },
    weekdays: {
        display: 'flex',
        marginBottom: '5px',
        fontSize: '0.8em',
        color: '#666',
    },
    weekday: {
        width: 'calc(100% / 7)',
        textAlign: 'center',
        boxSizing: 'border-box',
    },
    week: {
        display: 'flex',
    },
    dayCell: {
        width: 'calc(100% / 7)',
        height: '35px', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box', 
         padding: '2px', 
    },
    
    emptyDayCell: {
         visibility: 'hidden', 
    },
    dayButton: {
        width: '100%', 
        height: '100%',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        borderRadius: '4px',
        padding: 0,
        textAlign: 'center',
        fontSize: '0.9rem', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledDay: {
        color: '#aaa', 
        cursor: 'not-allowed',
        textDecoration: 'line-through',
        backgroundColor: '#f8f9fa', 
    },
    selectedDay: {
        backgroundColor: '#0d6efd',
        color: 'white',
        fontWeight: 'bold',
    },
};


export default DatePicker;