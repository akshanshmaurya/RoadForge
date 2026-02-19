'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ContextPanel from '@/components/ContextPanel';
import TaskCard from '@/components/TaskCard';
import DayNav from '@/components/DayNav';
import WeekGrid from '@/components/WeekGrid';
import DailyFocus from '@/components/DailyFocus';

interface TaskType {
    _id: string;
    title: string;
    category: 'graph' | 'revision' | 'theory';
    link: string;
    completed: boolean;
    difficulty?: 'easy' | 'medium' | 'hard' | null;
    completedAt?: string | null;
}

interface DayType {
    _id: string;
    weekNumber: number;
    dayNumber: number;
    globalDayIndex: number;
    type: 'weekday' | 'weekend';
    tasks: TaskType[];
}

interface WeekType {
    _id: string;
    weekNumber: number;
    title: string;
    days: DayType[];
}

interface RoadmapType {
    _id: string;
    title: string;
    startDate: string;
    totalWeeks: number;
    totalDays: number;
}

interface ProgressType {
    totalDays: number;
    daysCompleted: number;
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    streak: number;
    graph: { total: number; completed: number };
    revision: { total: number; completed: number };
    theory: { total: number; completed: number };
}

interface ReferenceType {
    _id: string;
    sectionTitle: string;
    contentMarkdown: string;
}

type ViewMode = 'day' | 'week';

