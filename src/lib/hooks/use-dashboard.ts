"use client";

import { useEffect, useState } from "react";
import { UsageStatsSchema } from "@/lib/types/schema";
import type { z } from "zod";

type UsageStats = z.infer<typeof UsageStatsSchema>;

export function useDashboardStats() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/dashboard/stats");
                if (res.status === 401) {
                    // Let the layout/middleware handle redirect, but flag it
                    setError("Unauthorized");
                    return;
                }
                const json = await res.json();

                if (json.success) {
                    setStats(json.data);
                } else {
                    setError(json.error || "Failed to fetch stats");
                }
            } catch {
                setError("Network Error");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return { stats, loading, error };
}
