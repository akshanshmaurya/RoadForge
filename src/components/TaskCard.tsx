'use client';

import { useState } from 'react';

interface TaskType {
    _id: string;
    title: string;
    category: 'graph' | 'revision' | 'theory';
    link: string;
    completed: boolean;
    difficulty?: 'easy' | 'medium' | 'hard' | null;
    completedAt?: string | null;
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

    const handleExplainLearning = async () => {
        if (postSolve) { setShowPostSolve(!showPostSolve); return; }
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

    const difficulties = ['easy', 'medium', 'hard'] as const;

    return (
        <div className={`task-card ${task.completed ? 'completed' : ''}`}>
            {/* Row 1: Checkbox + Title + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task._id, !task.completed)}
                />
                <span className="task-title" style={{
                    fontSize: '13px', fontWeight: 500, flex: 1,
                    color: task.completed ? 'var(--completed-text)' : 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                }}>
                    {task.title}
                </span>
                <span className={`badge badge-${task.category}`}>{task.category}</span>
            </div>

            {/* Row 2: Actions bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginTop: '8px', paddingLeft: '30px',
            }}>
                {/* Difficulty */}
                <div style={{ display: 'flex', gap: '3px' }}>
                    {difficulties.map(d => (
                        <button
                            key={d}
                            className={`diff-btn ${task.difficulty === d ? `active-${d}` : ''}`}
                            onClick={() => onDifficultyChange(task._id, d)}
                            style={{ color: task.difficulty === d ? undefined : 'var(--text-muted)' }}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1 }} />

                {/* Explain Learning */}
                {task.completed && (
                    <button className="link-btn" onClick={handleExplainLearning}
                        style={{ color: 'var(--theory)', borderColor: 'var(--theory-border)' }}>
                        {postSolveLoading ? '...' : '💡 Explain'}
                    </button>
                )}

                {/* Link */}
                {task.link && (
                    <a href={task.link} target="_blank" rel="noopener noreferrer" className="link-btn">
                        ↗ Link
                    </a>
                )}

                {/* Completed timestamp */}
                {task.completedAt && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(task.completedAt).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* Post-solve insight */}
            {showPostSolve && postSolve && (
                <div style={{
                    marginTop: '8px', marginLeft: '30px',
                    padding: '10px 12px', borderRadius: '8px',
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.12)',
                    fontSize: '12px', lineHeight: '1.6',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                }}>
                    {postSolve}
                </div>
            )}
        </div>
    );
}
