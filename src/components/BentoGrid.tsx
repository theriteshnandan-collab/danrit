"use client";

import { motion } from "framer-motion";
import { Camera, QrCode, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ScrapeConsole } from "@/components/demos/ScrapeConsole";
import { PdfStudio } from "@/components/demos/PdfStudio";



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
                            className="text-7xl md:text-9xl font-heading text-white tracking-[-0.08em] uppercase opacity-100"
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
            {/* 1. UNIVERSAL SCRAPER (INTERACTIVE) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="col-span-1 md:col-span-1 h-[340px]" // Fixed height for console
            >
                <ScrapeConsole />
            </motion.div>

            {/* 2. PDF ENGINE (INTERACTIVE) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="col-span-1 md:col-span-1 h-[340px]"
            >
                <PdfStudio />
            </motion.div>

            {/* 3. SCREENSHOT API (STATIC FOR NOW, UPGRADE LATER) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="col-span-1"
            >
                <Card className="h-full bg-zinc-900/50 border-zinc-800/50 hover:border-orange-500/50 transition-colors group rounded-md overflow-hidden">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-950/50 border border-zinc-800 text-orange-500 group-hover:scale-110 transition-transform">
                                <Camera className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-0.5">
                                4K Retina
                            </span>
                        </div>
                        <CardTitle className="text-xl text-zinc-100 uppercase tracking-widest font-bold">
                            Screenshot API
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-zinc-400 text-sm leading-relaxed mb-6 font-mono">
                            Capture full-page or specific element screenshots. Heavy pages loaded in milliseconds.
                        </CardDescription>
                        <Button
                            variant="secondary"
                            className="w-full bg-zinc-950 hover:bg-zinc-900 text-zinc-300 rounded-none border border-zinc-800 group-hover:border-orange-500/30 transition-colors"
                            onClick={() => router.push("/dashboard/laboratory?tab=shot")}
                        >
                            DEPLOY ENGINE <Zap className="ml-2 w-3 h-3 text-yellow-500" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 4. QR GENERATOR */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="col-span-1"
            >
                <Card className="h-full bg-zinc-900/50 border-zinc-800/50 hover:border-green-500/50 transition-colors group rounded-md overflow-hidden">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-950/50 border border-zinc-800 text-green-500 group-hover:scale-110 transition-transform">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-0.5">
                                SVG Export
                            </span>
                        </div>
                        <CardTitle className="text-xl text-zinc-100 uppercase tracking-widest font-bold">
                            QR Generator
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-zinc-400 text-sm leading-relaxed mb-6 font-mono">
                            Dynamic QR codes with logo embedding and custom error correction.
                        </CardDescription>
                        <Button
                            variant="secondary"
                            className="w-full bg-zinc-950 hover:bg-zinc-900 text-zinc-300 rounded-none border border-zinc-800 group-hover:border-green-500/30 transition-colors"
                            onClick={() => router.push("/dashboard/laboratory?tab=qr")}
                        >
                            DEPLOY ENGINE <Zap className="ml-2 w-3 h-3 text-yellow-500" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="col-span-1 md:col-span-2 lg:col-span-4 mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-zinc-600 font-mono text-[10px] gap-4"
            >
                <div className="flex gap-8 items-center">
                    <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        SYSTEM OPERATIONAL
                    </span>
                    <span className="text-zinc-700">|</span>
                    <span>V1.2.0-OBSIDIAN</span>
                    <span className="text-zinc-700">|</span>
                    <span>LATENCY: 12ms</span>
                </div>
                <div className="flex gap-4 uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                    <span>Encrypted</span>
                    <span>•</span>
                    <span>No Logs</span>
                    <span>•</span>
                    <span>God Mode</span>
                </div>
            </motion.div>
        </div>
    );
}
