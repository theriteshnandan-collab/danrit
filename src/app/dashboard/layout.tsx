"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FileText, Video, Cpu, LayoutDashboard, Settings, LogOut, Globe } from "lucide-react";

const NAV_ITEMS = [
    { label: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    { label: "READER", href: "/dashboard/reader", icon: FileText },
    { label: "VIDEO", href: "/dashboard/video", icon: Video, disabled: true },
    { label: "SYSTEMS", href: "/dashboard/systems", icon: Cpu },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

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
                                href={item.disabled ? "#" : item.href}
                                className={`
                                    flex items-center gap-3 px-6 py-3 text-xs uppercase tracking-wider
                                    transition-colors duration-100
                                    ${isActive
                                        ? "bg-[var(--border)] text-[var(--bone)]"
                                        : "text-[var(--ash)] hover:text-[var(--bone)] hover:bg-[var(--border)]/50"
                                    }
                                    ${item.disabled ? "opacity-30 cursor-not-allowed" : ""}
                                `}
                            >
                                <Icon size={16} />
                                {item.label}
                                {item.disabled && <span className="ml-auto text-[8px] border border-[var(--ash)] px-1.5 py-0.5">SOON</span>}
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

                    {/* STATUS INDICATORS */}
                    <div className="flex items-center gap-6 text-[10px] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <span className="status-dot online"></span>
                            <span className="text-[var(--ash)]">READER: ONLINE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe size={12} className="text-[var(--ash)]" />
                            <span className="text-[var(--ash)]">V1.0.0</span>
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
