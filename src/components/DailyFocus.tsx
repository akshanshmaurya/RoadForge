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

        if (weekNumber && dayNumber) {
            fetchInsight();
        }
    }, [weekNumber, dayNumber]);

    if (loading) {
        return (
            <div style={{
                padding: '20px 24px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.06))',
                border: '1px solid rgba(99,102,241,0.2)',
                marginBottom: '24px',
                maxWidth: '720px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                }}>
                    <span style={{ fontSize: '16px' }}>🎯</span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        letterSpacing: '-0.3px',
                    }}>Today&apos;s Focus</span>
                </div>
                <div style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                }}>
                    Generating insight...
                </div>
            </div>
        );
    }

    if (!insight) return null;

    return (
        <div style={{
            padding: '20px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.06))',
            border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: '24px',
            maxWidth: '720px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
            }}>
                <span style={{ fontSize: '16px' }}>🎯</span>
                <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    letterSpacing: '-0.3px',
                }}>Today&apos;s Focus</span>
            </div>
            <div style={{
                fontSize: '13px',
                lineHeight: '1.7',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
            }}>
                {insight}
            </div>
        </div>
    );
}
