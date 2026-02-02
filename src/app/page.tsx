"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState<number | ''>('');
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container">
      <h1>PasteBin Lite</h1>

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
