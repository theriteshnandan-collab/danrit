import Link from "next/link";
import { Wrench, ShieldCheck } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                    <Wrench className="w-12 h-12 text-blue-500 relative z-10" />
                </div>

                <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                    System Upgrade
                </h1>

                <p className="text-zinc-400 text-lg">
                    Danrit is currently undergoing critical infrastructure maintenance to enhance security and performance.
                </p>

                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorized Personnel Only</span>
                    </div>
                </div>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors uppercase tracking-widest"
                    >
                        Check Status
                    </Link>
                </div>
            </div>
        </div>
    );
}
