"use client";

import { useState } from "react";
import { Terminal, Send, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ScrapeConsole() {
    const [url, setUrl] = useState("https://example.com");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const runScrape = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/demo/scrape", {
                method: "POST",
                body: JSON.stringify({ url, format: "markdown" }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();

            if (!res.ok) {
                setResult(JSON.stringify(data, null, 2));
            } else {
                setResult(data.data.markdown || JSON.stringify(data.data, null, 2));
            }
        } catch (err) {
            setResult(JSON.stringify({ error: String(err) }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] border border-zinc-800/50 rounded-lg overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
            {/* TERMINAL HEADER */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Scrape-Jet V1</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                </div>
            </div>

            {/* TERMINAL BODY */}
            <div className="flex-1 p-4 font-mono text-xs overflow-hidden flex flex-col relative">
                <div className="flex items-center gap-2 mb-4 bg-black/50 p-2 rounded border border-zinc-800/50 focus-within:border-blue-500/50 transition-colors">
                    <span className="text-blue-500">$</span>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-transparent border-none outline-none text-zinc-300 w-full placeholder:text-zinc-700"
                        placeholder="https://..."
                    />
                    <Button
                        size="icon"
                        className="h-6 w-6 bg-blue-600 hover:bg-blue-500 text-white rounded-sm"
                        onClick={runScrape}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    </Button>
                </div>

                {/* OUTPUT WINDOW */}
                <div className="flex-1 bg-black/40 rounded border border-zinc-800/30 p-3 overflow-y-auto text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-800">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col gap-1"
                            >
                                <span className="text-blue-500/50">{">"} Initializing Chrome Headless...</span>
                                <span className="text-blue-500/50">{">"} Bypassing Cloudflare...</span>
                                <span className="text-blue-500/50 animate-pulse">{">"} Extracting DOM...</span>
                            </motion.div>
                        ) : result ? (
                            <motion.pre
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="whitespace-pre-wrap text-[10px] leading-relaxed text-green-400/80"
                            >
                                {result.slice(0, 500)}{result.length > 500 && "..."}
                            </motion.pre>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-2 opacity-50">
                                <Lock className="w-4 h-4" />
                                <span>Ready to Scrape</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* FOOTER STATS */}
            <div className="px-4 py-2 bg-black/80 border-t border-white/5 flex justify-between text-[9px] text-zinc-500 font-mono uppercase tracking-wider relative z-10">
                <span>Latency: {loading ? "CALCULATING..." : "24ms"}</span>
                <span className="text-blue-500/80">Proxy: SECURE</span>
            </div>
        </div>
    );
}
