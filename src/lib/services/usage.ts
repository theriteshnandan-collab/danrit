import { createClient } from "@supabase/supabase-js";
import { UsageLogSchema } from "@/lib/types/schema";
import { z } from "zod";

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
            .select("status_code")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .limit(1000);

        const successCount = recentLogs?.filter((l: any) => l.status_code === 200).length || 0;
        const totalRecent = recentLogs?.length || 1;
        const successRate = (successCount / totalRecent) * 100;

        // 3. Recent Logs
        const { data: logs } = await supabase
            .from("usage_logs")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .limit(10);

        return {
            total_requests: totalRequests || 0,
            success_rate: parseFloat(successRate.toFixed(1)),
            recent_logs: logs || [],
            remaining_credits: 999999, // Placeholder until billing is live
        };
    }
}
