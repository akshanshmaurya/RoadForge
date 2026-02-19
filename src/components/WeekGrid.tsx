'use client';

interface DayInfo {
    _id: string;
    dayNumber: number;
    globalDayIndex: number;
    type: 'weekday' | 'weekend';
    tasks: { completed: boolean }[];
}

interface WeekGridProps {
    days: DayInfo[];
    weekNumber: number;
    weekTitle: string;
    currentDayIndex: number;
    onDayClick: (globalDayIndex: number) => void;
}

export default function WeekGrid({ days, weekNumber, weekTitle, currentDayIndex, onDayClick }: WeekGridProps) {
    return (
        <div>
            <h2 style={{
                fontSize: '24px',
                fontWeight: 800,
                marginBottom: '4px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px',
            }}>
                Week {weekNumber}
            </h2>
            <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '16px',
            }}>
                {weekTitle}
            </p>

            {/* Calendar-style grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '10px',
            }}>
                {days.map((day) => {
                    const totalTasks = day.tasks.length;
                    const completedTasks = day.tasks.filter(t => t.completed).length;
                    const allCompleted = totalTasks > 0 && completedTasks === totalTasks;
                    const isCurrent = day.globalDayIndex === currentDayIndex;
                    const dayLabel = day.type === 'weekend' ? 'Weekend' : `Day ${day.dayNumber}`;
                    const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return (
                        <div
                            key={day._id}
                            className={`day-grid-card ${allCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                            onClick={() => onDayClick(day.globalDayIndex)}
                        >
                            <div style={{
                                fontSize: '13px', fontWeight: 600, marginBottom: '6px',
                                color: allCompleted ? 'var(--success)' : 'var(--text-primary)',
                            }}>
                                {dayLabel}
                            </div>

                            {/* Mini progress */}
                            <div style={{
                                width: '100%', height: '3px',
                                background: 'var(--bg-primary)',
                                borderRadius: '2px', overflow: 'hidden',
                                marginBottom: '6px',
                            }}>
                                <div style={{
                                    width: `${pct}%`, height: '100%',
                                    background: allCompleted ? 'var(--success)' : 'var(--accent)',
                                    borderRadius: '2px',
                                    transition: 'width 0.3s ease',
                                }} />
                            </div>

                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {completedTasks}/{totalTasks} tasks
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
