import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    const isHealthy = await storage.isReady();

    if (!isHealthy) {
        return NextResponse.json({ ok: false }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
}
