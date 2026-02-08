import { Key, Terminal, Rocket } from "lucide-react";

const STEPS = [
    {
        number: "01",
        title: "Connect",
        description: "Get your API key in seconds. No credit card required to start.",
        icon: Key,
        color: "amber",
    },
    {
        number: "02",
        title: "Command",
        description: "Call any of the 8 engines with a simple REST API or SDK.",
        icon: Terminal,
        color: "slate",
    },
    {
        number: "03",
        title: "Conquer",
        description: "Deploy to production. Scale effortlessly. Dominate your domain.",
        icon: Rocket,
        color: "emerald",
    },
];

const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
    amber: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    slate: { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

export function HowItWorks() {
    return (
        <section className="relative z-10 py-28 bg-gradient-to-b from-[#050505] to-[#0A0505]">
            {/* Background Orb */}
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-900/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">
                        How It Works
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                            Three Steps to
                        </span>{" "}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Excellence
                        </span>
                    </h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const colors = COLOR_MAP[step.color] || COLOR_MAP.amber;

                        return (
                            <div
                                key={step.number}
                                className="relative group"
                            >
                                {/* Connector Line (desktop only) */}
                                {index < STEPS.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-zinc-700 to-zinc-800" />
                                )}

                                <div className="text-center">
                                    {/* Step Number */}
                                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl ${colors.bg} border ${colors.border} mb-6 group-hover:scale-105 transition-transform`}>
                                        <Icon className={colors.text} size={36} />
                                    </div>

                                    {/* Step Number Badge */}
                                    <div className="flex justify-center mb-4">
                                        <span className={`text-xs font-mono ${colors.text} uppercase tracking-widest`}>
                                            Step {step.number}
                                        </span>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-2xl font-semibold text-white mb-2">{step.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
