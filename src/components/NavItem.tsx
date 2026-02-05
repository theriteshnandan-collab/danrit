"use client";

import React from "react";

export default function NavItem({
    icon,
    label,
    active = false,
    onClick
}: {
    icon: React.ReactNode,
    label: string,
    active?: boolean,
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] transition-all uppercase tracking-widest font-bold border-l-2 ${active
                    ? "bg-muted text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border-transparent"
                }`}
        >
            <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
            <span>{label}</span>
        </button>
    );
}
