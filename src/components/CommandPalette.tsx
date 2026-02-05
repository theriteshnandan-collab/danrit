"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Zap, Terminal, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm">
            <Command className="w-[640px] max-w-full bg-[#09090b] border border-white/10 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center border-b border-white/10 px-4">
                    <Search className="w-5 h-5 text-[#666]" />
                    <Command.Input
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent px-4 py-4 text-white placeholder:text-[#666] outline-none font-medium"
                    />
                    <div className="flex gap-1">
                        <kbd className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-[#888]">ESC</kbd>
                    </div>
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-py-2">
                    <Command.Empty className="py-6 text-center text-sm text-[#666]">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="Navigation" className="text-[10px] uppercase tracking-widest text-[#444] font-bold px-2 py-1.5 mb-1">
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/dashboard'))}
                            className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/5 text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <Zap className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/dashboard/laboratory'))}
                            className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/5 text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <Terminal className="w-4 h-4" />
                            <span>Laboratory</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => router.push('/dashboard/billing'))}
                            className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/5 text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>Billing</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Separator className="h-[1px] bg-white/5 my-2" />

                    <Command.Group heading="Account">
                        <Command.Item
                            onSelect={() => runCommand(() => console.log('Logout'))}
                            className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/5 text-sm text-red-400 aria-selected:bg-red-500/10 aria-selected:text-red-400 cursor-pointer transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </Command>
        </div>
    );
}
