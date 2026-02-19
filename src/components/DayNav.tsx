'use client';

interface DayNavProps {
    currentDayIndex: number;
    totalDays: number;
    weekNumber: number;
    dayNumber: number;
    isWeekend: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export default function DayNav({
    currentDayIndex,
    totalDays,
    weekNumber,
    dayNumber,
    isWeekend,
    onPrev,
    onNext,
}: DayNavProps) {
    const dayLabel = isWeekend ? 'Weekend' : `Day ${dayNumber}`;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
        }}>
            <div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.5px',
                }}>
                    Week {weekNumber} — {dayLabel}
                </h1>
                <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: '2px 0 0 0',
                }}>
                    Day {currentDayIndex + 1} of {totalDays}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button className="nav-btn" onClick={onPrev} disabled={currentDayIndex <= 0} title="← Previous day">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Prev
                </button>
                <button className="nav-btn" onClick={onNext} disabled={currentDayIndex >= totalDays - 1} title="→ Next day">
                    Next
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
