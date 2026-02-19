'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
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

    // Calculate today's day index
    const calculateTodayIndex = useCallback((startDate: string, totalDays: number) => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const diffMs = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 0;

        // Map calendar days to roadmap days (6 entries per week: 5 weekdays + 1 weekend)
        const calWeek = Math.floor(diffDays / 7);
        const calDay = diffDays % 7;
        let idx: number;

        if (calDay <= 4) {
            idx = calWeek * 6 + calDay;
        } else {
            idx = calWeek * 6 + 5;
        }

        if (idx >= totalDays) {
            setIsCompleted(true);
            return totalDays - 1;
        }

        return idx;
    }, []);

    // Fetch roadmap data
    const fetchData = useCallback(async () => {
        try {
            const [roadmapRes, progressRes] = await Promise.all([
                fetch('/api/roadmap'),
                fetch('/api/progress'),
            ]);

            const roadmapData = await roadmapRes.json();
            const progressData = await progressRes.json();

            if (!roadmapData.roadmap) {
                router.push('/upload');
                return;
            }

            setRoadmap(roadmapData.roadmap);
            setWeeks(roadmapData.weeks || []);
            setReferences(roadmapData.references || []);
            setProgress(progressData);

            const todayIdx = calculateTodayIndex(
                roadmapData.roadmap.startDate,
                roadmapData.roadmap.totalDays
            );
            setCurrentDayIndex(todayIdx);

            // Set view week to match today
            const todayDay = findDayByIndex(roadmapData.weeks, todayIdx);
            if (todayDay) {
                setViewWeekNumber(todayDay.weekNumber);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, [router, calculateTodayIndex]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateDay(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateDay(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    // Find day by global index
    function findDayByIndex(weeksData: WeekType[], idx: number): DayType | null {
        for (const week of weeksData) {
            for (const day of week.days) {
                if (day.globalDayIndex === idx) return day;
            }
        }
        return null;
    }

    // Navigate days
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

    // Toggle task completion
    const handleTaskToggle = async (taskId: string, completed: boolean) => {
        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed }),
            });

            // Update locally
            setWeeks(prev => prev.map(week => ({
                ...week,
                days: week.days.map(day => ({
                    ...day,
                    tasks: day.tasks.map(task =>
                        task._id === taskId ? { ...task, completed } : task
                    ),
                })),
            })));

            // Refresh progress
            const progressRes = await fetch('/api/progress');
            const progressData = await progressRes.json();
            setProgress(progressData);
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    // Update task difficulty
    const handleDifficultyChange = async (taskId: string, difficulty: string) => {
        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty }),
            });

            // Update locally
            setWeeks(prev => prev.map(week => ({
                ...week,
                days: week.days.map(day => ({
                    ...day,
                    tasks: day.tasks.map(task =>
                        task._id === taskId ? { ...task, difficulty: difficulty as TaskType['difficulty'] } : task
                    ),
                })),
            })));
        } catch (error) {
            console.error('Failed to update difficulty:', error);
        }
    };

    // Handle week click from sidebar
    const handleWeekClick = (weekNumber: number) => {
        setViewWeekNumber(weekNumber);
        setViewMode('week');
    };

    // Handle day click from week grid
    const handleDayClick = (globalDayIndex: number) => {
        setCurrentDayIndex(globalDayIndex);
        const day = findDayByIndex(weeks, globalDayIndex);
        if (day) setViewWeekNumber(day.weekNumber);
        setViewMode('day');
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--accent)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px auto',
                    }} />
                    <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
                    <p style={{ color: 'var(--text-muted)' }}>Loading roadmap...</p>
                </div>
            </div>
        );
    }

    if (!roadmap) return null;

    const currentDay = findDayByIndex(weeks, currentDayIndex);
    const currentViewWeek = weeks.find(w => w.weekNumber === viewWeekNumber);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sidebar
                weeks={weeks}
                currentWeek={viewWeekNumber}
                currentDayIndex={currentDayIndex}
                progress={progress}
                references={references}
                onWeekClick={handleWeekClick}
                onDayClick={handleDayClick}
            />

            {/* Main content */}
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '32px 40px',
                maxWidth: 'calc(100vw - 280px)',
            }}>
                {/* Top bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                }}>
                    <div style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                    }}>
                        {roadmap.title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="nav-btn"
                            onClick={() => setViewMode('day')}
                            style={{
                                background: viewMode === 'day' ? 'var(--accent-glow)' : undefined,
                                color: viewMode === 'day' ? 'var(--accent)' : undefined,
                                borderColor: viewMode === 'day' ? 'rgba(99,102,241,0.3)' : undefined,
                            }}
                        >
                            Day View
                        </button>
                        <button
                            className="nav-btn"
                            onClick={() => setViewMode('week')}
                            style={{
                                background: viewMode === 'week' ? 'var(--accent-glow)' : undefined,
                                color: viewMode === 'week' ? 'var(--accent)' : undefined,
                                borderColor: viewMode === 'week' ? 'rgba(99,102,241,0.3)' : undefined,
                            }}
                        >
                            Week View
                        </button>
                        <button
                            className="nav-btn"
                            onClick={() => signOut({ callbackUrl: '/auth' })}
                            style={{ color: 'var(--text-muted)', fontSize: '12px' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Completed banner */}
                {isCompleted && (
                    <div style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: 'var(--success-bg)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: 'var(--success)',
                        fontSize: '15px',
                        fontWeight: 600,
                        marginBottom: '24px',
                        textAlign: 'center',
                    }}>
                        🎉 Roadmap Completed! You&apos;ve reached the end of the schedule.
                    </div>
                )}

                {/* Day View */}
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

                        {/* Daily Focus (LLM) */}
                        <DailyFocus
                            weekNumber={currentDay.weekNumber}
                            dayNumber={currentDay.dayNumber}
                        />

                        {/* Task list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '720px' }}>
                            {currentDay.tasks.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: 'var(--text-muted)',
                                }}>
                                    <p style={{ fontSize: '16px', marginBottom: '4px' }}>No tasks for this day</p>
                                    <p style={{ fontSize: '13px' }}>Navigate to another day</p>
                                </div>
                            ) : (
                                currentDay.tasks.map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onToggle={handleTaskToggle}
                                        onDifficultyChange={handleDifficultyChange}
                                    />
                                ))
                            )}
                        </div>

                        {/* Day stats */}
                        {currentDay.tasks.length > 0 && (
                            <div style={{
                                marginTop: '24px',
                                padding: '16px 20px',
                                borderRadius: '12px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                maxWidth: '720px',
                            }}>
                                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    <span>
                                        {currentDay.tasks.filter(t => t.completed).length}/{currentDay.tasks.length} completed
                                    </span>
                                    <span>
                                        Graph: {currentDay.tasks.filter(t => t.category === 'graph').length}
                                    </span>
                                    <span>
                                        Revision: {currentDay.tasks.filter(t => t.category === 'revision').length}
                                    </span>
                                    {currentDay.tasks.some(t => t.category === 'theory') && (
                                        <span>
                                            Theory: {currentDay.tasks.filter(t => t.category === 'theory').length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Week View */}
                {viewMode === 'week' && currentViewWeek && (
                    <WeekGrid
                        days={currentViewWeek.days}
                        weekNumber={currentViewWeek.weekNumber}
                        weekTitle={currentViewWeek.title}
                        currentDayIndex={currentDayIndex}
                        onDayClick={handleDayClick}
                    />
                )}
            </main>
        </div>
    );
}
