"use client";

import { Activity, CreditCard, Zap, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsProps {
    stats: {
        totalRequests: number;
        creditsUsed: number;
        successRate: number;
        activeKeys: number;
    }
}

export function StatsCards({ stats }: StatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Total Requests</CardTitle>
                    <Activity className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalRequests.toLocaleString()}</div>
                    <p className="text-xs text-zinc-500">+12% from last month</p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Credits Used</CardTitle>
                    <Zap className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.creditsUsed.toLocaleString()}</div>
                    <p className="text-xs text-zinc-500">Free Tier Limit: 5,000</p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Success Rate</CardTitle>
                    <Server className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
                    <p className="text-xs text-zinc-500">System is stable</p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Active Keys</CardTitle>
                    <CreditCard className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.activeKeys}</div>
                    <p className="text-xs text-zinc-500">Secure Vault Active</p>
                </CardContent>
            </Card>
        </div>
    );
}
