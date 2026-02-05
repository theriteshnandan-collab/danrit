"use client";

import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#FF4F00] animate-pulse" />
                <span className="text-[11px] font-medium tracking-wide text-white/80 uppercase">
                    DANRIT SYSTEMS v1.0
                </span>
            </div>

            {/* Headline */}
            <h1 className="max-w-4xl text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                The Universal API <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
                    For Agents
                </span>
            </h1>

            {/* Subhead */}
            <p className="max-w-xl text-lg text-[#888] mb-10 leading-relaxed">
                Scrape, PDF, Mail, Shot, QR, DNS. <br />
                The Universal API for the AI Agent Era.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <Link
                    href="/dashboard"
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group"
                >
                    Start Building
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="flex items-center gap-2 px-6 py-2.5 rounded-[2px] bg-black/40 border border-white/10 font-mono text-sm text-[#888]">
                    <span className="text-[#FF4F00]">$</span> npx danrit init
                </div>
            </div>

        </section>
    );
}
