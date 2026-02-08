"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Terminal, Video, LayoutDashboard, Settings, LogOut, Globe, FileText, Camera, QrCode, Mail, Key, Coins, Zap } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const NAV_ITEMS = [
    { label: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    { label: "SCRAPER", href: "/dashboard/reader", icon: Terminal },
    { label: "VIDEO", href: "/dashboard/video", icon: Video },
    { label: "PDF", href: "/dashboard/pdf", icon: FileText },
    { label: "SCREENSHOT", href: "/dashboard/shot", icon: Camera },
    { label: "QR CODE", href: "/dashboard/qr", icon: QrCode },
    { label: "DNS", href: "/dashboard/dns", icon: Globe },
    { label: "MAIL", href: "/dashboard/mail", icon: Mail },
    { label: "API KEYS", href: "/dashboard/vault", icon: Key },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: stats } = useSWR("/api/v1/user/stats", fetcher, { refreshInterval: 30000 });

    const credits = stats?.credits_balance ?? 50;
    const tier = stats?.tier ?? "free";

    return (
        <div className="flex min-h-screen bg-[var(--void)] text-[var(--bone)]">
            {/* SIDEBAR */}
            <aside className="sidebar-width flex flex-col border-r border-[var(--border)] h-screen sticky top-0">
                {/* LOGO */}
                <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
                    <span className="text-lg font-heading tracking-[-0.04em]">DANRIT</span>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 py-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-6 py-3 text-xs uppercase tracking-wider
                                    transition-colors duration-100
                                    ${isActive
                                        ? "bg-[var(--border)] text-[var(--bone)]"
                                        : "text-[var(--ash)] hover:text-[var(--bone)] hover:bg-[var(--border)]/50"
                                    }
                                `}
                            >
                                <Icon size={16} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER */}
                <div className="border-t border-[var(--border)] p-4 space-y-2">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 text-xs text-[var(--ash)] hover:text-[var(--bone)]">
                        <Settings size={14} />
                        SETTINGS
                    </Link>
                    <button className="flex items-center gap-2 text-xs text-[var(--ash)] hover:text-[var(--signal-red)]">
                        <LogOut size={14} />
                        LOGOUT
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* STATUS BAR */}
                <header className="statusbar-height flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--void)]">
                    {/* BREADCRUMBS */}
                    <div className="text-[10px] uppercase tracking-wider text-[var(--ash)]">
                        {pathname.split("/").filter(Boolean).join(" / ")}
                    </div>

                    {/* STATUS INDICATORS + CREDITS */}
                    <div className="flex items-center gap-6 text-[10px] uppercase tracking-wider">
                        {/* CREDITS DISPLAY */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-900/20 border border-amber-700/30">
                            <Coins size={12} className="text-amber-500" />
                            <span className="text-amber-400 font-medium">{credits}</span>
                            <span className="text-amber-600">CREDITS</span>
                        </div>

                        {/* TIER BADGE */}
                        {tier === "free" ? (
                            <Link
                                href="/dashboard/billing"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] font-semibold hover:from-amber-500 hover:to-orange-500 transition-all"
                            >
                                <Zap size={12} />
                                UPGRADE
                            </Link>
                        ) : (
                            <span className="px-2 py-1 rounded-md bg-emerald-900/30 text-emerald-400 border border-emerald-700/30">
                                PRO
                            </span>
                        )}

                        <div className="flex items-center gap-2">
                            <span className="status-dot online"></span>
                            <span className="text-[var(--ash)]">READER: ONLINE</span>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
