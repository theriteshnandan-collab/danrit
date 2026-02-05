"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export function Navbar() {
    const router = useRouter();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* LOGO AREA */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-none">
                        <Shield className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-white">DANRIT</span>
                </div>

                {/* AUTH ACTIONS */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-widest"
                        onClick={() => router.push('/login')}
                    >
                        Sign In
                    </Button>
                    <Button
                        variant="default"
                        className="bg-white text-black hover:bg-zinc-200 rounded-none font-bold text-xs uppercase tracking-widest px-6"
                        onClick={() => router.push('/login')}
                    >
                        Get Access
                    </Button>
                </div>
            </div>
        </nav>
    );
}
