'use client';

import { useState } from 'react';

interface TaskType {
    _id: string;
    title: string;
    category: 'graph' | 'revision' | 'theory';
    link: string;
    completed: boolean;
    difficulty?: 'easy' | 'medium' | 'hard' | null;
}

interface TaskCardProps {
    task: TaskType;
    onToggle: (taskId: string, completed: boolean) => void;
    onDifficultyChange: (taskId: string, difficulty: string) => void;
}

export default function TaskCard({ task, onToggle, onDifficultyChange }: TaskCardProps) {
    const [postSolve, setPostSolve] = useState<string | null>(null);
    const [postSolveLoading, setPostSolveLoading] = useState(false);
    const [showPostSolve, setShowPostSolve] = useState(false);

    const categoryColors: Record<string, string> = {
        graph: 'var(--graph)',
        revision: 'var(--revision)',
        theory: 'var(--theory)',
    };

    const handleExplainLearning = async () => {
        if (postSolve) {
            setShowPostSolve(!showPostSolve);
            return;
        }

        setPostSolveLoading(true);
        setShowPostSolve(true);
        try {
            const res = await fetch('/api/llm/postsolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task._id }),
            });
            const data = await res.json();
            setPostSolve(data.insight || 'No insight available');
        } catch {
            setPostSolve('Failed to load insight');
        } finally {
            setPostSolveLoading(false);
        }
    };

    const difficultyColors: Record<string, string> = {
        easy: '#22c55e',
        medium: '#eab308',
        hard: '#ef4444',
    };

    return (
        <div
            className="task-card"
            style={{
                padding: '16px 18px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                opacity: task.completed ? 0.6 : 1,
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
            }}>
                {/* Checkbox */}
                <div style={{ paddingTop: '2px' }}>
                    <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={task.completed}
                        onChange={() => onToggle(task._id, !task.completed)}
                    />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '4px',
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            flex: 1,
                        }}>
                            {task.title}
                        </span>
                        <span className={`badge badge-${task.category}`} style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: `${categoryColors[task.category]}15`,
                            color: categoryColors[task.category],
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            {task.category}
                        </span>
                    </div>

                    {/* Bottom row: difficulty + actions */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '8px',
                    }}>
                        {/* Difficulty selector */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['easy', 'medium', 'hard'].map(diff => (
                                <button
                                    key={diff}
                                    onClick={() => onDifficultyChange(task._id, diff)}
                                    style={{
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        border: `1px solid ${task.difficulty === diff ? difficultyColors[diff] : 'var(--border)'}`,
                                        background: task.difficulty === diff ? `${difficultyColors[diff]}15` : 'transparent',
                                        color: task.difficulty === diff ? difficultyColors[diff] : 'var(--text-muted)',
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>

                        {/* Spacer */}
                        <div style={{ flex: 1 }} />

                        {/* Explain Learning button (only for completed tasks) */}
                        {task.completed && (
                            <button
                                onClick={handleExplainLearning}
                                style={{
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(139,92,246,0.3)',
                                    background: showPostSolve ? 'rgba(139,92,246,0.1)' : 'transparent',
                                    color: 'var(--theory)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {postSolveLoading ? 'Loading...' : '💡 Explain Learning'}
                            </button>
                        )}

                        {/* Link */}
                        {task.link && (
                            <a
                                href={task.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    textDecoration: 'none',
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                ↗ Link
                            </a>
                        )}
                    </div>

                    {/* Post-solve insight */}
                    {showPostSolve && postSolve && (
                        <div style={{
                            marginTop: '12px',
                            padding: '14px 16px',
                            borderRadius: '10px',
                            background: 'rgba(139,92,246,0.06)',
                            border: '1px solid rgba(139,92,246,0.15)',
                            fontSize: '12px',
                            lineHeight: '1.7',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'pre-wrap',
                        }}>
                            {postSolve}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
