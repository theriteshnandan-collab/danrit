"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Terminal,
    CreditCard,
    Key,
    Settings,
    ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
        { name: "Laboratory", href: "/dashboard/laboratory", icon: Terminal },
        { name: "API Vault", href: "/dashboard/vault", icon: Key },
        { name: "Billing & Usage", href: "/dashboard/billing", icon: CreditCard },
    ];

    return (
        <aside className={`h-screen bg-[#050505] border-r border-[#1F1F22] flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>

            {/* Brand */}
            {/* Brand */}
            <div className="h-16 border-b border-[#1F1F22]">
                <Link href="/" className="flex items-center h-full px-6 hover:opacity-80 transition-opacity">
                    <div className={`w-3 h-3 rounded-full bg-[#FF4F00] animate-pulse ${collapsed ? "mx-auto" : ""}`} />
                    {!collapsed && (
                        <span className="ml-3 font-bold tracking-tight text-white text-sm">DANRIT</span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors group ${isActive
                                ? "bg-white/[0.08] text-white"
                                : "text-[#888] hover:text-white hover:bg-white/[0.04]"
                                }`}
                        >
                            <item.icon size={18} className={isActive ? "text-white" : "text-[#666] group-hover:text-white"} />
                            {!collapsed && <span>{item.name}</span>}
                            {!collapsed && isActive && <ChevronRight size={14} className="ml-auto text-[#444]" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-[#1F1F22]">
                <button className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-[6px] text-[13px] font-medium text-[#888] hover:text-white hover:bg-white/[0.04] transition-colors">
                    <Settings size={18} />
                    {!collapsed && <span>Settings</span>}
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="mt-2 flex items-center justify-center w-full py-2 text-[#444] hover:text-[#666] transition-colors"
                >
                    <div className="w-8 h-1 rounded-full bg-[#1F1F22]" />
                </button>
            </div>
        </aside>
    );
}
