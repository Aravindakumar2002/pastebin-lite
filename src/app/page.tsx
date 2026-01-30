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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-6">
          Pastebin Lite
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              className="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-md focus:ring-purple-500 focus:border-purple-500 p-3 font-mono text-sm resize-y placeholder-gray-600"
              placeholder="Paste your text here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ttl" className="block text-sm font-medium text-gray-400 mb-2">
                TTL (Seconds) <span className="text-gray-600 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                id="ttl"
                value={ttl}
                onChange={(e) => setTtl(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                className="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-md focus:ring-purple-500 focus:border-purple-500 p-2"
                placeholder="e.g. 60"
              />
            </div>

            <div>
              <label htmlFor="maxViews" className="block text-sm font-medium text-gray-400 mb-2">
                Max Views <span className="text-gray-600 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                id="maxViews"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
                min="1"
                className="w-full bg-gray-800 border-gray-700 text-gray-100 rounded-md focus:ring-purple-500 focus:border-purple-500 p-2"
                placeholder="e.g. 5"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-900/50 border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !content}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>
      </div>
    </div>
  );
}