export default function DashboardPage() {
    const router = useRouter();
    const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
    const [weeks, setWeeks] = useState<WeekType[]>([]);
    const [references, setReferences] = useState<ReferenceType[]>([]);
    const [progress, setProgress] = useState<ProgressType | null>(null);
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [viewWeekNumber, setViewWeekNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);

    // Responsive drawer states
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);

    const calculateTodayIndex = useCallback((startDate: string, totalDays: number) => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffMs = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 0;
        const calWeek = Math.floor(diffDays / 7);
        const calDay = diffDays % 7;
        const idx = calDay <= 4 ? calWeek * 6 + calDay : calWeek * 6 + 5;
        if (idx >= totalDays) { setIsCompleted(true); return totalDays - 1; }
        return idx;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const [roadmapRes, progressRes] = await Promise.all([
                fetch('/api/roadmap'),
                fetch('/api/progress'),
            ]);
            const roadmapData = await roadmapRes.json();
            const progressData = await progressRes.json();
            if (!roadmapData.roadmap) { router.push('/upload'); return; }
            setRoadmap(roadmapData.roadmap);
            setWeeks(roadmapData.weeks || []);
            setReferences(roadmapData.references || []);
            setProgress(progressData);
            const todayIdx = calculateTodayIndex(roadmapData.roadmap.startDate, roadmapData.roadmap.totalDays);
            setCurrentDayIndex(todayIdx);
            const todayDay = findDayByIndex(roadmapData.weeks, todayIdx);
            if (todayDay) setViewWeekNumber(todayDay.weekNumber);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, [router, calculateTodayIndex]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); navigateDay(-1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); navigateDay(1); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    function findDayByIndex(weeksData: WeekType[], idx: number): DayType | null {
        for (const week of weeksData) {
            for (const day of week.days) {
                if (day.globalDayIndex === idx) return day;
            }
        }
        return null;
    }

    const navigateDay = (delta: number) => {
        setCurrentDayIndex(prev => {
            const next = prev + delta;
            if (next < 0 || (roadmap && next >= roadmap.totalDays)) return prev;
            const day = findDayByIndex(weeks, next);
            if (day) setViewWeekNumber(day.weekNumber);
            setViewMode('day');
            return next;
        });
    };

    const handleTaskToggle = async (taskId: string, completed: boolean) => {
        // Optimistic update
        setWeeks(prev => prev.map(week => ({
            ...week,
            days: week.days.map(day => ({
                ...day,
                tasks: day.tasks.map(task =>
                    task._id === taskId ? { ...task, completed } : task
                ),
            })),
        })));

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed }),
            });
            const progressRes = await fetch('/api/progress');
            const progressData = await progressRes.json();
            setProgress(progressData);
        } catch (error) {
            console.error('Failed to toggle task:', error);
            // Revert on error
            setWeeks(prev => prev.map(week => ({
                ...week,
                days: week.days.map(day => ({
                    ...day,
                    tasks: day.tasks.map(task =>
                        task._id === taskId ? { ...task, completed: !completed } : task
                    ),
                })),
            })));
        }
    };

    const handleDifficultyChange = async (taskId: string, difficulty: string) => {
        setWeeks(prev => prev.map(week => ({
            ...week,
            days: week.days.map(day => ({
                ...day,
                tasks: day.tasks.map(task =>
                    task._id === taskId ? { ...task, difficulty: difficulty as TaskType['difficulty'] } : task
                ),
            })),
        })));

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty }),
            });
        } catch (error) {
            console.error('Failed to update difficulty:', error);
        }
    };

    const handleWeekClick = (weekNumber: number) => {
        setViewWeekNumber(weekNumber);
        setViewMode('week');
    };

    const handleDayClick = (globalDayIndex: number) => {
        setCurrentDayIndex(globalDayIndex);
        const day = findDayByIndex(weeks, globalDayIndex);
        if (day) setViewWeekNumber(day.weekNumber);
        setViewMode('day');
    };

    const currentDay = useMemo(() => findDayByIndex(weeks, currentDayIndex), [weeks, currentDayIndex]);
    const currentViewWeek = useMemo(() => weeks.find(w => w.weekNumber === viewWeekNumber), [weeks, viewWeekNumber]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading roadmap...</p>
                </div>
            </div>
        );
    }

    if (!roadmap) return null;

    return (
        <div className="layout-3col">
            {/* LEFT SIDEBAR */}
            <Sidebar
                weeks={weeks}
                currentWeek={viewWeekNumber}
                progress={progress}
                roadmapTitle={roadmap.title}
                onWeekClick={handleWeekClick}
            />

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
                <Sidebar
                    weeks={weeks}
                    currentWeek={viewWeekNumber}
                    progress={progress}
                    roadmapTitle={roadmap.title}
                    onWeekClick={(wn) => { handleWeekClick(wn); setSidebarOpen(false); }}
                    isDrawer
                    onClose={() => setSidebarOpen(false)}
                />
            )}

            {/* CENTER MAIN PANEL */}
            <div className="main-panel">
                {/* Mobile topbar */}
                <div className="mobile-topbar" style={{ marginBottom: '12px' }}>
                    <button className="nav-btn" onClick={() => setSidebarOpen(true)} style={{ padding: '4px 8px' }}>
                        ☰
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        RoadForge
                    </span>
                    <button className="nav-btn" onClick={() => setRightPanelOpen(true)} style={{ padding: '4px 8px' }}>
                        📋
                    </button>
                </div>

                {/* Top bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '12px',
                }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            className={`nav-btn ${viewMode === 'day' ? 'active' : ''}`}
                            onClick={() => setViewMode('day')}
                        >
                            Day
                        </button>
                        <button
                            className={`nav-btn ${viewMode === 'week' ? 'active' : ''}`}
                            onClick={() => setViewMode('week')}
                        >
                            Week
                        </button>
                    </div>

                    {/* Right panel toggle (tablet) */}
                    <button
                        className="nav-btn"
                        onClick={() => setRightPanelOpen(!rightPanelOpen)}
                        style={{ fontSize: '12px' }}
                    >
                        📋 Context
                    </button>
                </div>

                {/* Completed banner */}
                {isCompleted && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px',
                        background: 'var(--success-bg)', border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: 'var(--success)', fontSize: '14px', fontWeight: 600,
                        marginBottom: '16px', textAlign: 'center',
                    }}>
                        🎉 Roadmap Completed!
                    </div>
                )}

                {/* DAY VIEW */}
                {viewMode === 'day' && currentDay && (
                    <div>
                        <DayNav
                            currentDayIndex={currentDayIndex}
                            totalDays={roadmap.totalDays}
                            weekNumber={currentDay.weekNumber}
                            dayNumber={currentDay.dayNumber}
                            isWeekend={currentDay.type === 'weekend'}
                            onPrev={() => navigateDay(-1)}
                            onNext={() => navigateDay(1)}
                        />

                        <DailyFocus
                            weekNumber={currentDay.weekNumber}
                            dayNumber={currentDay.dayNumber}
                        />

                        {/* Task grid */}
                        {currentDay.tasks.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '40px 20px',
                                color: 'var(--text-muted)',
                            }}>
                                <p style={{ fontSize: '14px', marginBottom: '4px' }}>No tasks for this day</p>
                                <p style={{ fontSize: '12px' }}>Navigate to another day</p>
                            </div>
                        ) : (
                            <>
                                <div className="task-grid">
                                    {currentDay.tasks.map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onToggle={handleTaskToggle}
                                            onDifficultyChange={handleDifficultyChange}
                                        />
                                    ))}
                                </div>

                                {/* Day stats */}
                                <div style={{
                                    marginTop: '16px', padding: '10px 14px',
                                    borderRadius: '8px', background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                }}>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                        <span>{currentDay.tasks.filter(t => t.completed).length}/{currentDay.tasks.length} done</span>
                                        <span style={{ color: 'var(--graph)' }}>Graph: {currentDay.tasks.filter(t => t.category === 'graph').length}</span>
                                        <span style={{ color: 'var(--revision)' }}>Revision: {currentDay.tasks.filter(t => t.category === 'revision').length}</span>
                                        {currentDay.tasks.some(t => t.category === 'theory') && (
                                            <span style={{ color: 'var(--theory)' }}>Theory: {currentDay.tasks.filter(t => t.category === 'theory').length}</span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* WEEK VIEW */}
                {viewMode === 'week' && currentViewWeek && (
                    <WeekGrid
                        days={currentViewWeek.days}
                        weekNumber={currentViewWeek.weekNumber}
                        weekTitle={currentViewWeek.title}
                        currentDayIndex={currentDayIndex}
                        onDayClick={handleDayClick}
                    />
                )}
            </div>

            {/* RIGHT CONTEXT PANEL */}
            <ContextPanel references={references} />

            {/* Drawer mode for right panel */}
            {rightPanelOpen && (
                <ContextPanel
                    references={references}
                    isDrawer
                    onClose={() => setRightPanelOpen(false)}
                />
            )}
        </div>
    );
}
