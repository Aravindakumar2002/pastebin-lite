import { storage } from '@/lib/storage';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ViewPaste({ params }: Props) {
    const { id } = await params;

    // Get request headers for deterministic testing
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-4xl space-y-6">

                {/* Header / Nav */}
                <div className="flex justify-between items-center px-2">
                    <a href="/" className="group flex items-center text-gray-400 hover:text-white transition-colors">
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 mr-3 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        <span className="font-medium">Create New</span>
                    </a>

                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Paste #{paste.id}
                    </h1>
                </div>

                {/* Main Card */}
                <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                    {/* Toolbar */}
                    <div className="bg-white/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(paste.created_at).toLocaleString()}
                            </div>

                            {paste.expires_at && (
                                <div className="flex items-center text-orange-400/80">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Expires: {new Date(paste.expires_at).toLocaleString()}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center">
                            <CopyButton content={paste.content} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 overflow-auto bg-[#0d1117] custom-scrollbar">
                        <pre className="p-6 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap break-words selection:bg-indigo-500/30 selection:text-indigo-200">
                            {paste.content}
                        </pre>
                    </div>
                </div>

            </div>
        </div>
    );
}
