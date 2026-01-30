import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { z } from 'zod';

const createPasteSchema = z.object({
    content: z.string().min(1, "Content cannot be empty"),
    ttl_seconds: z.number().int().min(1).optional(),
    max_views: z.number().int().min(1).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = createPasteSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.format() },
                { status: 400 }
            );
        }

        const { content, ttl_seconds, max_views } = result.data;

        const id = await storage.createPaste({
            content,
            ttl_seconds,
            max_views,
        });

        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const url = `${protocol}://${host}/p/${id}`;

        return NextResponse.json({ id, url }, { status: 201 });
    } catch (error) {
        console.error("Create paste error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            {
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
