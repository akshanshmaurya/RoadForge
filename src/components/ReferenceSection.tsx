'use client';

import { useState } from 'react';

interface ReferenceItem {
    _id: string;
    sectionTitle: string;
    contentMarkdown: string;
}

interface ReferenceSectionProps {
    references: ReferenceItem[];
}

export default function ReferenceSection({ references }: ReferenceSectionProps) {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (!references || references.length === 0) return null;

    return (
        <div>
            <div style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginBottom: '8px',
                padding: '0 4px'
            }}>
                Reference
            </div>
            {references.map((ref) => (
                <div key={ref._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <button
                        className="ref-toggle"
                        onClick={() => toggleSection(ref._id)}
                    >
                        <span>{ref.sectionTitle}</span>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{
                                transform: openSections.has(ref._id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    {openSections.has(ref._id) && (
                        <div className="ref-content">
                            {ref.contentMarkdown}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
