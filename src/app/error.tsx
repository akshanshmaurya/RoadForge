'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
        }}>
            <div style={{
                maxWidth: '400px',
                textAlign: 'center',
            }}>
                <div style={{
                    width: '56px', height: '56px',
                    borderRadius: '14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px',
                    margin: '0 auto 16px auto',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>⚠️</div>

                <h2 style={{
                    fontSize: '20px', fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: '0 0 8px 0',
                }}>Something went wrong</h2>

                <p style={{
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    margin: '0 0 24px 0',
                    lineHeight: '1.5',
                }}>
                    {process.env.NODE_ENV === 'development'
                        ? error.message
                        : 'An unexpected error occurred. Please try again.'}
                </p>

                <button
                    onClick={reset}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--accent), var(--graph))',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
