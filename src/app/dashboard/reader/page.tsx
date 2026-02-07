"use client";

import { useState } from "react";
import { Send, Loader2, Copy, Check } from "lucide-react";

interface ScrapeResult {
    title: string;
    content: string;
    textContent: string;
    metadata: {
        byline: string | null;
        siteName: string | null;
        url: string;
    };
}

export default function ReaderPage() {
    const [url, setUrl] = useState("");
    const [render, setRender] = useState(true);
    const [screenshot, setScreenshot] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScrapeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleScrape() {
        if (!url) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/v1/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, render, screenshot })
            });

            const isJson = res.headers.get("content-type")?.includes("application/json");
            const data = isJson ? await res.json() : null;

            if (!res.ok) {
                const errorMsg = data?.error || await res.text() || "Unknown Error";
                throw new Error(`Server Error (${res.status}): ${errorMsg}`);
            }

            setResult(data.data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Scrape failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard() {
        if (result) {
            navigator.clipboard.writeText(result.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">TOOL / READER</span>
                <h1 className="text-3xl font-heading mt-2">Web Scraper</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Extract clean content from any URL using stealth browsing.</p>
            </div>

            {/* INPUT PANEL */}
            <div className="panel">
                <div className="panel-header">
                    <span className="label">TARGET URL</span>
                </div>
                <div className="panel-body space-y-4">
                    <input
                        type="url"
                        placeholder="https://example.com/article"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="input-industrial text-lg"
                        onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                    />

                    {/* OPTIONS */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer">
                            <input
                                type="checkbox"
                                checked={render}
                                onChange={(e) => setRender(e.target.checked)}
                                className="w-4 h-4 bg-transparent border-2 border-[var(--border)] checked:bg-[var(--bone)] checked:border-[var(--bone)]"
                            />
                            <span className={render ? "text-[var(--bone)]" : "text-[var(--ash)]"}>RENDER VISUAL</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer">
                            <input
                                type="checkbox"
                                checked={screenshot}
                                onChange={(e) => setScreenshot(e.target.checked)}
                                className="w-4 h-4 bg-transparent border-2 border-[var(--border)] checked:bg-[var(--bone)] checked:border-[var(--bone)]"
                            />
                            <span className={screenshot ? "text-[var(--bone)]" : "text-[var(--ash)]"}>SCREENSHOT</span>
                        </label>
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={handleScrape}
                        disabled={loading || !url}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                EXTRACTING...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                ACTIVATE READER
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="panel border-[var(--signal-red)]">
                    <div className="p-6 text-[var(--signal-red)]">
                        <span className="label text-[var(--signal-red)]">ERROR</span>
                        <p className="mt-2">{error}</p>
                    </div>
                </div>
            )}

            {/* RESULT */}
            {result && (
                <div className="panel">
                    <div className="panel-header flex items-center justify-between">
                        <div>
                            <span className="label">EXTRACTED CONTENT</span>
                            <h2 className="text-xl font-heading mt-1">{result.title}</h2>
                            {result.metadata.siteName && (
                                <p className="text-xs text-[var(--ash)] mt-1">{result.metadata.siteName}</p>
                            )}
                        </div>
                        <button onClick={copyToClipboard} className="btn-secondary flex items-center gap-2">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "COPIED" : "COPY"}
                        </button>
                    </div>
                    <div className="panel-body">
                        <pre className="font-mono text-xs text-[var(--ash)] whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                            {result.content}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
