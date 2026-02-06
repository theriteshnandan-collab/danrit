import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey, AuthError } from "@/lib/auth/guard";


type ApiHandler = (req: NextRequest, context: { user_id: string; key_id: string }) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler) {
    return async (req: NextRequest) => {
        try {
            // 1. Get Key from Header
            const key = req.headers.get("x-api-key");

            if (!key) {
                // INTERNAL BYPASS: Check for Supabase Session
                const { createServerClient } = await import("@supabase/ssr");
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();

                const supabase = createServerClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        cookies: {
                            getAll: () => cookieStore.getAll(),
                            setAll: () => { }, // No-op for read-only check
                        },
                    }
                );

                const { data: { user }, error } = await supabase.auth.getUser();

                if (user && !error) {
                    // Valid Session Found - Allow Bypass
                    return await handler(req, { user_id: user.id, key_id: "internal_session" });
                }

                return NextResponse.json(
                    { error: "Unauthorized", code: "missing_api_key", message: "Provide 'x-api-key' header." },
                    { status: 401 }
                );
            }

            // 2. Verify Key
            const auth = await verifyApiKey(key);

            // 3. Rate Limit / Credit Check (TODO: Implement Strict Check here)
            // For now, we trust the key is valid.

            // 4. Run Handler
            const response = await handler(req, { user_id: auth.user_id, key_id: auth.key_id });

            // 5. Log Usage (Async / Fire-and-forget logic happens inside handler or here?)
            // Ideally here, but we need to know status code etc.
            // Let's rely on the handler calling UsageService for specifics, OR we return response and log.
            // But we can't easily read response body without consuming stream.
            // Let's just pass user_id to handler.

            return response;

        } catch (error) {
            if (error instanceof AuthError) {
                return NextResponse.json(
                    { error: "Unauthorized", code: "invalid_api_key", message: error.message },
                    { status: 401 }
                );
            }

            console.error("API Error:", error);
            return NextResponse.json(
                { error: "Internal Server Error", code: "internal_error" },
                { status: 500 }
            );
        }
    };
}
