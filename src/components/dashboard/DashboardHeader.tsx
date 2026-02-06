"use client";

import { UserButton } from "@/components/auth/UserButton";

export function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
                <p className="text-zinc-400">{subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
                <UserButton />
            </div>
        </div>
    );
}
