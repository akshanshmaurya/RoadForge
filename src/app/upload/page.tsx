'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [startDate, setStartDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.md')) {
            setFile(droppedFile);
            setError('');
        } else {
            setError('Please drop a .md file');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('startDate', startDate);

            const res = await fetch('/api/parse-md', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
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
            <div style={{ maxWidth: '560px', width: '100%' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
                        fontSize: '32px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.5px',
                    }}>
                        RoadForge
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: 'var(--text-muted)',
                        margin: 0,
                    }}>
                        Upload your markdown roadmap and start executing.
                    </p>
                </div>

                {/* Dropzone */}
                <div
                    className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".md"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <div style={{ marginBottom: '12px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    {file ? (
                        <div>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--success)', margin: '0 0 4px 0' }}>
                                {file.name}
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                                {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                                Drop your .md file here
                            </p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                                or click to browse
                            </p>
                        </div>
                    )}
                </div>

                {/* Start Date */}
                <div style={{ marginTop: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                    }}>
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
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
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                    }}>
                        The day you want to start. Today&apos;s tasks will be calculated from this date.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        marginTop: '16px',
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

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    style={{
                        width: '100%',
                        marginTop: '20px',
                        padding: '14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: file ? 'linear-gradient(135deg, var(--accent), var(--graph))' : 'var(--bg-card)',
                        color: file ? 'white' : 'var(--text-muted)',
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: file ? 'pointer' : 'not-allowed',
                        opacity: uploading ? 0.7 : 1,
                        transition: 'all 0.15s ease',
                    }}
                >
                    {uploading ? '🤖 AI Parsing & Saving...' : 'Upload & Start'}
                </button>

                {/* Back to library */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <a
                        href="/library"
                        style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            textDecoration: 'none',
                        }}
                    >
                        ← Back to Library
                    </a>
                </div>
            </div>
        </div>
    );
}
