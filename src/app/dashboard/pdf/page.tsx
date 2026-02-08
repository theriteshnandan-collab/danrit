"use client";

import { useState } from "react";
import { FileText, Download, Copy, Check, Loader2 } from "lucide-react";

export default function PDFPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleGenerate() {
        if (!url) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/v1/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, format: "a4" })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setResult(data.data.url || data.data.base64);
            } else {
                // Parse detailed error
                let errorMsg = data.error || "PDF generation failed";
                if (data.message) errorMsg += `: ${data.message}`;
                if (data.credits_remaining !== undefined) errorMsg += ` (Credits: ${data.credits_remaining})`;
                setError(errorMsg);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">TOOL / PDF</span>
                <h1 className="text-3xl font-heading mt-2">PDF GENERATOR</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Convert any webpage to a high-quality PDF document.</p>
            </div>

            {/* INPUT */}
            <div className="panel p-6">
                <label className="label">WEBPAGE URL</label>
                <div className="flex gap-4 mt-3">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="flex-1 bg-transparent border border-[var(--border)] px-4 py-3 text-sm font-mono focus:border-[var(--bone)] outline-none transition-colors"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !url}
                        className="btn-primary px-6 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                        {loading ? "GENERATING..." : "GENERATE PDF"}
                    </button>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="panel p-4 border-[var(--signal-red)] bg-[var(--signal-red)]/10">
                    <p className="text-sm text-[var(--signal-red)]">{error}</p>
                </div>
            )}

            {/* RESULT */}
            {result && (
                <div className="panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="label">PDF READY</span>
                        <div className="flex gap-2">
                            <a
                                href={result.startsWith("data:") ? result : result}
                                download="danrit-export.pdf"
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Download size={14} />
                                DOWNLOAD
                            </a>
                        </div>
                    </div>
                    <div className="bg-[var(--border)] p-8 flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <FileText size={48} className="mx-auto text-[var(--ash)]" />
                            <p className="text-sm text-[var(--ash)] mt-4">PDF generated successfully</p>
                            <p className="text-xs text-[var(--ash)]/60 mt-2 font-mono">{url}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
