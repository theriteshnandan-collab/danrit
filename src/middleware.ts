import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from "@supabase/ssr";
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("❌ FATAL: SUPABASE_SERVICE_ROLE_KEY is missing in Vercel Environment Variables.");
        return NextResponse.json({ error: "Server Misconfiguration: Missing Service Role Key" }, { status: 500 });
    }
    // 1. Filter: Intercept request to Scrape API
    if (request.nextUrl.pathname.startsWith('/api/v1/scrape')) {
        const authHeader = request.headers.get('authorization');

        // 2. Check: Is Header Missing?
        if (!authHeader || !authHeader.startsWith('Bearer sk_live_')) {
            return new NextResponse(
                JSON.stringify({ error: 'Missing or Invalid API Key' }),
                { status: 401, headers: { 'content-type': 'application/json' } }
            );
        }

        // 3. Extract & Hash Token
        const token = authHeader.split('Bearer ')[1];
        const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
        const hashArray = Array.from(new Uint8Array(tokenHash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 4. Validate against DB (Service Role needed to read keys via RLS bypass or explicit check)
        // Since Middleware Edge runtime has limitations, we'll do a simple fetch to a verify-key internal route
        // OR use the Supabase client directly if Edge compatible.
        // Let's use direct Supabase client with SERVICE ROLE key for performance in Edge.
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use SERVICE KEY to read all keys
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { }
                }
            }
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

        // 5. Success: Forward request (Pass user_id via header for the final handler)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', keyData.user_id);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
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
