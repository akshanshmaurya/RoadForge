/**
 * Date utilities for calculating the current day index and related info.
 */

export interface DayInfo {
    globalDayIndex: number;
    weekNumber: number;
    dayInWeek: number;
    isWeekend: boolean;
}

/**
 * Calculate the global day index (0-based) from the roadmap start date.
 * Each week has 7 days (Day 1-5 weekdays + 2 weekend days mapped as Day 6).
 * But in our roadmap, each week has up to 6 entries (Day 1-5 + Weekend).
 * So we map calendar days to roadmap days.
 */
export function calculateDayIndex(startDate: Date, currentDate: Date = new Date()): number {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);

    const diffMs = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 0;

    // Each week in the roadmap: 5 weekdays + 1 weekend entry = 6 entries
    // Calendar week: 7 days (Mon-Sun)
    // Map: Mon-Fri → Day 1-5, Sat-Sun → Weekend (Day 6)
    const calendarWeek = Math.floor(diffDays / 7);
    const calendarDayOfWeek = diffDays % 7; // 0=Mon, 1=Tue, ..., 4=Fri, 5=Sat, 6=Sun

    // Each roadmap week has 6 entries (index 0-5)
    if (calendarDayOfWeek <= 4) {
        // Weekday: map to roadmap day index 0-4 within the week
        return calendarWeek * 6 + calendarDayOfWeek;
    } else {
        // Weekend: map to roadmap day index 5
        return calendarWeek * 6 + 5;
    }
}

/**
 * Get the day info for a given global day index.
 */
export function getDayInfo(globalDayIndex: number): DayInfo {
    const weekNumber = Math.floor(globalDayIndex / 6) + 1;
    const dayInWeek = (globalDayIndex % 6) + 1; // 1-6
    const isWeekend = dayInWeek === 6;

    return {
        globalDayIndex,
        weekNumber,
        dayInWeek,
        isWeekend,
    };
}

/**
 * Format a date nicely for display.
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}
