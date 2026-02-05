"use client";

import CommandPalette from "@/components/CommandPalette";
import { Activity, Database, Server, RefreshCw } from "lucide-react";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";

export default function DashboardPage() {
    const { stats, loading, error } = useDashboardStats();

    if (loading) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/20 font-mono text-xs">INITIALIZING COMMAND DECK...</div>;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
            <CommandPalette />

            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Command Center</h1>
                    <p className="text-[#666] text-sm">Overview of your Universal API infrastructure.</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#444] font-mono border border-white/10 px-3 py-1.5 rounded bg-white/[0.02]">
                    <span className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-[#00E054] animate-pulse"}`} />
                    {error ? "SYSTEM OFFILINE" : "SYSTEM OPERATIONAL"}
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Metric 1: Usage (REAL) */}
                <div className="p-6 rounded-xl border border-white/10 bg-[#09090b] relative overflow-hidden group hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[#666] text-xs font-medium uppercase tracking-wider">Total Requests</span>
                        <Activity className="w-4 h-4 text-[#3B82F6]" />
                    </div>
                    <div className="text-4xl font-bold tracking-tight mb-1 text-white">
                        {stats?.total_requests.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-[#00E054] font-medium">Synced Live</div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 bg-gradient-to-t from-[#3B82F6] to-transparent pointer-events-none" />
                </div>

                {/* Metric 2: Success Rate (REAL) */}
                <div className="p-6 rounded-xl border border-white/10 bg-[#09090b] relative overflow-hidden group hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[#666] text-xs font-medium uppercase tracking-wider">Success Rate</span>
                        <Server className="w-4 h-4 text-[#FF4F00]" />
                    </div>
                    <div className="text-4xl font-bold tracking-tight mb-1 text-white">
                        {stats?.success_rate}%
                    </div>
                    <div className="text-xs text-[#666] font-medium">Reliability Score</div>
                </div>

                {/* Metric 3: Credits (MOCK for now, but wired) */}
                <div className="p-6 rounded-xl border border-white/10 bg-[#09090b] relative overflow-hidden group hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[#666] text-xs font-medium uppercase tracking-wider">Remaining Credits</span>
                        <Database className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <div className="text-4xl font-bold tracking-tight mb-1 text-white">
                        999,999
                    </div>
                    <div className="text-xs text-[#666] font-medium">Unlimited Access</div>
                </div>
            </div>

            {/* Recent Activity Log (REAL) */}
            <div className="rounded-xl border border-white/10 bg-[#09090b] overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white">Live Activity Log</h3>
                    <div className="text-[10px] uppercase font-bold text-[#666] flex items-center gap-2">
                        <RefreshCw size={10} className="animate-spin" /> REALTIME
                    </div>
                </div>
                <div className="divide-y divide-white/5 font-mono text-xs">
                    {stats?.recent_logs.length === 0 && (
                        <div className="px-6 py-8 text-center text-[#444]">
                            No activity detected. Launch a scrape in the Laboratory.
                        </div>
                    )}
                    {stats?.recent_logs.map((log: { id: string; created_at: string; status_code: number; endpoint: string; duration_ms: number }) => (
                        <div key={log.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-[#666]">
                                    {new Date(log.created_at).toLocaleTimeString()}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.status_code >= 400
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-[#00E054]/10 text-[#00E054]"
                                    }`}>
                                    {log.status_code} {log.status_code === 200 ? "OK" : "ERR"}
                                </span>
                                <span className="text-white/80 truncate w-64">{log.endpoint}</span>
                            </div>
                            <span className="text-[#666]">{log.duration_ms}ms</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
