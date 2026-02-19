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
                fontSize: '22px',
                fontWeight: 700,
                marginBottom: '8px',
                color: 'var(--text-primary)',
            }}>
                Week {weekNumber}
            </h2>
            <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                marginBottom: '20px',
            }}>
                {weekTitle}
            </p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
            }}>
                {days.map((day) => {
                    const totalTasks = day.tasks.length;
                    const completedTasks = day.tasks.filter(t => t.completed).length;
                    const allCompleted = totalTasks > 0 && completedTasks === totalTasks;
                    const isCurrent = day.globalDayIndex === currentDayIndex;
                    const dayLabel = day.type === 'weekend' ? 'Weekend' : `Day ${day.dayNumber}`;

                    return (
                        <div
                            key={day._id}
                            className={`day-grid-card ${allCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                            onClick={() => onDayClick(day.globalDayIndex)}
                        >
                            <div style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: allCompleted ? 'var(--success)' : 'var(--text-primary)',
                            }}>
                                {dayLabel}
                            </div>
                            <div style={{
                                fontSize: '24px',
                                marginBottom: '6px',
                            }}>
                                {allCompleted ? '✓' : isCurrent ? '◉' : '○'}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                            }}>
                                {completedTasks}/{totalTasks} tasks
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
