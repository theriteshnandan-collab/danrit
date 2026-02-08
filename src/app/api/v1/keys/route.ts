import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { data: keys } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return NextResponse.json({ keys: keys || [] });
}

export async function POST(request: Request) {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const name = body.name || "Untitled Key";

    // Generate Key
    const key = `sk_live_${crypto.randomBytes(24).toString("hex")}`;

    // Hash Key
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const preview = `${key.substring(0, 11)}...${key.substring(key.length - 4)}`;

    const { error } = await supabase
        .from("api_keys")
        .insert({
            user_id: user.id,
            name,
            key_hash: hash,
            key_preview: preview,
        });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // RETURN THE FULL KEY ONLY ONCE
    return NextResponse.json({ key, name, preview });
}
