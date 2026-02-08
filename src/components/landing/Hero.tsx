"use client";

import Link from "next/link";
import { ArrowRight, Rocket, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function Hero() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session?.user);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    return (
        <section className="relative z-10 min-h-[85vh] flex flex-col justify-center items-center px-6 pt-28 pb-16 overflow-hidden">

            {/* BACKGROUND COLOR ORBS (Warm/Refined) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Warm Amber Orb - Top Left */}
                <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[120px]" />
                {/* Copper Orb - Bottom Right */}
                <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-orange-700/10 rounded-full blur-[150px]" />
                {/* Slate Blue Orb - Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-slate-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-5xl mx-auto">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/30 mb-8">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                        Industrial Data Suite • V2.0
                    </span>
                </div>

                {/* Main Headline - Gradient Text */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-6">
                    <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                        The Developer&apos;s
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                        Ultimate Toolkit
                    </span>
                </h1>

                {/* Sub-headline */}
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
                    8 industrial-grade engines. 1 unified platform.
                    <br className="hidden md:block" />
                    <span className="text-zinc-300">Built for builders who demand excellence.</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href={isLoggedIn ? "/dashboard" : "/login"}
                        className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-wider hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-orange-600/25"
                    >
                        {isLoggedIn ? <LayoutDashboard size={18} /> : <Rocket size={18} />}
                        {isLoggedIn ? "Launch Console" : "Enter Console"}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="#arsenal"
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 text-white font-bold text-sm uppercase tracking-wider hover:bg-zinc-800/80 hover:border-zinc-600 transition-all"
                    >
                        View Arsenal
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap justify-center gap-12 mt-20 pt-10 border-t border-zinc-800/50">
                    <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">8</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mt-2">Engines</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">1</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mt-2">API</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">∞</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mt-2">Possibilities</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
