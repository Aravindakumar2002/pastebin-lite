import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Deterministic Time Testing
    const testNowHeader = req.headers.get('x-test-now-ms');
    const nowMs = testNowHeader && process.env.TEST_MODE === '1'
        ? parseInt(testNowHeader, 10)
        : Date.now();

    if (testNowHeader && isNaN(nowMs)) {
        return NextResponse.json({ error: "Invalid x-test-now-ms header" }, { status: 400 });
    }

    const result = await storage.getPaste(id, nowMs);

    if (!result) {
        return NextResponse.json({ error: "Paste not found or unavailable" }, { status: 404 });
    }

    const { paste, currentViews } = result;

    // Calculate remaining views
    let remaining_views: number | null = null;
    if (paste.max_views !== null) {
        remaining_views = paste.max_views - currentViews;
        if (remaining_views < 0) remaining_views = 0; // Should not happen if logic is correct
    }

    return NextResponse.json({
        content: paste.content,
        remaining_views,
        expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
    });
}
