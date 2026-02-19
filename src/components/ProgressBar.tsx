'use client';

interface ProgressBarProps {
    progress: {
        totalDays: number;
        daysCompleted: number;
        totalTasks: number;
        completedTasks: number;
        completionPercentage: number;
        streak: number;
        graph: { total: number; completed: number };
        revision: { total: number; completed: number };
        theory: { total: number; completed: number };
    } | null;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
    if (!progress) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Overall */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        Progress
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {progress.completionPercentage}%
                    </span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress.completionPercentage}%` }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {progress.completedTasks}/{progress.totalTasks} tasks
                </div>
            </div>

            {/* Streak */}
            {progress.streak > 0 && (
                <div className="streak-badge">
                    🔥 {progress.streak} day streak
                </div>
            )}

            {/* Category breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--graph)' }}>Graph</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {progress.graph.completed}/{progress.graph.total}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--revision)' }}>Revision</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {progress.revision.completed}/{progress.revision.total}
                    </span>
                </div>
                {progress.theory.total > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--theory)' }}>Theory</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {progress.theory.completed}/{progress.theory.total}
                        </span>
                    </div>
                )}
            </div>

            {/* Days completed */}
            <div className="stat-card">
                <div className="stat-label">Days Complete</div>
                <div className="stat-value">{progress.daysCompleted}<span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>/{progress.totalDays}</span></div>
            </div>
        </div>
    );
}
