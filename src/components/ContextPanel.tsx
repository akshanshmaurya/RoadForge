'use client';

import { useState } from 'react';
import ReferenceSection from './ReferenceSection';
import WeaknessReport from './WeaknessReport';

interface ReferenceItem {
    _id: string;
    sectionTitle: string;
    contentMarkdown: string;
}

interface ContextPanelProps {
    references: ReferenceItem[];
    isDrawer?: boolean;
    onClose?: () => void;
}

export default function ContextPanel({ references, isDrawer, onClose }: ContextPanelProps) {
    const [activeTab, setActiveTab] = useState<'references' | 'insights'>('references');

    return (
        <>
            {isDrawer && <div className="drawer-overlay" onClick={onClose} />}
            <div className={`right-panel ${isDrawer ? 'drawer-open' : ''}`}>
                {/* Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                            className={`panel-tab ${activeTab === 'references' ? 'active' : ''}`}
                            onClick={() => setActiveTab('references')}
                        >
                            📋 References
                        </button>
                        <button
                            className={`panel-tab ${activeTab === 'insights' ? 'active' : ''}`}
                            onClick={() => setActiveTab('insights')}
                        >
                            ⚡ Insights
                        </button>
                    </div>
                    {isDrawer && (
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '4px',
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                    {activeTab === 'references' && (
                        <div>
                            {references.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 16px',
                                    color: 'var(--text-muted)',
                                    fontSize: '13px',
                                }}>
                                    No references in this roadmap
                                </div>
                            ) : (
                                <ReferenceSection references={references} />
                            )}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div>
                            <WeaknessReport />
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                lineHeight: '1.6',
                            }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    💡 How insights work
                                </div>
                                <p style={{ margin: 0 }}>
                                    Daily Focus shows per-day guidance. Weakness Report analyzes your performance weekly.
                                    Both use cached Gemini responses to minimize API calls.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
