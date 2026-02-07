import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from "@supabase/ssr";
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 0. MAINTENANCE MODE CHECK (The Safety Lock)
    // 0. MAINTENANCE MODE CHECK (DISABLED - OPEN ACCESS)
    /*
    if (process.env.MAINTENANCE_MODE === "true") {
        const bypassCookie = request.cookies.get("x-danrit-maintenance-bypass");
        const path = request.nextUrl.pathname;

        // Allow Bypass if cookie is present
        if (!bypassCookie) {
            // Block all paths except:
            // - /maintenance (The page itself)
            // - /api/auth/bypass (The key slot)
            // - /_next (Static assets)
            // - /favicon.ico
            if (!path.startsWith("/maintenance") &&
                !path.startsWith("/api/auth/bypass") &&
                !path.startsWith("/_next") &&
                path !== "/favicon.ico") {
                return NextResponse.redirect(new URL("/maintenance", request.url));
            }
        }
    }
    */

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("❌ FATAL: SUPABASE_SERVICE_ROLE_KEY is missing in Vercel Environment Variables.");
        return NextResponse.json({ error: "Server Misconfiguration: Missing Service Role Key" }, { status: 500 });
    }
    // 1. API Route Protection & Handling
    if (request.nextUrl.pathname.startsWith('/api/v1/')) {

        // A. API Key Check (External Access)
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer sk_live_')) {
            const token = authHeader.split('Bearer ')[1];
            const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
            const hashArray = Array.from(new Uint8Array(tokenHash));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { cookies: { getAll() { return [] }, setAll() { } } }
            );

            const { data: keyData, error: keyError } = await supabase
                .from('api_keys')
                .select('user_id')
                .eq('key_hash', hashHex)
                .single();

            if (keyError || !keyData) {
                return new NextResponse(
                    JSON.stringify({ error: 'Invalid API Key' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
                );
            }

            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', keyData.user_id);
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        // B. Session Check (Internal/Dashboard Access - "The Bypass")
        // We defer to Supabase Middleware to validate the session, then check if we have a user.
        // However, Supabase middleware returns a Response object. 
        // We will manually check the session here using the Request cookies.

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return request.cookies.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Authorized via Session (Laboratory/Dashboard)
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', user.id);
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        // C. Fail if neither
        return new NextResponse(
            JSON.stringify({ error: 'Missing API Key or Active Session' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        );
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
