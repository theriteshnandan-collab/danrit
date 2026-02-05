"use client";

import { Activity, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TelemetryDeck() {
    const [usage, setUsage] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchUsage() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('usage_metrics')
                        .select('request_count')
                        .eq('user_id', user.id)
                        .single();
                    if (data) setUsage(data.request_count);
                }
            } catch (err) {
                console.error("Telemetry Error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUsage();
    }, [supabase]);

    const limit = 100;
    const percentage = Math.min((usage / limit) * 100, 100);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Card 1: Usage Volume - The only real metric for now */}
            <div className="border border-[var(--border)] p-6 bg-background relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Activity size={20} className="text-muted-foreground" />
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">API Utilization / Fleet Limit</div>
                <div className="text-4xl font-mono font-bold tracking-tighter">
                    {loading ? "..." : usage}
                    <span className="text-sm text-muted-foreground ml-3 opacity-30">/ {limit}</span>
                </div>
                <div className="flex items-center gap-1 mt-4 text-[10px] text-primary font-bold uppercase tracking-wider">
                    <span>{percentage.toFixed(0)}% OF CAPACITY USED</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
            </div>

            {/* Placeholder for future real-time metric (e.g. Total Saved Templates) */}
            <div className="border border-white/5 p-6 bg-black/20 flex flex-col justify-center items-center text-center opacity-40">
                <BarChart3 size={24} className="text-muted-foreground mb-2" />
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold">Additional Telemetry Coming Soon</div>
                <div className="text-[8px] text-muted-foreground mt-1 max-w-[200px]">Real-time success rates and latency will be active once your fleet scales.</div>
            </div>
        </div>
    );
}
