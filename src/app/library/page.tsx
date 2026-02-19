'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface RoadmapItem {
    _id: string;
    title: string;
    startDate: string;
    totalWeeks: number;
    totalDays: number;
    isActive: boolean;
    isArchived: boolean;
    createdAt: string;
}

export default function LibraryPage() {
    const router = useRouter();
    const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRoadmaps = async () => {
        try {
            const res = await fetch('/api/roadmap/list');
            const data = await res.json();
            setRoadmaps(data.roadmaps || []);
        } catch (error) {
            console.error('Failed to fetch roadmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const handleSetActive = async (roadmapId: string) => {
        setActionLoading(roadmapId);
        try {
            await fetch('/api/roadmap/set-active', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roadmapId }),
            });
            await fetchRoadmaps();
        } catch (error) {
            console.error('Failed to set active:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (roadmapId: string) => {
        if (!confirm('Delete this roadmap and all its data? This cannot be undone.')) return;
        setActionLoading(roadmapId);
        try {
            await fetch('/api/roadmap/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roadmapId }),
            });
            await fetchRoadmaps();
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setActionLoading(null);
        }
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
                    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'var(--text-muted)' }}>Loading roadmaps...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '40px',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.5px',
                    }}>Roadmap Library</h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        margin: 0,
                    }}>
                        {roadmaps.length} roadmap{roadmaps.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="nav-btn"
                        onClick={() => router.push('/dashboard')}
                        style={{ fontSize: '13px' }}
                    >
                        Dashboard
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => router.push('/upload')}
                        style={{
                            background: 'linear-gradient(135deg, var(--accent), var(--graph))',
                            color: 'white',
                            borderColor: 'transparent',
                            fontSize: '13px',
                        }}
                    >
                        + Upload New
                    </button>
                    <button
                        className="nav-btn"
                        onClick={() => signOut({ callbackUrl: '/auth' })}
                        style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {roadmaps.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    borderRadius: '16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                    }}>No roadmaps yet</h2>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        marginBottom: '24px',
                    }}>
                        Upload a markdown roadmap to get started
                    </p>
                    <button
                        className="nav-btn"
                        onClick={() => router.push('/upload')}
                        style={{
                            background: 'linear-gradient(135deg, var(--accent), var(--graph))',
                            color: 'white',
                            borderColor: 'transparent',
                            padding: '12px 24px',
                        }}
                    >
                        Upload Roadmap
                    </button>
                </div>
            )}

            {/* Roadmap cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {roadmaps.map(rm => (
                    <div
                        key={rm._id}
                        style={{
                            padding: '20px 24px',
                            borderRadius: '14px',
                            background: 'var(--bg-card)',
                            border: `1px solid ${rm.isActive ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                            boxShadow: rm.isActive ? '0 0 20px rgba(99,102,241,0.08)' : undefined,
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '6px',
                                }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        margin: 0,
                                    }}>{rm.title}</h3>
                                    {rm.isActive && (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: 'var(--accent-glow)',
                                            color: 'var(--accent)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>Active</span>
                                    )}
                                    {rm.isArchived && (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: 'rgba(100,116,139,0.15)',
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}>Archived</span>
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    fontSize: '13px',
                                    color: 'var(--text-muted)',
                                }}>
                                    <span>{rm.totalWeeks} weeks</span>
                                    <span>{rm.totalDays} days</span>
                                    <span>Started {new Date(rm.startDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {!rm.isActive && (
                                    <button
                                        className="nav-btn"
                                        onClick={() => handleSetActive(rm._id)}
                                        disabled={actionLoading === rm._id}
                                        style={{
                                            fontSize: '12px',
                                            padding: '6px 14px',
                                            opacity: actionLoading === rm._id ? 0.6 : 1,
                                        }}
                                    >
                                        Set Active
                                    </button>
                                )}
                                {rm.isActive && (
                                    <button
                                        className="nav-btn"
                                        onClick={() => router.push('/dashboard')}
                                        style={{
                                            fontSize: '12px',
                                            padding: '6px 14px',
                                            background: 'var(--accent-glow)',
                                            color: 'var(--accent)',
                                            borderColor: 'rgba(99,102,241,0.3)',
                                        }}
                                    >
                                        Open
                                    </button>
                                )}
                                <button
                                    className="nav-btn"
                                    onClick={() => handleDelete(rm._id)}
                                    disabled={actionLoading === rm._id}
                                    style={{
                                        fontSize: '12px',
                                        padding: '6px 14px',
                                        color: '#ef4444',
                                        borderColor: 'rgba(239,68,68,0.3)',
                                        opacity: actionLoading === rm._id ? 0.6 : 1,
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
