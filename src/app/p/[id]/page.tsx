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
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/" style={{ color: '#0066cc', textDecoration: 'none' }}>← Back</a>
                <h1 style={{ fontSize: '24px' }}>Paste #{paste.id}</h1>
            </div>

            <div className="card">
                <div style={{ marginBottom: '15px', fontSize: '13px', color: '#666' }}>
                    <div>Created: {new Date(paste.created_at).toLocaleString()}</div>
                    {paste.expires_at && (
                        <div>Expires: {new Date(paste.expires_at).toLocaleString()}</div>
                    )}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <SimpleCopyButton content={paste.content} />
                </div>

                <div style={{
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '15px',
                    maxHeight: '500px',
                    overflow: 'auto'
                }}>
                    <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                    }}>
                        {paste.content}
                    </pre>
                </div>
            </div>
        </div>
    );
}
