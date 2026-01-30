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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent glow-text">
            Pastebin Lite
          </h1>
          <p className="text-gray-400 text-lg">
            Share code, text, and secrets securely with self-destructing links.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75"></div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Content Area */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Paste Content
              </label>
              <div className="relative group">
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                  className="w-full bg-gray-950/50 input-ring text-gray-100 rounded-xl p-4 font-mono text-sm resize-y placeholder-gray-600 shadow-inner"
                  placeholder="// Paste your code or text here..."
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="ttl" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Auto-Expire (Seconds)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="ttl"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    className="w-full bg-gray-950/50 input-ring text-gray-100 rounded-xl p-3 shadow-inner"
                    placeholder="e.g., 3600 (1 hour)"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-xs pointer-events-none">
                    SEC
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Leave empty to never expire by time.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="maxViews" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  View Limit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="maxViews"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    className="w-full bg-gray-950/50 input-ring text-gray-100 rounded-xl p-3 shadow-inner"
                    placeholder="e.g., 5"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-xs pointer-events-none">
                    VIEWS
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Paste is deleted after N views.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-sm flex items-center shadow-lg animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading || !content}
              className="w-full group relative py-4 px-6 rounded-xl text-white font-bold text-lg overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:opacity-90 transition-opacity"></div>
              <div className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Secure Link...
                  </>
                ) : (
                  <>
                    Generate Secure Paste
                    <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-gray-600 text-sm">
          Everything you paste is stored securely and deleted after expiration.
        </p>
      </div>
    </div>
  );
}
