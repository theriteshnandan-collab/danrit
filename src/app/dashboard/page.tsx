import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsageService } from "@/lib/services/usage";
import Link from "next/link";
import { ArrowRight, FileText, Video, Cpu } from "lucide-react";

export const revalidate = 30;

async function DashboardContent() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    // Parallel Data Fetching
    const [logs, keys, usageStats] = await Promise.all([
        UsageService.getUserLogs(user.id, 10),
        supabase.from('api_keys').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        UsageService.getUserStats(user.id)
    ]);

    const stats = {
        totalRequests: usageStats.total_requests || 0,
        creditsUsed: usageStats.total_credits_used || 0,
        successRate: usageStats.success_rate || 0,
        activeKeys: keys.data?.filter(k => k.status === 'active').length || 0
    };

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">COMMAND CENTER</span>
                <h1 className="text-3xl font-heading mt-2">Dashboard</h1>
            </div>

            {/* HERO GRID: STATS */}
            <div className="grid-swiss">
                <div className="col-span-3 p-6">
                    <span className="label">Total Requests</span>
                    <p className="data-value mt-2">{stats.totalRequests.toLocaleString()}</p>
                </div>
                <div className="col-span-3 p-6">
                    <span className="label">Credits Used</span>
                    <p className="data-value mt-2">{stats.creditsUsed.toLocaleString()}</p>
                </div>
                <div className="col-span-3 p-6">
                    <span className="label">Success Rate</span>
                    <p className="data-value mt-2">{stats.successRate}%</p>
                </div>
                <div className="col-span-3 p-6">
                    <span className="label">Active API Keys</span>
                    <p className="data-value mt-2">{stats.activeKeys}</p>
                </div>
            </div>

            {/* TOOLS GRID */}
            <div>
                <span className="label">TOOLS</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] mt-4 bg-[var(--border)]">
                    {/* READER */}
                    <Link href="/dashboard/reader" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <FileText size={24} className="text-[var(--ash)] group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">READER</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Extract content from any URL. Stealth mode enabled.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* VIDEO (Disabled) */}
                    <div className="panel p-6 opacity-40 cursor-not-allowed">
                        <Video size={24} className="text-[var(--ash)]" />
                        <h3 className="text-lg font-heading mt-4">VIDEO</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Download 4K video from YouTube, Twitter, Instagram.</p>
                        <div className="flex items-center gap-1 mt-4 text-[8px] uppercase border border-[var(--ash)] px-2 py-1 w-fit">
                            COMING SOON
                        </div>
                    </div>

                    {/* SYSTEMS */}
                    <Link href="/dashboard/systems" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <Cpu size={24} className="text-[var(--ash)] group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">SYSTEMS</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Monitor remote microservices and server health.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            VIEW <ArrowRight size={12} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div>
                <span className="label">RECENT ACTIVITY</span>
                <div className="panel mt-4">
                    <table className="w-full text-xs">
                        <thead className="border-b border-[var(--border)]">
                            <tr className="text-left text-[var(--ash)]">
                                <th className="p-4 font-normal uppercase tracking-wider">Endpoint</th>
                                <th className="p-4 font-normal uppercase tracking-wider">Status</th>
                                <th className="p-4 font-normal uppercase tracking-wider">Duration</th>
                                <th className="p-4 font-normal uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.slice(0, 5).map((log: { endpoint: string; status_code: number; duration_ms: number; created_at: string }, i: number) => (
                                <tr key={i} className="border-b border-[var(--border)] last:border-b-0">
                                    <td className="p-4 font-mono">{log.endpoint}</td>
                                    <td className="p-4">
                                        <span className={`status-dot ${log.status_code === 200 ? 'online' : 'offline'} inline-block mr-2`}></span>
                                        {log.status_code}
                                    </td>
                                    <td className="p-4 font-mono text-[var(--ash)]">{log.duration_ms}ms</td>
                                    <td className="p-4 text-[var(--ash)]">{new Date(log.created_at).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-[var(--ash)]">No activity yet. Make your first API call.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="text-[var(--ash)]">Loading Command Center...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
