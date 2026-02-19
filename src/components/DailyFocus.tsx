'use client';

import { useState, useEffect } from 'react';

interface DailyFocusProps {
    weekNumber: number;
    dayNumber: number;
}

export default function DailyFocus({ weekNumber, dayNumber }: DailyFocusProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/llm/daily?weekNumber=${weekNumber}&dayNumber=${dayNumber}`
                );
                const data = await res.json();
                setInsight(data.insight || null);
            } catch {
                setInsight(null);
            } finally {
                setLoading(false);
            }
        };

        if (weekNumber && dayNumber) fetchInsight();
    }, [weekNumber, dayNumber]);

    if (loading) {
        return (
            <div className="focus-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px' }}>🎯</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>Today&apos;s Focus</span>
                </div>
                <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            </div>
        );
    }

    if (!insight) return null;

    return (
        <div className="focus-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>🎯</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>Today&apos;s Focus</span>
            </div>
            <div style={{
                fontSize: '12px', lineHeight: '1.7',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
            }}>
                {insight}
            </div>
        </div>
    );
}
