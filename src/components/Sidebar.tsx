'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ProgressBar from './ProgressBar';
import ReferenceSection from './ReferenceSection';
import WeaknessReport from './WeaknessReport';

interface WeekInfo {
    _id: string;
    weekNumber: number;
    title: string;
    days: {
        _id: string;
        globalDayIndex: number;
        tasks: { completed: boolean }[];
    }[];
}

interface SidebarProps {
    weeks: WeekInfo[];
    currentWeek: number;
    currentDayIndex: number;
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
    references: { _id: string; sectionTitle: string; contentMarkdown: string }[];
    onWeekClick: (weekNumber: number) => void;
    onDayClick: (globalDayIndex: number) => void;
}

export default function Sidebar({
    weeks,
    currentWeek,
    progress,
    references,
    onWeekClick,
}: SidebarProps) {
    const router = useRouter();

    return (
        <aside style={{
            width: '280px',
            minWidth: '280px',
            height: '100vh',
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'fixed',
            left: 0,
            top: 0,
        }}>
            {/* Logo */}
            <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent), var(--graph))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'white',
                    }}>R</div>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>RoadForge</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Execute. Don&apos;t Plan.</div>
                    </div>
                </div>

                {/* Nav links */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '12px',
                }}>
                    <button
                        className="nav-btn"
                        onClick={() => router.push('/library')}
                        style={{ fontSize: '11px', padding: '4px 10px', flex: 1 }}
                    >
                        📚 Library
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => router.push('/upload')}
                        style={{ fontSize: '11px', padding: '4px 10px', flex: 1 }}
                    >
                        + Upload
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => signOut({ callbackUrl: '/auth' })}
                        style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--text-muted)' }}
                    >
                        ↗
                    </button>
                </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
                {/* Weeks */}
                <div className="sidebar-section">
                    <div style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        marginBottom: '8px',
                        padding: '0 4px',
                    }}>
                        Weeks
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {weeks.map((week) => {
                            const weekCompleted = week.days.every(d =>
                                d.tasks.length > 0 && d.tasks.every(t => t.completed)
                            );
                            const isActive = week.weekNumber === currentWeek;
                            return (
                                <div
                                    key={week._id}
                                    className={`week-item ${isActive ? 'active' : ''}`}
                                    onClick={() => onWeekClick(week.weekNumber)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Week {week.weekNumber}</span>
                                        <span style={{ fontSize: '12px' }}>
                                            {weekCompleted ? '✓' : ''}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {week.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Progress */}
                <div className="sidebar-section">
                    <ProgressBar progress={progress} />
                </div>

                {/* Weakness Report (LLM) */}
                <div className="sidebar-section">
                    <WeaknessReport />
                </div>

                {/* References */}
                <div className="sidebar-section">
                    <ReferenceSection references={references} />
                </div>
            </div>
        </aside>
    );
}
