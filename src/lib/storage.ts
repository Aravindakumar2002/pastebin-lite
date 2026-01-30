import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export interface Paste {
    id: string;
    content: string;
    created_at: number; // ms since epoch
    expires_at: number | null; // ms since epoch, null if no TTL
    max_views: number | null; // null if unlimited
}

// Separate type for what we return to the client (API)
export interface PublicPaste {
    content: string;
    remaining_views: number | null;
    expires_at: string | null; // ISO string
}

export interface CreatePasteParams {
    content: string;
    ttl_seconds?: number;
    max_views?: number;
}

export interface Persistence {
    createPaste(params: CreatePasteParams): Promise<string>;
    getPaste(id: string, nowMs: number): Promise<{ paste: Paste; currentViews: number } | null>;
    isReady(): Promise<boolean>;
}

import { promises as fs } from 'fs';
import path from 'path';

// ... (existing imports)

// File-System Implementation for Local Dev (Persistent)
class FileStore implements Persistence {
    private filePath: string;
    private initialized: Promise<void>;

    constructor() {
        this.filePath = path.join(process.cwd(), '.local-storage.json');
        this.initialized = this.init();
    }

    private async init() {
        try {
            await fs.access(this.filePath);
        } catch {
            await fs.writeFile(this.filePath, JSON.stringify({ pastes: {}, views: {} }), 'utf-8');
        }
    }

    private async readData(): Promise<{ pastes: Record<string, Paste>; views: Record<string, number> }> {
        await this.initialized;
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return { pastes: {}, views: {} };
        }
    }

    private async writeData(data: { pastes: Record<string, Paste>; views: Record<string, number> }): Promise<void> {
        await this.initialized;
        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    async createPaste(params: CreatePasteParams): Promise<string> {
        const id = nanoid(10);
        const now = Date.now();
        const expires_at = params.ttl_seconds ? now + params.ttl_seconds * 1000 : null;

        const paste: Paste = {
            id,
            content: params.content,
            created_at: now,
            expires_at,
            max_views: params.max_views ?? null,
        };

        const data = await this.readData();
        data.pastes[id] = paste;
        data.views[id] = 0;
        await this.writeData(data);

        return id;
    }

    async getPaste(id: string, nowMs: number): Promise<{ paste: Paste; currentViews: number } | null> {
        const data = await this.readData();
        const paste = data.pastes[id];

        if (!paste) return null;

        // Check expiry
        if (paste.expires_at && nowMs > paste.expires_at) {
            return null;
        }

        // Check views
        let currentViews = data.views[id] ?? 0;

        if (paste.max_views !== null) {
            if (currentViews >= paste.max_views) {
                return null; // Already exceeded
            }
            // Increment
            currentViews += 1;
            data.views[id] = currentViews;
            await this.writeData(data); // persist view count
        } else {
            // Just increment
            currentViews += 1;
            data.views[id] = currentViews;
            await this.writeData(data);
        }

        return { paste, currentViews };
    }

    async isReady() {
        await this.initialized;
        return true;
    }
}

// Memory Store (Fallback/Test)
class MemoryStore implements Persistence {
    private pastes = new Map<string, Paste>();
    private views = new Map<string, number>();

    async createPaste(params: CreatePasteParams): Promise<string> {
        const id = nanoid(10);
        const now = Date.now();
        const expires_at = params.ttl_seconds ? now + params.ttl_seconds * 1000 : null;

        const paste: Paste = {
            id,
            content: params.content,
            created_at: now,
            expires_at,
            max_views: params.max_views ?? null,
        };

        this.pastes.set(id, paste);
        this.views.set(id, 0);
        return id;
    }

    async getPaste(id: string, nowMs: number): Promise<{ paste: Paste; currentViews: number } | null> {
        const paste = this.pastes.get(id);
        if (!paste) return null;

        if (paste.expires_at && nowMs > paste.expires_at) {
            return null;
        }

        let currentViews = this.views.get(id) ?? 0;

        if (paste.max_views !== null) {
            if (currentViews >= paste.max_views) {
                return null;
            }
            currentViews += 1;
            this.views.set(id, currentViews);
        } else {
            currentViews += 1;
            this.views.set(id, currentViews);
        }

        return { paste, currentViews };
    }

    async isReady() { return true; }
}

// Redis/KV Implementation
class RedisStore implements Persistence {
    async createPaste(params: CreatePasteParams): Promise<string> {
        const id = nanoid(10);
        const now = Date.now();
        const expires_at = params.ttl_seconds ? now + params.ttl_seconds * 1000 : null;

        const paste: Paste = {
            id,
            content: params.content,
            created_at: now,
            expires_at,
            max_views: params.max_views ?? null,
        };

        await kv.set(`paste:${id}`, paste);
        await kv.set(`paste:${id}:views`, 0);

        if (params.ttl_seconds) {
            await kv.expire(`paste:${id}`, 86400 * 30);
            await kv.expire(`paste:${id}:views`, 86400 * 30);
        }

        return id;
    }

    async getPaste(id: string, nowMs: number): Promise<{ paste: Paste; currentViews: number } | null> {
        const paste = await kv.get<Paste>(`paste:${id}`);
        if (!paste) return null;

        if (paste.expires_at && nowMs > paste.expires_at) {
            return null;
        }

        let currentViews = 0;
        if (paste.max_views !== null) {
            const newCount = await kv.incr(`paste:${id}:views`);
            currentViews = newCount;
            if (newCount > paste.max_views) {
                return null;
            }
        } else {
            const newCount = await kv.incr(`paste:${id}:views`);
            currentViews = newCount;
        }

        return { paste, currentViews };
    }

    async isReady() {
        try {
            await kv.set('test-connection', 'ok');
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Factory
const isRedisConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const isVercel = process.env.VERCEL === '1';
const useMemory = process.env.USE_MEMORY_STORE === '1';

export const storage: Persistence = isRedisConfigured
    ? new RedisStore()
    : (isVercel || useMemory ? new MemoryStore() : new FileStore());

