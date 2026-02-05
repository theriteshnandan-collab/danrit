import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const generateSchema = z.object({
    name: z.string().min(1).max(50),
});

export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: keys, error } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, created_at, last_used_at, is_active")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: keys });
}

export async function POST(req: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const json = await req.json();
        const { name } = generateSchema.parse(json);

        // 1. Generate Key: sk_live_<random>
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const secretPart = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const fullKey = `sk_live_${secretPart}`;

        // 2. Hash Key
        const keyHashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secretPart));
        const hashArray = Array.from(new Uint8Array(keyHashBuffer));
        const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 3. Store in DB
        const { data, error } = await supabase.from("api_keys").insert({
            user_id: user.id,
            name,
            key_hash: keyHash,
            key_prefix: `sk_live_${secretPart.substring(0, 4)}...`,
            is_active: true
        }).select("id, name, key_prefix, created_at").single();

        if (error) throw error;

        // 4. Return Full Key (Once Only)
        return NextResponse.json({
            success: true,
            data: {
                ...data,
                secret_key: fullKey // This is the ONLY time the user sees this
            }
        });

    } catch (error) {
        return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
    }
}
