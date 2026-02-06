import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the most recent active key for this user
        const { data: keyData, error: dbError } = await supabase
            .from('api_keys')
            .select('key_prefix, created_at')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (dbError || !keyData) {
            return NextResponse.json({ error: "No active keys found" }, { status: 404 });
        }

        // SECURITY NOTE: We only return the metadata or a way to *use* the key safely on the client.
        // ACTUALLY: The client needs the FULL key to make requests to the API from the browser.
        // Wait, we only store the HASH in the DB (`key_hash`). We DO NOT store the full key.
        //
        // PROBLEM: We cannot return the full key because we don't have it.
        // SOLUTION: The Laboratory needs to use a PROXY endpoint or the user must regenerate a key if lost.
        //
        // ALTERNATIVE: For the "Laboratory" internal tool, we can bypass the Key check if the user has a valid Session cookie.
        // The Middleware allows requests if they have a session cookie?
        // Let's check middleware.ts again. 
        //
        // Middleware Logic:
        // 1. Checks for Authorization header.
        // 2. If missing, returns 401. 
        // 3. Fallback: `updateSession` does session check, but the API route protection block is BEFORE that.
        //
        // REVISED PLAN:
        // We cannot fetch the raw key. We must bypass the API Key check for "Internal Laboratory Requests".
        // How? The browser sends cookies.
        // We can modify middleware to allow requests that have a valid Supabase Session Cookie.

        return NextResponse.json({
            message: "Cannot retrieve full key (hashed). Use Session Bypass in Lab."
        }, { status: 501 });

    } catch {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
