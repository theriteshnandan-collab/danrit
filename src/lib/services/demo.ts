

export class DemoService {
    private static DEMO_USER_ID = "DEMO_GUEST";
    private static HOURLY_LIMIT = 10; // Strict limit for public demo

    static async checkRateLimit(ip: string): Promise<boolean> {
        if (!ip) return true; // Fail open if no IP (or block? Block is safer for public API)
        // Actually, forcing IP check is better for "Ironclad"

        // We need administrative access to check logs by IP across the system?
        // Or just check logs for 'DEMO_GUEST' user.
        // usage_logs usually has RLS. We need service role to read it effectively or just use the public client if we own the logs?
        // Let's rely on standard client first, catch error if RLS blocks.
        // Assuming this runs on server, `createClient()` usually uses cookies.
        // For public demo, there is NO user session. So `createClient()` is anonymous.
        // Anonymous users probably can't read `usage_logs`.

        // We MUST use Service Role here to check limits.
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return true; // Dev mode fallback

        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { count, error } = await admin
            .from("usage_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", this.DEMO_USER_ID)
            .eq("ip_address", ip)
            .gt("created_at", oneHourAgo);

        if (error) {
            console.error("Rate Limit Check Failed:", error);
            return false; // Fail safe (block)
        }

        return (count || 0) < this.HOURLY_LIMIT;
    }

    static getDemoUser() {
        return this.DEMO_USER_ID;
    }
}
