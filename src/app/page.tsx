"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState<number | ''>('');
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ persistence: string; isVercel: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => setStatus({ persistence: 'unknown', isVercel: false }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create paste');
      }

      const data = await res.json();
      router.push(`/p/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!status) return { label: 'Checking storage...', color: '#666' };
    if (status.persistence === 'redis') return { label: 'Connected to Vercel KV (Persistent)', color: '#10b981' };
    if (status.persistence === 'memory' && status.isVercel) return { label: 'Ephemeral Memory Mode (Fix Required)', color: '#f59e0b' };
    return { label: 'Local Storage Mode (Persistent)', color: '#6366f1' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="container">
      <h1>PasteBin Lite</h1>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        padding: '0.4rem 1rem',
        borderRadius: '99px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginBottom: '2.5rem',
        border: '1px solid var(--card-border)',
        color: status?.persistence === 'memory' ? '#f59e0b' : 'var(--text-secondary)',
        fontWeight: 500
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: statusInfo.color,
          boxShadow: `0 0 10px ${statusInfo.color}`
        }} />
        {statusInfo.label}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              placeholder="Paste your code or text here..."
            />
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div>
              <label>Expire after (seconds)</label>
              <input
                type="number"
                value={ttl}
                onChange={(e) => setTtl(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                placeholder="Never expire"
              />
            </div>

            <div>
              <label>Max views</label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                placeholder="Unlimited views"
              />
            </div>
          </div>

          {error && (
            <div className="error">
              <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading || !content}>
            {loading ? 'Creating...' : 'Create Secure Paste'}
          </button>
        </form>
      </div>
    </div>
  );
}
