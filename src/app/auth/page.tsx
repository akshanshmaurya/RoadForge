'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Registration failed');
                    setLoading(false);
                    return;
                }
                // Auto-login after signup
            }

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
        }}>
            <div style={{ maxWidth: '420px', width: '100%' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, var(--accent), var(--graph))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '26px',
                        fontWeight: 800,
                        color: 'white',
                        margin: '0 auto 16px auto',
                    }}>R</div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.5px',
                    }}>
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        margin: 0,
                    }}>
                        {mode === 'login'
                            ? 'Sign in to continue your roadmap'
                            : 'Start executing your learning roadmap'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            marginBottom: '6px',
                        }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            marginBottom: '6px',
                        }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                            minLength={mode === 'signup' ? 6 : undefined}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            fontSize: '14px',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--accent), var(--graph))',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'opacity 0.15s ease',
                        }}
                    >
                        {loading
                            ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                            : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                {/* Toggle */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                }}>
                    {mode === 'login' ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <button
                                onClick={() => { setMode('signup'); setError(''); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                }}
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => { setMode('login'); setError(''); }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                }}
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
