'use client';

interface TaskCardProps {
    task: {
        _id: string;
        title: string;
        category: 'graph' | 'revision' | 'theory';
        link: string;
        completed: boolean;
    };
    onToggle: (taskId: string, completed: boolean) => void;
}

export default function TaskCard({ task, onToggle }: TaskCardProps) {
    const badgeClass = `badge badge-${task.category}`;

    return (
        <div className={`task-card ${task.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                className="task-checkbox"
                checked={task.completed}
                onChange={() => onToggle(task._id, !task.completed)}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="task-title" style={{ fontSize: '15px', fontWeight: 500 }}>
                        {task.title}
                    </span>
                    <span className={badgeClass}>{task.category}</span>
                </div>
            </div>
            {task.link && (
                <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-btn"
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Open
                </a>
            )}
        </div>
    );
}
