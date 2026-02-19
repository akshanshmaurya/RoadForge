'use client';

import { useState, useEffect } from 'react';

export default function WeaknessReport() {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch('/api/llm/weakness');
                const data = await res.json();
                setReport(data.report || null);
            } catch {
                setReport(null);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading || !report) return null;

    return (
        <div style={{
            marginTop: '16px',
            borderRadius: '12px',
            background: 'rgba(249,115,22,0.06)',
            border: '1px solid rgba(249,115,22,0.2)',
            overflow: 'hidden',
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--revision)',
                    fontSize: '13px',
                    fontWeight: 600,
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚡</span> Weakness Report
                </span>
                <span style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    fontSize: '11px',
                }}>▼</span>
            </button>
            {isOpen && (
                <div style={{
                    padding: '0 14px 14px 14px',
                    fontSize: '12px',
                    lineHeight: '1.7',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                }}>
                    {report}
                </div>
            )}
        </div>
    );
}
