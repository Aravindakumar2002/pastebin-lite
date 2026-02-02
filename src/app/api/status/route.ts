import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    const isRedis = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    const isVercel = !!process.env.VERCEL;

    return NextResponse.json({
        status: "ok",
        persistence: isRedis ? "redis" : (isVercel ? "memory" : "file"),
        isProduction: process.env.NODE_ENV === 'production',
        isVercel
    });
}
