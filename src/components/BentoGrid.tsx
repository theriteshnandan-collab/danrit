"use client";

import { motion } from "framer-motion";
import { Terminal, Camera, FileText, QrCode, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const features = [
    {
        title: "Universal Scraper",
        description: "Extract clean Markdown from any URL. Bypass anti-bot detection with ease.",
        icon: Terminal,
        color: "text-blue-500",
        link: "/dashboard/laboratory?tab=scrape",
        stats: "240ms Latency"
    },
    {
        title: "PDF Engine",
        description: "Convert HTML/URL to high-fidelity PDF documents. Print CSS supported.",
        icon: FileText,
        color: "text-red-500",
        link: "/dashboard/laboratory?tab=pdf",
        stats: "Vector Quality"
    },
    {
        title: "Screenshot API",
        description: "Capture full-page or specific element screenshots. Retina resolution.",
        icon: Camera,
        color: "text-orange-500",
        link: "/dashboard/laboratory?tab=shot",
        stats: "4K Ready"
    },
    {
        title: "QR Generator",
        description: "Dynamic QR codes with logo embedding and custom error correction.",
        icon: QrCode,
        color: "text-green-500",
        link: "/dashboard/laboratory?tab=qr",
        stats: "SVG Export"
    },
];

export function BentoGrid() {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto">
            {/* HEADER SECTION - SPANS FULL WIDTH */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="col-span-1 md:col-span-2 lg:col-span-4 mb-4"
            >
                <Card className="bg-transparent border-none shadow-none">
                    <CardHeader className="pl-0 pb-0">
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase opacity-100"
                        >
                            Danrit<span className="text-blue-600">.</span>
                        </motion.h1>
                        <p className="text-2xl text-zinc-400 max-w-3xl font-mono mt-6 border-l-4 border-blue-600 pl-6 tracking-wide">
                            THE UNIVERSAL API PROTOCOL. <br />
                            INDUSTRIAL GRADE TOOLS FOR NEXT-GEN BUILDERS.
                        </p>
                    </CardHeader>
                    {/* BUTTONS REMOVED FOR CLEANER AESTHETIC */}
                    <CardContent className="pl-0 pt-8" />
                </Card>
            </motion.div>

            {/* FEATURE CARDS */}
            {features.map((feature, i) => (
                <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="col-span-1"
                >
                    <Card className="h-full bg-zinc-900/50 border-zinc-800/50 hover:border-blue-500/50 transition-colors group rounded-none">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 bg-zinc-950/50 border border-zinc-800 ${feature.color} group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-0.5">
                                    {feature.stats}
                                </span>
                            </div>
                            <CardTitle className="text-xl text-zinc-100 uppercase tracking-widest font-bold">
                                {feature.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-zinc-400 text-sm leading-relaxed mb-6 font-mono">
                                {feature.description}
                            </CardDescription>
                            <Button
                                variant="secondary"
                                className="w-full bg-zinc-950 hover:bg-zinc-900 text-zinc-300 rounded-none border border-zinc-800 group-hover:border-blue-500/30 transition-colors"
                                onClick={() => router.push(feature.link)}
                            >
                                DEPLOY ENGINE <Zap className="ml-2 w-3 h-3 text-yellow-500" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}

            {/* STATS / INFO STRIP */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="col-span-1 md:col-span-2 lg:col-span-4 mt-8 pt-8 border-t border-zinc-900 flex justify-between items-center text-zinc-600 font-mono text-xs"
            >
                <div className="flex gap-8">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYSTEM OPERATIONAL</span>
                    <span>V1.1.0-STABLE</span>
                    <span>LATENCY: 42ms</span>
                </div>
                <div className="flex gap-8 uppercase tracking-widest">
                    <span>By Danrit Corp</span>
                </div>
            </motion.div>
        </div>
    );
}
