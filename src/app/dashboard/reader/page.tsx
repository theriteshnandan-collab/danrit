"use client";

import { useState } from "react";
import { Send, Loader2, Copy, Check, Workflow, FileText } from "lucide-react";

interface DeepMineResult {
    meta: {
        status: number;
        version: string;
        timestamp: string;
        processing_time_ms: number;
    };
    source: {
        url: string;
        domain: string;
        title: string;
        author?: string;
        date_published?: string;
    };
    content: {
        markdown: string;
        html_clean?: string;
        excerpt?: string;
        language: string;
    };
    deep_mine: {
        structured_data?: any[];
        social_graph?: {
            og_image?: string;
            site_name?: string;
            type?: string;
            keywords?: string[];
        };
        hidden_state?: {
            next_data?: any;
            nuxt_data?: any;
            apollo_state?: any;
            redux_state?: any;
        };
        outgoing_links?: string[];
    };
    debug?: {
        stealth_mode: boolean;
        engine: string;
    };
}

export default function ReaderPage() {
    const [url, setUrl] = useState("");
    const [render, setRender] = useState(true);
    const [screenshot, setScreenshot] = useState(false);
    const [crawlMode, setCrawlMode] = useState(false);
    const [maxPages, setMaxPages] = useState(5);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DeepMineResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'json' | 'links' | 'metadata' | 'hidden'>('content');
    const [isMaximized, setIsMaximized] = useState(false);

    async function handleScrape() {
        if (!url) return;

        // Sanitize Input (Fix user typos like HTTPS:\\)
        const sanitizedUrl = url.replace(/\\/g, "/").replace(/^(http[s]?):\/([^\/])/, "$1://$2");
        if (sanitizedUrl !== url) setUrl(sanitizedUrl);

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const endpoint = "/api/v1/scrape";
            const body = {
                url: sanitizedUrl,
                render,
                screenshot,
                crawlMode: false, // Force single page for Deep Mine focus for now
                maxPages: undefined,
                maxDepth: 3
            };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const isJson = res.headers.get("content-type")?.includes("application/json");
            const data = isJson ? await res.json() : null;

            console.log("🔍 [DEBUG] Phantom Protocol Response:", data);

            if (!res.ok) {
                let errorMsg = data?.error || "Unknown Error";
                if (data?.message) errorMsg += `: ${data.message}`;
                if (data?.details) errorMsg += ` | Details: ${data.details}`;
                throw new Error(`Server Error (${res.status}): ${errorMsg}`);
            }

            // The API now returns the direct object, not wrapped in { data: ... }
            setResult(data);
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

    // Helper to count hidden state keys
    const getHiddenStateCount = () => {
        if (!result?.deep_mine.hidden_state) return 0;
        return Object.values(result.deep_mine.hidden_state).filter(v => v !== null).length;
    };

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">TOOL / PHANTOM READER</span>
                <h1 className="text-3xl font-heading mt-2">Phantom Protocol</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Deep infiltration engine. Extracts hydration states, JSON-LD, and raw content.</p>
            </div>

            {/* INPUT PANEL */}
            <div className={`panel ${isMaximized ? 'hidden' : ''}`}> {/* Hide input when maximized */}
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
                    <button
                        onClick={handleScrape}
                        disabled={loading || !url}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                INFILTRATING...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                ENGAGE PHANTOM PROTOCOL
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
                <div className="space-y-6">
                    {/* STATS BAR */}
                    <div className={`panel ${isMaximized ? 'hidden' : ''}`}>
                        <div className="panel-body grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-xl font-heading text-[var(--bone)]">{result.meta.processing_time_ms}ms</div>
                                <div className="text-xs text-[var(--ash)]">LATENCY</div>
                            </div>
                            <div>
                                <div className="text-xl font-heading text-[var(--signal-orange)]">{result.deep_mine.structured_data?.length || 0}</div>
                                <div className="text-xs text-[var(--ash)]">JSON-LD BLOCKS</div>
                            </div>
                            <div>
                                <div className="text-xl font-heading text-[var(--bone)]">{result.deep_mine.outgoing_links?.length || 0}</div>
                                <div className="text-xs text-[var(--ash)]">LINKS</div>
                            </div>
                            <div>
                                <div className="text-xl font-heading text-[var(--signal-green)]">{result.debug?.engine}</div>
                                <div className="text-xs text-[var(--ash)]">ENGINE</div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT UNIT */}
                    <div className={`panel transition-all duration-300 ${isMaximized ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : ''}`}>
                        <div className="panel-header flex items-center justify-between overflow-x-auto shrink-0">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`label border-b-2 pb-1 transition-all ${activeTab === 'content' ? 'border-[var(--signal-orange)] text-[var(--signal-orange)]' : 'border-transparent hover:border-[var(--bone)]'}`}
                                >
                                    CONTENT
                                </button>
                                {result.deep_mine.structured_data && result.deep_mine.structured_data.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('json')}
                                        className={`label border-b-2 pb-1 transition-all ${activeTab === 'json' ? 'border-[var(--signal-orange)] text-[var(--signal-orange)]' : 'border-transparent hover:border-[var(--bone)]'}`}
                                    >
                                        JSON-LD ({result.deep_mine.structured_data.length})
                                    </button>
                                )}
                                {getHiddenStateCount() > 0 && (
                                    <button
                                        onClick={() => setActiveTab('hidden')}
                                        className={`label border-b-2 pb-1 transition-all ${activeTab === 'hidden' ? 'border-[var(--signal-orange)] text-[var(--signal-orange)]' : 'border-transparent hover:border-[var(--bone)]'}`}
                                    >
                                        HYDRATION STATE ({getHiddenStateCount()})
                                    </button>
                                )}
                                {result.deep_mine.outgoing_links && result.deep_mine.outgoing_links.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('links')}
                                        className={`label border-b-2 pb-1 transition-all ${activeTab === 'links' ? 'border-[var(--signal-orange)] text-[var(--signal-orange)]' : 'border-transparent hover:border-[var(--bone)]'}`}
                                    >
                                        LINKS ({result.deep_mine.outgoing_links.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('metadata')}
                                    className={`label border-b-2 pb-1 transition-all ${activeTab === 'metadata' ? 'border-[var(--signal-orange)] text-[var(--signal-orange)]' : 'border-transparent hover:border-[var(--bone)]'}`}
                                >
                                    METADATA
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="btn-secondary flex items-center gap-2 text-[10px]"
                                    title={isMaximized ? "Minimize" : "Maximize view"}
                                >
                                    {isMaximized ? "MINIMIZE" : "EXPAND"}
                                </button>
                                <button onClick={() => copyToClipboard(JSON.stringify(result, null, 2))} className="btn-secondary flex items-center gap-2 text-[10px]">
                                    GOD JSON
                                </button>
                                <button onClick={() => copyToClipboard(result.content.markdown)} className="btn-secondary flex items-center gap-2">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? "COPIED" : "COPY"}
                                </button>
                            </div>
                        </div>
                        <div className={`panel-body ${isMaximized ? 'flex-1 overflow-hidden p-0' : ''}`}>
                            {activeTab === 'content' && (
                                <pre className={`font-mono text-xs text-[var(--ash)] whitespace-pre-wrap ${isMaximized ? 'h-full p-6' : 'max-h-[500px]'} overflow-y-auto leading-relaxed`}>
                                    {result.content.markdown}
                                </pre>
                            )}
                            {activeTab === 'json' && result.deep_mine.structured_data && (
                                <pre className={`font-mono text-[10px] text-[var(--signal-orange)]/80 whitespace-pre-wrap ${isMaximized ? 'h-full p-6' : 'max-h-[500px] bg-black/30 p-4 rounded'} overflow-y-auto leading-relaxed`}>
                                    {JSON.stringify(result.deep_mine.structured_data, null, 2)}
                                </pre>
                            )}
                            {activeTab === 'hidden' && result.deep_mine.hidden_state && (
                                <pre className={`font-mono text-[10px] text-[var(--signal-blue)]/80 whitespace-pre-wrap ${isMaximized ? 'h-full p-6' : 'max-h-[500px] bg-black/30 p-4 rounded'} overflow-y-auto leading-relaxed`}>
                                    {JSON.stringify(result.deep_mine.hidden_state, null, 2)}
                                </pre>
                            )}
                            {activeTab === 'links' && result.deep_mine.outgoing_links && (
                                <div className={`${isMaximized ? 'h-full p-6' : 'max-h-[500px]'} overflow-y-auto space-y-2`}>
                                    {result.deep_mine.outgoing_links.map((link, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs font-mono text-[var(--ash)] border-b border-[var(--border)] pb-2 last:border-0">
                                            <span className="text-[var(--bone)] opacity-50">{i + 1}.</span>
                                            <a href={link} target="_blank" rel="noreferrer" className="hover:text-[var(--signal-orange)] truncate underline decoration-dotted">
                                                {link}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeTab === 'metadata' && (
                                <div className={`${isMaximized ? 'h-full p-6' : ''} overflow-y-auto`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-[var(--border)] p-3 rounded">
                                            <div className="label text-[10px] opacity-70 mb-1">Source Domain</div>
                                            <div className="text-xs font-mono text-[var(--bone)]">{result.source.domain}</div>
                                        </div>
                                        <div className="border border-[var(--border)] p-3 rounded">
                                            <div className="label text-[10px] opacity-70 mb-1">Author</div>
                                            <div className="text-xs font-mono text-[var(--bone)]">{result.source.author || "N/A"}</div>
                                        </div>
                                        <div className="border border-[var(--border)] p-3 rounded">
                                            <div className="label text-[10px] opacity-70 mb-1">Date</div>
                                            <div className="text-xs font-mono text-[var(--bone)]">{result.source.date_published || "N/A"}</div>
                                        </div>
                                        {result.deep_mine.social_graph && Object.entries(result.deep_mine.social_graph).map(([key, value]) => (
                                            value && typeof value === 'string' && (
                                                <div key={key} className="border border-[var(--border)] p-3 rounded">
                                                    <div className="label text-[10px] opacity-70 mb-1">{key.replace('_', ' ').toUpperCase()}</div>
                                                    <div className="text-xs font-mono text-[var(--bone)] break-words">{String(value)}</div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
