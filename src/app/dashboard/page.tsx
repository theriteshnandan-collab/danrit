import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RequestLogTable } from "@/components/dashboard/RequestLogTable";
import { ApiKeyManager } from "@/components/dashboard/ApiKeyManager";
import { EngineStatus } from "@/components/dashboard/EngineStatus";
import { UsageService } from "@/lib/services/usage";

// 30 Seconds revalidation for near real-time feels without overload
export const revalidate = 30;

async function DashboardContent() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    // Parallel Data Fetching
    const [logs, keys, usageStats] = await Promise.all([
        UsageService.getUserLogs(user.id, 10), // Limit 10
        supabase.from('api_keys').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        UsageService.getUserStats(user.id)
    ]);

    // Derived Stats
    // Derived Stats
    const stats = {
        totalRequests: usageStats.total_requests,
        creditsUsed: usageStats.total_credits_used,
        successRate: usageStats.success_rate,
        activeKeys: keys.data?.filter(k => k.status === 'active').length || 0
    };

    return (
        <div className="space-y-8">
            <DashboardHeader
                title="Command Center"
                subtitle="Manage your engines, keys, and usage."
            />

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Logs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white">Live Activity</h3>
                        </div>
                        <RequestLogTable logs={logs} />
                    </div>

                    {/* API Keys */}
                    <ApiKeyManager keys={keys.data || []} />
                </div>

                <div className="space-y-8">
                    {/* Engine Health */}
                    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <EngineStatus />
                    </div>

                    {/* Quick Start / Docs */}
                    <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/20 rounded-xl">
                        <h3 className="text-sm font-medium text-indigo-400 mb-2">Integration Guide</h3>
                        <p className="text-xs text-zinc-400 mb-4">
                            Learn how to connect Danrit engines to your application using our unified API.
                        </p>
                        <a
                            href="https://github.com/theriteshnandan-collab/danrit"
                            target="_blank"
                            className="text-xs font-bold text-white hover:text-indigo-400 transition-colors"
                        >
                            Read Documentation &rarr;
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Suspense fallback={<div className="text-zinc-500">Loading Command Center...</div>}>
                    <DashboardContent />
                </Suspense>
            </div>
        </div>
    );
}
