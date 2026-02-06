import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function POST() {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Generate Secure Key (sk_live_...)
        const randomPart = randomBytes(24).toString("hex");
        const rawKey = `sk_live_${randomPart}`;
        const keyPrefix = rawKey.substring(0, 12); // "sk_live_1234"

        // 2. Hash the key for storage (SHA-256)
        // We use the Web Crypto API or Node Crypto. Since we are in Edge/Serverless, Node Crypto is safer if available, but Web Crypto is standard.
        // Let's use standard Web Crypto API for compatibility.
        // Actually, simpler:
        const encoder = new TextEncoder();
        // Standard practice: Hash the whole token.
        // Standard practice: Hash the whole token.
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(randomPart));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // 3. Store in DB
        const { error: dbError } = await supabase
            .from("api_keys")
            .insert({
                user_id: user.id,
                key_hash: hashHex,
                key_prefix: keyPrefix,
                status: "active",
                name: "Default Key" // Optional
            });

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
        }

        // 4. Return Raw Key (ONCE)
        return NextResponse.json({
            success: true,
            key: rawKey
        });

    } catch (error) {
        console.error("Key Gen Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
