'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ProgressBar from './ProgressBar';

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
    roadmapTitle?: string;
    onWeekClick: (weekNumber: number) => void;
    isDrawer?: boolean;
    onClose?: () => void;
}

export default function Sidebar({
    weeks,
    currentWeek,
    progress,
    roadmapTitle,
    onWeekClick,
    isDrawer,
    onClose,
}: SidebarProps) {
    const router = useRouter();

    return (
        <>
            {isDrawer && <div className="drawer-overlay" onClick={onClose} />}
            <div className={`left-sidebar ${isDrawer ? 'sidebar-open' : ''}`}>
                {/* Logo */}
                <div style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '28px', height: '28px',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, var(--accent), var(--graph))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 800, color: 'white',
                        }}>R</div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>RoadForge</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Execute. Don&apos;t Plan.</div>
                        </div>
                        {isDrawer && (
                            <button onClick={onClose} style={{
                                marginLeft: 'auto', background: 'none', border: 'none',
                                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px',
                            }}>✕</button>
                        )}
                    </div>

                    {/* Nav */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                        <button className="nav-btn" onClick={() => router.push('/library')}
                            style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}>
                            📚 Library
                        </button>
                        <button className="nav-btn" onClick={() => router.push('/upload')}
                            style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}>
                            + Upload
                        </button>
                        <button className="nav-btn" onClick={() => signOut({ callbackUrl: '/auth' })}
                            style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--text-muted)' }}>
                            ↗
                        </button>
                    </div>
                </div>

                {/* Scrollable */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
                    {/* Roadmap title */}
                    {roadmapTitle && (
                        <div className="sidebar-section">
                            <div style={{
                                fontSize: '12px', fontWeight: 600,
                                color: 'var(--text-secondary)',
                                lineHeight: '1.4',
                            }}>
                                {roadmapTitle}
                            </div>
                        </div>
                    )}

                    {/* Weeks */}
                    <div className="sidebar-section">
                        <div style={{
                            fontSize: '10px', textTransform: 'uppercase',
                            letterSpacing: '0.5px', color: 'var(--text-muted)',
                            fontWeight: 600, marginBottom: '6px', padding: '0 4px',
                        }}>Weeks</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
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
                                            <span>W{week.weekNumber}</span>
                                            <span style={{ fontSize: '11px' }}>
                                                {weekCompleted ? '✓' : ''}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
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
                </div>
            </div>
        </>
    );
}
