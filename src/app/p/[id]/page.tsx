import { storage } from '@/lib/storage';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

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
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center text-sm text-gray-400">
                    <div>
                        <span className="font-medium text-purple-400">Paste ID:</span> {paste.id}
                    </div>
                    <div>
                        {paste.expires_at && (
                            <span className="ml-4">
                                Expires: {new Date(paste.expires_at).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-0 overflow-auto max-h-[80vh]">
                    <pre className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-200">
                        {paste.content}
                    </pre>
                </div>
                <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 text-center">
                    <a href="/" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                        Create New Paste
                    </a>
                </div>
            </div>
        </div>
    );
}
