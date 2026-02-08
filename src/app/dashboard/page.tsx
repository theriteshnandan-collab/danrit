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
        creditsUsed: usageStats.daily_usage || 0,
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

            {/* PRODUCTS GRID */}
            <div>
                <span className="label">PRODUCTS</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] mt-4 bg-[var(--border)]">
                    {/* SCRAPER */}
                    <Link href="/dashboard/reader" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <FileText size={24} className="text-[var(--signal-orange)] group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">SCRAPER</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Extract content from any URL with stealth mode.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* VIDEO */}
                    <Link href="/dashboard/video" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <Video size={24} className="text-blue-500 group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">VIDEO</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Download 4K video from YouTube, Twitter, Instagram.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* PDF */}
                    <Link href="/dashboard/pdf" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <FileText size={24} className="text-red-500 group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">PDF</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Convert any webpage to PDF document.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* SCREENSHOT */}
                    <Link href="/dashboard/shot" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <Cpu size={24} className="text-purple-500 group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">SCREENSHOT</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Capture full-page website screenshots.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* QR CODE */}
                    <Link href="/dashboard/qr" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <Cpu size={24} className="text-green-500 group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">QR CODE</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Generate high-resolution QR codes.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* DNS */}
                    <Link href="/dashboard/dns" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <Cpu size={24} className="text-cyan-500 group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">DNS</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Query DNS records for any domain.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* MAIL */}
                    <Link href="/dashboard/mail" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <Cpu size={24} className="text-yellow-500 group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">MAIL</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Send transactional emails at scale.</p>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[var(--ash)] group-hover:text-[var(--bone)]">
                            LAUNCH <ArrowRight size={12} />
                        </div>
                    </Link>

                    {/* API KEYS */}
                    <Link href="/dashboard/vault" className="panel p-6 group hover:bg-[var(--border)] transition-colors">
                        <Cpu size={24} className="text-[var(--ash)] group-hover:text-[var(--bone)] transition-colors" />
                        <h3 className="text-lg font-heading mt-4">API KEYS</h3>
                        <p className="text-xs text-[var(--ash)] mt-2">Manage your API keys and usage.</p>
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
