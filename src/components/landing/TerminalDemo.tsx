"use client";

import { useEffect, useState } from "react";

const BOOT_SEQUENCE = [
    { text: "> INITIATING DANRIT SYSTEM CHECK...", delay: 0 },
    { text: "> [████████████████████] 100%", delay: 800 },
    { text: "> ", delay: 1200 },
    { text: "> PHANTOM SCRAPER   : ● ONLINE", delay: 1400, status: "online" },
    { text: "> VIDEO INTEL       : ● ONLINE", delay: 1700, status: "online" },
    { text: "> PDF FORGE         : ● ONLINE", delay: 2000, status: "online" },
    { text: "> SCREENSHOT CORE   : ● ACTIVE", delay: 2300, status: "online" },
    { text: "> QR GENERATOR      : ● READY", delay: 2600, status: "online" },
    { text: "> DNS COMMAND       : ● ACTIVE", delay: 2900, status: "online" },
    { text: "> TRANSMIT MAIL     : ● READY", delay: 3200, status: "online" },
    { text: "> ", delay: 3500 },
    { text: "> ALL SYSTEMS NOMINAL. READY FOR DEPLOYMENT.", delay: 3700 },
];

export function TerminalDemo() {
    const [lines, setLines] = useState<string[]>([]);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        BOOT_SEQUENCE.forEach((item, index) => {
            const timer = setTimeout(() => {
                setLines((prev) => [...prev, item.text]);
            }, item.delay);
            timers.push(timer);
        });

        // Blinking cursor
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);

        return () => {
            timers.forEach(clearTimeout);
            clearInterval(cursorInterval);
        };
    }, []);

    return (
        <section className="relative z-10 py-20 bg-[#050505]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl shadow-orange-900/10">
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                        <span className="ml-4 text-xs font-mono text-zinc-500">danrit@orbital-command ~ /status</span>
                    </div>

                    {/* Terminal Body */}
                    <div className="p-6 font-mono text-sm min-h-[320px]">
                        {lines.map((line, index) => (
                            <div key={index} className="leading-relaxed">
                                {line.includes("● ONLINE") || line.includes("● ACTIVE") || line.includes("● READY") ? (
                                    <span>
                                        {line.split("●")[0]}
                                        <span className="text-green-500">●</span>
                                        <span className="text-green-400">{line.split("●")[1]}</span>
                                    </span>
                                ) : line.includes("████") ? (
                                    <span className="text-[var(--signal-orange)]">{line}</span>
                                ) : line.includes("ALL SYSTEMS NOMINAL") ? (
                                    <span className="text-[var(--signal-orange)] font-bold">{line}</span>
                                ) : (
                                    <span className="text-zinc-400">{line}</span>
                                )}
                            </div>
                        ))}
                        <span className={`text-[var(--signal-orange)] ${showCursor ? "opacity-100" : "opacity-0"}`}>
                            ▌
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
