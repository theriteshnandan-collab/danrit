
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
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

        // 2. Generate Secure Key
        // Format: sk_live_<32 bytes hex>
        const randomBytes = crypto.randomBytes(32).toString('hex');
        const prefix = "sk_live_";
        const apiKey = `${prefix}${randomBytes}`;

        // 3. Hash for Storage (SHA-256)
        // We NEVER store the raw key. If DB is leaked, keys are safe.
        const keyHash = crypto
            .createHash('sha256')
            .update(apiKey)
            .digest('hex');

        // 4. Store in DB
        const { error } = await supabase
            .from('api_keys')
            .insert({
                user_id: user.id,
                key_hash: keyHash,
                key_prefix: prefix, // First 7 chars identifying the key type
                label: 'Production Key',
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        // 5. Return Full Key (ONE TIME ONLY)
        return NextResponse.json({
            success: true,
            apiKey: apiKey,
            message: "Key generated. Save it now, it will never be shown again."
        });

    } catch (error) {
        const err = error as Error;
        console.error("Key Generation Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
