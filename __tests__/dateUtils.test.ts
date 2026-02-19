import { calculateDayIndex, getDayInfo, formatDate } from '../src/lib/dateUtils';

describe('calculateDayIndex', () => {
    it('should return 0 for the start date itself', () => {
        const start = new Date('2026-01-05');
        const current = new Date('2026-01-05');
        expect(calculateDayIndex(start, current)).toBe(0);
    });

    it('should map weekdays correctly within the first week', () => {
        const start = new Date('2026-01-05'); // Monday
        expect(calculateDayIndex(start, new Date('2026-01-05'))).toBe(0); // Mon
        expect(calculateDayIndex(start, new Date('2026-01-06'))).toBe(1); // Tue
        expect(calculateDayIndex(start, new Date('2026-01-07'))).toBe(2); // Wed
        expect(calculateDayIndex(start, new Date('2026-01-08'))).toBe(3); // Thu
        expect(calculateDayIndex(start, new Date('2026-01-09'))).toBe(4); // Fri
    });

    it('should map Saturday and Sunday to weekend (index 5)', () => {
        const start = new Date('2026-01-05'); // Monday
        expect(calculateDayIndex(start, new Date('2026-01-10'))).toBe(5); // Sat
        expect(calculateDayIndex(start, new Date('2026-01-11'))).toBe(5); // Sun
    });

    it('should map second week correctly', () => {
        const start = new Date('2026-01-05'); // Monday
        expect(calculateDayIndex(start, new Date('2026-01-12'))).toBe(6); // Mon W2
        expect(calculateDayIndex(start, new Date('2026-01-13'))).toBe(7); // Tue W2
    });

    it('should return 0 if current date is before start date', () => {
        const start = new Date('2026-01-05');
        const current = new Date('2026-01-01');
        expect(calculateDayIndex(start, current)).toBe(0);
    });
});

describe('getDayInfo', () => {
    it('should return correct weekNumber for index 0', () => {
        const info = getDayInfo(0);
        expect(info.weekNumber).toBe(1);
        expect(info.dayInWeek).toBe(1);
        expect(info.isWeekend).toBe(false);
    });

    it('should return weekend for index 5', () => {
        const info = getDayInfo(5);
        expect(info.weekNumber).toBe(1);
        expect(info.dayInWeek).toBe(6);
        expect(info.isWeekend).toBe(true);
    });

    it('should return week 2 for index 6', () => {
        const info = getDayInfo(6);
        expect(info.weekNumber).toBe(2);
        expect(info.dayInWeek).toBe(1);
        expect(info.isWeekend).toBe(false);
    });
});

describe('formatDate', () => {
    it('should format a date string correctly', () => {
        const date = new Date('2026-01-05T00:00:00');
        const formatted = formatDate(date);
        expect(formatted).toContain('2026');
        expect(formatted).toContain('January');
    });
});
