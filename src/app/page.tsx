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
    <div className="flex h-screen bg-[#f3f4f6]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">PastePro</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="sidebar-link active">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Create Paste
          </a>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Features</p>
          </div>
          <div className="sidebar-link cursor-not-allowed opacity-50">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            My Pastes
          </div>
          <div className="sidebar-link cursor-not-allowed opacity-50">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            History
          </div>
        </nav>

        <div className="p-4">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold mr-3">
                Pro
              </div>
              <div>
                <p className="text-xs font-medium text-white">PastePro Premium</p>
                <p className="text-[10px] text-slate-400">Unlimited Access</p>
              </div>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 w-3/4 h-full"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="relative w-96 hidden lg:block">
              <input
                type="text"
                placeholder="Search pastes..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center space-x-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-blue-500/20 transition-all active:scale-95">
                Upgrade to Pro
              </button>
              <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Form Section (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">New Paste</h2>
                <p className="text-gray-500 text-sm">Create and share secure text instantly.</p>
              </div>

              <div className="card-pro p-6 hover:shadow-lg transition-shadow duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Paste Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={15}
                      className="input-pro p-4 font-mono text-sm resize-y"
                      placeholder="// Enter your code or text here..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading || !content}
                      className="btn-primary px-8 py-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Create Paste'}
                      {!loading && <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar/Options Section (Right 1 col) */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-1">Settings</h2>
                <p className="text-gray-500 text-xs">Configure your paste options.</p>
              </div>

              <div className="card-pro p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Auto-Expire (TTL)
                  </label>
                  <input
                    type="number"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    className="input-pro p-3"
                    placeholder="Seconds (e.g. 3600)"
                  />
                  <p className="text-[11px] text-gray-400">Time until the paste is automatically deleted.</p>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Limit
                  </label>
                  <input
                    type="number"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    className="input-pro p-3"
                    placeholder="Number of views"
                  />
                  <p className="text-[11px] text-gray-400">Maximum times the paste can be viewed.</p>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2">Go Premium</h3>
                <p className="text-indigo-100 text-sm mb-4">Get encrypted storage, custom URLs, and analytics.</p>
                <button className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg text-sm hover:bg-opacity-90 transition-colors">
                  View Plans
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
