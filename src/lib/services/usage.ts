import { createClient } from "@supabase/supabase-js";

// Initialize Service Role Client (Ironclad: Secure context only)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class UsageService {
    /**
     * Logs an API request to the database.
     * Fire-and-forget (don't await this in the critical path if possible, or use waitUntil).
     */
    static async logRequest(data: {
        user_id: string;
        key_id?: string;
        endpoint: string;
        method: string;
        status_code: number;
        duration_ms: number;
        ip_address?: string;
    }) {
        // 1. Calculate Cost (Mock logic for now: 1 credit per scrape)
        const cost = 1;

        // 2. Insert into DB
        const { error } = await supabase.from("usage_logs").insert({
            user_id: data.user_id,
            key_id: data.key_id, // If authenticated via API Key
            endpoint: data.endpoint,
            method: data.method,
            status_code: data.status_code,
            duration_ms: data.duration_ms,
            ip_address: data.ip_address,
            cost: cost,
        });

        if (error) {
            console.error("❌ Usage Logging Failed:", error);
        }
    }

    /**
     * Records a successful transaction/action (billing event).
     */
    static async recordTransaction(user_id: string, action: string, cost: number) {
        const { error } = await supabase.from("usage_logs").insert({
            user_id,
            endpoint: action, // e.g., "scrape"
            method: "TRANSACTION",
            status_code: 200,
            duration_ms: 0,
            cost: cost
        });

        if (error) {
            console.error("❌ Transaction Logging Failed:", error);
        }
    }

    static async getUserLogs(user_id: string, limit: number = 10) {
        const { data } = await supabase
            .from("usage_logs")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .limit(limit);

        return data || [];
    }

    /**
     * Retrieves aggregated stats for a user.
     */
    static async getUserStats(user_id: string) {
        // 1. Total Requests
        const { count: totalRequests } = await supabase
            .from("usage_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user_id);

        // 2. Success Rate (Last 1000 requests)
        const { data: recentLogs } = await supabase
            .from("usage_logs")
            .select("status_code, cost")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .limit(1000);

        const successCount = recentLogs?.filter((l: { status_code: number }) => l.status_code === 200).length || 0;
        const totalRecent = recentLogs?.length || 1;
        const successRate = totalRecent > 0 ? (successCount / totalRecent) * 100 : 100;

        // Calculate credits used (Mock: sum of cost in recent logs, or simplified)
        // ideally we would do a sum query, but for now let's simple sum recent or default
        const totalCreditsUsed = totalRequests ? totalRequests * 1 : 0; // Assuming 1 credit per request for now

        return {
            total_requests: totalRequests || 0,
            success_rate: parseFloat(successRate.toFixed(1)),
            total_credits_used: totalCreditsUsed,
            remaining_credits: 999999, // Placeholder
        };
    }
}
