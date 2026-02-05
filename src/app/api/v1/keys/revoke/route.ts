
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { keyId } = await request.json();
        const cookieStore = cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { }
                }
            }
        );

        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Revoke Key (Delete)
        // Ensure user owns the key via RLS or explicit matching
        const { error } = await supabase
            .from('api_keys')
            .delete()
            .match({ id: keyId, user_id: user.id });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Key revoked successfully" });

    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
