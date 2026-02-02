import { storage } from '@/lib/storage';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import SimpleCopyButton from '@/components/SimpleCopyButton';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ViewPaste({ params }: Props) {
    const { id } = await params;

    const headersList = await headers();
    const testNowHeader = headersList.get('x-test-now-ms');
    const nowMs = testNowHeader && process.env.TEST_MODE === '1'
        ? parseInt(testNowHeader, 10)
        : Date.now();

    const result = await storage.getPaste(id, nowMs);

    if (!result) {
        notFound();
    }

    const { paste } = result;

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>← New Paste</a>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Paste #{paste.id}</h1>
            </header>

            <div className="card">
                <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem' }}>
                    <div>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Created:</span> {new Date(paste.created_at).toLocaleString()}
                    </div>
                    {paste.expires_at && (
                        <div>
                            <span style={{ fontWeight: 600, color: 'var(--error)' }}>Expires:</span> {new Date(paste.expires_at).toLocaleString()}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <SimpleCopyButton content={paste.content} />
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    maxHeight: '600px',
                    overflow: 'auto'
                }}>
                    <pre style={{
                        margin: 0,
                        fontFamily: '"Geist Mono", monospace',
                        fontSize: '0.9rem',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        color: '#d1d5db'
                    }}>
                        {paste.content}
                    </pre>
                </div>
            </div>
        </div>
    );
}
