import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple In-Memory Rate Limit (Fallback for now)
// In production, use Upstash Redis for distributed state
const RATE_LIMIT_MAP = new Map();

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // === 1. SECURITY HEADERS (The Shield) ===
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // === 2. CORS (The Gate) ===
    // Allow specific origins or same-origin
    const origin = request.headers.get('origin');
    if (origin && (origin.includes('danrit.tech') || origin.includes('localhost'))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    }

    // === 3. RATE LIMITING (The Valve) ===
    // Limit: 100 requests per minute per IP for API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute
        const limit = 100;

        const record = RATE_LIMIT_MAP.get(ip) || { count: 0, startTime: now };

        if (now - record.startTime > windowMs) {
            // Reset window
            record.count = 1;
            record.startTime = now;
        } else {
            record.count++;
        }

        RATE_LIMIT_MAP.set(ip, record);

        if (record.count > limit) {
            return new NextResponse(
                JSON.stringify({ error: "Rate Limit Exceeded", retry_after: Math.ceil((windowMs - (now - record.startTime)) / 1000) }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        response.headers.set('X-RateLimit-Limit', String(limit));
        response.headers.set('X-RateLimit-Remaining', String(limit - record.count));
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
