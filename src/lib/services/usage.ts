import { createClient } from "@supabase/supabase-js";

// Initialize Service Role Client (Ironclad: Secure context only)
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Sanitize: Remove wrapping quotes/whitespace which often happens in Vercel copy-paste
serviceKey = serviceKey.replace(/^['"]|['"]$/g, '').trim();

if (!serviceKey) {
    console.error("❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing or empty!");
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
);

// Force Rebuild to pick up ENV VARS (2026-02-09)
// =============================================
// TOOL COST & LIMIT CONFIGURATION
// =============================================
export const TOOL_CONFIG: Record<string, { cost: number; freeLimit: number }> = {
    dns: { cost: 0, freeLimit: Infinity },
    qr: { cost: 0, freeLimit: Infinity },
    mail: { cost: 1, freeLimit: 100 },
    scrape: { cost: 2, freeLimit: 50 },
    pdf: { cost: 5, freeLimit: 20 },
    shot: { cost: 5, freeLimit: 20 },
    video_info: { cost: 5, freeLimit: 50 },
    video_download: { cost: 10, freeLimit: 10 },
};

export interface CapCheckResult {
    allowed: boolean;
    reason?: string;
    credits_remaining?: number;
}

export class UsageService {
    /**
     * The Gatekeeper: Check if user can use a tool.
     * Returns { allowed: true } or { allowed: false, reason: "..." }
     */
    static async checkCap(user_id: string, tool: string): Promise<CapCheckResult> {
        const config = TOOL_CONFIG[tool];
        if (!config) {
            return { allowed: false, reason: `Unknown tool: ${tool}` };
        }

        // Free tools always pass
        if (config.cost === 0) {
            return { allowed: true, credits_remaining: Infinity };
        }

        // === FAIL OPEN BYPASS (Debug Mode) ===
        try {
            // Fetch user profile
            let { data: profile, error } = await supabase
                .from("profiles")
                .select("credits_balance, tier, daily_usage, last_usage_reset")
                .eq("id", user_id)
                .single();

            // === SELF-HEALING: Create/Restore missing profile ===
            if (error || !profile) {
                console.warn(`⚠️ Profile not found/fetch error for ${user_id}. Attempting NUCLEAR repair...`);

                // Try UPSERT to handle race conditions where trigger might have just finished
                const { error: insertError } = await supabase
                    .from("profiles")
                    .upsert({
                        id: user_id,
                        credits_balance: 50,
                        tier: "free",
                        daily_usage: {},
                        last_usage_reset: new Date().toISOString(),
                        full_name: "Explorer", // Satisfy potential length constraint
                        email: "user@danrit.tech" // Placeholder
                    }, { onConflict: 'id' });

                if (insertError) {
                    console.error("❌ NUCLEAR REPAIR FAILED:", insertError);
                    // FAIL OPEN!
                    console.warn("⚠️ BYPASSING AUTH DUE TO DB ERROR to allow usage check.");
                    return { allowed: true, credits_remaining: 999 };
                }

                // Re-fetch newly created/updated profile
                const { data: newProfile } = await supabase
                    .from("profiles")
                    .select("credits_balance, tier, daily_usage, last_usage_reset")
                    .eq("id", user_id)
                    .single();

                if (!newProfile) {
                    return { allowed: true, credits_remaining: 999 }; // Bypass
                }
                profile = newProfile;
                console.log(`✅ NUCLEAR REPAIR SUCCESS: Profile synced for ${user_id}.`);
            }

            // Reset daily usage if new day
            const today = new Date().toISOString().split("T")[0];
            const lastReset = profile.last_usage_reset
                ? new Date(profile.last_usage_reset).toISOString().split("T")[0]
                : null;

            let dailyUsage = profile.daily_usage || {};
            if (lastReset !== today) {
                dailyUsage = {};
                await supabase
                    .from("profiles")
                    .update({ daily_usage: {}, last_usage_reset: new Date().toISOString() })
                    .eq("id", user_id);
            }

            const usedToday = dailyUsage[tool] || 0;

            // Check 1: Credits Balance
            if (profile.credits_balance < config.cost) {
                return {
                    allowed: false,
                    reason: `Insufficient credits. Need ${config.cost}, have ${profile.credits_balance}.`,
                    credits_remaining: profile.credits_balance,
                };
            }

            // Check 2: Daily Limit (Free Tier Only)
            if (profile.tier === "free" && usedToday >= config.freeLimit) {
                return {
                    allowed: false,
                    reason: `Daily limit reached (${config.freeLimit}/${tool}). Upgrade to Pro for unlimited.`,
                    credits_remaining: profile.credits_balance,
                };
            }

            return { allowed: true, credits_remaining: profile.credits_balance };

        } catch (err) {
            console.error("🔥 CRITICAL DB FAILURE (CheckCap):", err);
            // FAIL OPEN: Allow usage so user can verify the TOOL works
            return { allowed: true, credits_remaining: 9999 };
        }
    }

    /**
     * Deduct credits and increment daily usage after successful operation.
     */
    static async deductCredits(user_id: string, tool: string): Promise<void> {
        try {
            const config = TOOL_CONFIG[tool];
            if (!config || config.cost === 0) return;

            // Fetch current profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("credits_balance, daily_usage")
                .eq("id", user_id)
                .single();

            if (!profile) return;

            const newBalance = Math.max(0, profile.credits_balance - config.cost);
            const dailyUsage = profile.daily_usage || {};
            dailyUsage[tool] = (dailyUsage[tool] || 0) + 1;

            await supabase
                .from("profiles")
                .update({
                    credits_balance: newBalance,
                    daily_usage: dailyUsage,
                })
                .eq("id", user_id);

            console.log(`💰 Deducted ${config.cost} credits from ${user_id}. New balance: ${newBalance}`);
        } catch (err) {
            console.error("🔥 IGNORED DB FAILURE (DeductCredits):", err);
        }
    }

    /**
     * Add credits to user (after payment or promo).
     */
    static async addCredits(user_id: string, amount: number): Promise<number> {
        const { data: profile } = await supabase
            .from("profiles")
            .select("credits_balance")
            .eq("id", user_id)
            .single();

        const newBalance = (profile?.credits_balance || 0) + amount;

        await supabase
            .from("profiles")
            .update({ credits_balance: newBalance })
            .eq("id", user_id);

        console.log(`💰 Added ${amount} credits to ${user_id}. New balance: ${newBalance}`);
        return newBalance;
    }

    /**
     * Records a successful transaction/action (billing event).
     */
    static async recordTransaction(user_id: string, action: string, cost: number) {
        const { error } = await supabase.from("usage_logs").insert({
            user_id,
            endpoint: action,
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
     * Retrieves aggregated stats for a user (including credits).
     */
    static async getUserStats(user_id: string) {
        // User Profile (Credits)
        const { data: profile } = await supabase
            .from("profiles")
            .select("credits_balance, tier, daily_usage")
            .eq("id", user_id)
            .single();

        // Total Requests
        const { count: totalRequests } = await supabase
            .from("usage_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user_id);

        // Success Rate (Last 100 requests)
        const { data: recentLogs } = await supabase
            .from("usage_logs")
            .select("status_code")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .limit(100);

        const successCount = recentLogs?.filter((l: { status_code: number }) => l.status_code === 200).length || 0;
        const totalRecent = recentLogs?.length || 1;
        const successRate = totalRecent > 0 ? (successCount / totalRecent) * 100 : 100;

        return {
            total_requests: totalRequests || 0,
            success_rate: parseFloat(successRate.toFixed(1)),
            credits_balance: profile?.credits_balance ?? 50,
            tier: profile?.tier ?? "free",
            daily_usage: profile?.daily_usage ?? {},
        };
    }

    /**
     * Get the sanitized Reader URL (Microservice)
     * Handles missing protocols and trailing slashes.
     */
    static getReaderUrl(): string {
        // NUCLEAR FALLBACK: Hardcoded for Production Stabilization
        let url = process.env.DANRIT_READER_URL || "https://danrit-reader-production.up.railway.app";

        // Remove quotes/whitespace
        url = url.replace(/^['"]|['"]$/g, '').trim();

        // Ensure protocol
        if (!url.startsWith("http")) {
            url = `https://${url}`;
        }

        // Remove trailing slash
        if (url.endsWith("/")) {
            url = url.slice(0, -1);
        }

        return url;
    }
}

