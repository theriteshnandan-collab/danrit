import Link from "next/link";
import { Terminal, Video, FileText, Camera, QrCode, Globe, Mail, Key, ArrowRight } from "lucide-react";

const PRODUCTS = [
    {
        name: "Phantom Scraper",
        tagline: "Stealth Extraction Engine",
        icon: Terminal,
        color: "amber",
        href: "/dashboard/reader",
        size: "large",
    },
    {
        name: "Video Intel",
        tagline: "4K Downlink & Metadata",
        icon: Video,
        color: "slate",
        href: "/dashboard/video",
        size: "large",
    },
    {
        name: "PDF Forge",
        tagline: "Web to Document",
        icon: FileText,
        color: "rose",
        href: "/dashboard/pdf",
        size: "normal",
    },
    {
        name: "Screenshot Core",
        tagline: "Full-Page Capture",
        icon: Camera,
        color: "violet",
        href: "/dashboard/shot",
        size: "normal",
    },
    {
        name: "QR Generator",
        tagline: "Dynamic Code Forge",
        icon: QrCode,
        color: "emerald",
        href: "/dashboard/qr",
        size: "normal",
    },
    {
        name: "DNS Command",
        tagline: "Global Record Lookup",
        icon: Globe,
        color: "sky",
        href: "/dashboard/dns",
        size: "normal",
    },
    {
        name: "Transmit Mail",
        tagline: "Transactional Delivery",
        icon: Mail,
        color: "orange",
        href: "/dashboard/mail",
        size: "normal",
    },
    {
        name: "API Vault",
        tagline: "Secure Key Management",
        icon: Key,
        color: "zinc",
        href: "/dashboard/vault",
        size: "normal",
    },
];

const COLOR_MAP: Record<string, { text: string; bg: string; glow: string; border: string }> = {
    amber: { text: "text-amber-500", bg: "bg-amber-500/10", glow: "shadow-amber-500/20", border: "border-amber-500/20" },
    slate: { text: "text-slate-400", bg: "bg-slate-500/10", glow: "shadow-slate-500/20", border: "border-slate-500/20" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", glow: "shadow-rose-500/20", border: "border-rose-500/20" },
    violet: { text: "text-violet-400", bg: "bg-violet-500/10", glow: "shadow-violet-500/20", border: "border-violet-500/20" },
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20", border: "border-emerald-500/20" },
    sky: { text: "text-sky-400", bg: "bg-sky-500/10", glow: "shadow-sky-500/20", border: "border-sky-500/20" },
    orange: { text: "text-orange-400", bg: "bg-orange-500/10", glow: "shadow-orange-500/20", border: "border-orange-500/20" },
    zinc: { text: "text-zinc-400", bg: "bg-zinc-500/10", glow: "shadow-zinc-500/20", border: "border-zinc-500/20" },
};

export function ArsenalGrid() {
    return (
        <section className="relative z-10 py-28 bg-gradient-to-b from-[#050505] via-[#0A0A0A] to-[#050505]">
            {/* Subtle Background Orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-900/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-900/20 border border-amber-700/20 text-xs font-mono text-amber-500 uppercase tracking-widest mb-4">
                        The Arsenal
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                            8 Engines.
                        </span>{" "}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Infinite Power.
                        </span>
                    </h2>
                    <p className="text-zinc-500 mt-4 max-w-2xl mx-auto">
                        Every tool you need for digital excellence. Unified API. Industrial-grade reliability.
                    </p>
                </div>

                {/* Premium Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {PRODUCTS.map((product) => {
                        const Icon = product.icon;
                        const isLarge = product.size === "large";
                        const colors = COLOR_MAP[product.color] || COLOR_MAP.zinc;

                        return (
                            <Link
                                key={product.name}
                                href={product.href}
                                className={`
                                    group relative p-6 rounded-2xl 
                                    bg-gradient-to-br from-zinc-900/80 to-zinc-900/40
                                    backdrop-blur-sm
                                    border border-zinc-800/50
                                    hover:${colors.border} hover:shadow-xl hover:${colors.glow}
                                    transition-all duration-300
                                    ${isLarge ? "md:col-span-2" : ""}
                                `}
                            >
                                {/* Subtle Glow Overlay */}
                                <div className={`absolute inset-0 rounded-2xl ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    {/* Icon with Glow */}
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} mb-5`}>
                                        <Icon className={colors.text} size={24} />
                                    </div>

                                    <h3 className="text-lg font-semibold text-white tracking-tight">{product.name}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">{product.tagline}</p>

                                    <div className={`flex items-center gap-1.5 mt-6 text-xs ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
