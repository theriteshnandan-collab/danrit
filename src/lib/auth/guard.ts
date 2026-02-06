import { createClient } from "@/lib/supabase/server";

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}

export async function verifyApiKey(key: string) {
    // 1. Validate Format (sk_live_...)
    if (!key.startsWith("sk_live_")) {
        throw new AuthError("Invalid Key Format. Must start with 'sk_live_'");
    }

    // 2. Hash the incoming key (SHA-256)
    // We only store the hash of the random part (after sk_live_) or the whole thing?
    // In `keys/create/route.ts`, we hashed the *randomPart*.
    // const randomPart = randomBytes(24).toString("hex");
    // const rawKey = `sk_live_${randomPart}`;
    // crypto.subtle.digest("SHA-256", encoder.encode(randomPart));

    // THIS IS CRITICAL: We must match the hashing logic exactly.
    const randomPart = key.replace("sk_live_", "");

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(randomPart));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // 3. Check DB
    const supabase = createClient();

    // We need to use `supabase.from('api_keys')` but usually RLS blocks this for anon users if they aren't owner.
    // BUT this is a public API call (no session).
    // We need ADMIN ACCESS (Service Role) to verify any key.
    // Wait, `createClient` uses standard headers. It won't have admin rights.
    // We need a Service Role client for this specific check.

    // TODO: For now, we assume the server client CAN read api_keys if we expose a "verify" function via RPC? 
    // OR, simpler: We use the SUPABASE_SERVICE_ROLE_KEY environment variable here if available.

    // DO NOT EXPOSE SERVICE KEY TO CLIENT BUNDLE. This is server-side code (lib/auth/guard.ts).
    // so `process.env.SUPABASE_SERVICE_ROLE_KEY` is safe.

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY missing.");
        throw new Error("Internal Server Error: Auth Configuration Missing");
    }

    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const adminAuthClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: keyRecord, error } = await adminAuthClient
        .from("api_keys")
        .select("id, user_id, status")
        .eq("key_hash", hashHex)
        .single();

    if (error || !keyRecord) {
        throw new AuthError("Invalid API Key");
    }

    if (keyRecord.status !== 'active') {
        throw new AuthError("API Key Revoked");
    }

    return {
        valid: true,
        user_id: keyRecord.user_id,
        key_id: keyRecord.id
    };
}
