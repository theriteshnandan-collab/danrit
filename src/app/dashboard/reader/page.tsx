"use client";

import { useState } from "react";
import { Send, Loader2, Copy, Check, Workflow, FileText } from "lucide-react";

interface ScrapeResult {
    title: string;
    content: string;
    textContent: string;
    url: string; // Lifted for easier access
    metadata: {
        byline: string | null;
        siteName: string | null;
        url: string;
    };
    screenshot?: string;
    schema?: any[];
}

interface CrawlResult {
    pages: ScrapeResult[];
    stats: {
        pagesScraped: number;
        linksDiscovered: number;
        duration: number;
    };
}

export default function ReaderPage() {
    const [url, setUrl] = useState("");
    const [render, setRender] = useState(true);
    const [screenshot, setScreenshot] = useState(false);
    const [crawlMode, setCrawlMode] = useState(false);
    const [maxPages, setMaxPages] = useState(5);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScrapeResult | null>(null);
    const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleScrape() {
        if (!url) return;

        // Sanitize Input (Fix user typos like HTTPS:\\)
        const sanitizedUrl = url.replace(/\\/g, "/").replace(/^(http[s]?):\/([^\/])/, "$1://$2");
        if (sanitizedUrl !== url) setUrl(sanitizedUrl);

        setLoading(true);
        setError(null);
        setResult(null);
        setCrawlResult(null);

        try {
            const endpoint = "/api/v1/scrape";
            const body = {
                url: sanitizedUrl,
                render,
                screenshot,
                crawlMode,
                maxPages: crawlMode ? maxPages : undefined,
                maxDepth: 3 // Increased depth for "Full Scrape" feel
            };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const isJson = res.headers.get("content-type")?.includes("application/json");
            const data = isJson ? await res.json() : null;

            if (!res.ok) {
                // Parse detailed error (especially for Rate Limits)
                let errorMsg = data?.error || "Unknown Error";
                if (data?.message) errorMsg += `: ${data.message}`;
                if (data?.credits_remaining !== undefined) errorMsg += ` (Credits: ${data.credits_remaining})`;
                throw new Error(`Server Error (${res.status}): ${errorMsg}`);
            }

            if (crawlMode) {
                setCrawlResult(data.data);
            } else {
                setResult(data.data);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Scrape failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard(content: string) {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">TOOL / SCRAPER</span>
                <h1 className="text-3xl font-heading mt-2">Phantom Scraper</h1>
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

                    {/* OPTIONS ROW 1 */}
                    <div className="flex items-center gap-6 flex-wrap">
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

                    {/* CRAWL MODE TOGGLE */}
                    <div className="border-t border-[var(--border)] pt-4 space-y-3">
                        <label className="flex items-center gap-3 text-xs uppercase tracking-wider cursor-pointer">
                            <input
                                type="checkbox"
                                checked={crawlMode}
                                onChange={(e) => setCrawlMode(e.target.checked)}
                                className="w-5 h-5 bg-transparent border-2 border-[var(--signal-orange)] checked:bg-[var(--signal-orange)] checked:border-[var(--signal-orange)]"
                            />
                            <Workflow size={16} className={crawlMode ? "text-[var(--signal-orange)]" : "text-[var(--ash)]"} />
                            <span className={crawlMode ? "text-[var(--signal-orange)]" : "text-[var(--ash)]"}>
                                PHANTOM CRAWLER (Multi-Page)
                            </span>
                        </label>

                        {crawlMode && (
                            <div className="flex items-center gap-4 pl-8">
                                <span className="text-xs text-[var(--ash)]">MAX PAGES:</span>
                                <input
                                    type="range"
                                    min={2}
                                    max={20}
                                    value={maxPages}
                                    onChange={(e) => setMaxPages(parseInt(e.target.value))}
                                    className="w-32 accent-[var(--signal-orange)]"
                                />
                                <span className="text-sm font-mono text-[var(--bone)]">{maxPages}</span>
                            </div>
                        )}
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
                                {crawlMode ? "CRAWLING..." : "EXTRACTING..."}
                            </>
                        ) : (
                            <>
                                {crawlMode ? <Workflow size={18} /> : <Send size={18} />}
                                {crawlMode ? "ACTIVATE CRAWLER" : "ACTIVATE SCRAPER"}
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

            {/* SINGLE PAGE RESULT */}
            {result && !crawlMode && (
                <div className="space-y-6">
                    {result.screenshot && (
                        <div className="panel overflow-hidden">
                            <div className="panel-header">
                                <span className="label">VISUAL CAPTURE</span>
                            </div>
                            <div className="relative w-full aspect-video bg-black">
                                <img
                                    src={result.screenshot}
                                    alt="Scraped Screenshot"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    )}

                    <div className="panel">
                        <div className="panel-header flex items-center justify-between">
                            <div className="flex gap-4">
                                <button className="label border-b-2 border-transparent hover:border-[var(--bone)] pb-1 transition-all">EXTRACTED CONTENT</button>
                                {result.schema && result.schema.length > 0 && (
                                    <button className="label text-[var(--signal-orange)] border-b-2 border-[var(--signal-orange)] pb-1">SCHEMA EXPLORER ({result.schema.length})</button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(JSON.stringify(result.schema, null, 2))}
                                    className="btn-secondary flex items-center gap-2 text-[10px]"
                                >
                                    JSON
                                </button>
                                <button onClick={() => copyToClipboard(result.content)} className="btn-secondary flex items-center gap-2">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? "COPIED" : "COPY"}
                                </button>
                            </div>
                        </div>
                        <div className="panel-body">
                            {result.schema && result.schema.length > 0 ? (
                                <pre className="font-mono text-[10px] text-[var(--signal-orange)]/80 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed bg-black/30 p-4 rounded">
                                    {JSON.stringify(result.schema, null, 2)}
                                </pre>
                            ) : (
                                <pre className="font-mono text-xs text-[var(--ash)] whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                                    {result.content}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CRAWL RESULT */}
            {crawlResult && crawlMode && (
                <div className="space-y-6">
                    {/* STATS BAR */}
                    <div className="panel">
                        <div className="panel-header">
                            <span className="label">CRAWL STATISTICS</span>
                        </div>
                        <div className="panel-body">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-heading text-[var(--signal-orange)]">{crawlResult.stats.pagesScraped}</div>
                                    <div className="text-xs text-[var(--ash)]">PAGES SCRAPED</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-heading text-[var(--bone)]">{crawlResult.stats.linksDiscovered}</div>
                                    <div className="text-xs text-[var(--ash)]">LINKS FOUND</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-heading text-[var(--bone)]">{crawlResult.stats.duration.toFixed(1)}s</div>
                                    <div className="text-xs text-[var(--ash)]">DURATION</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAGE LIST */}
                    {crawlResult.pages.map((page, idx) => (
                        <div key={idx} className="panel">
                            <div className="panel-header flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText size={16} className="text-[var(--ash)]" />
                                    <div>
                                        <span className="label">PAGE {idx + 1}</span>
                                        <h3 className="text-lg font-heading mt-1">{page.title || "Untitled"}</h3>
                                        <p className="text-xs text-[var(--ash)] mt-1 truncate max-w-md">{page.url}</p>
                                    </div>
                                </div>
                                <button onClick={() => copyToClipboard(page.content)} className="btn-secondary flex items-center gap-2">
                                    <Copy size={14} />
                                    COPY
                                </button>
                            </div>
                            <div className="panel-body">
                                <pre className="font-mono text-xs text-[var(--ash)] whitespace-pre-wrap max-h-[200px] overflow-y-auto leading-relaxed">
                                    {page.content.slice(0, 1000)}{page.content.length > 1000 ? "..." : ""}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
