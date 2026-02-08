"use client";

import { useState } from "react";
import { Camera, Download, Loader2 } from "lucide-react";

export default function ScreenshotPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleCapture() {
        if (!url) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/v1/shot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, full_page: true })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setResult(data.data.screenshot || data.data.base64);
            } else {
                setError(data.error || "Screenshot capture failed");
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
                <span className="label">TOOL / SCREENSHOT</span>
                <h1 className="text-3xl font-heading mt-2">SCREENSHOT ENGINE</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Capture full-page screenshots of any website in high resolution.</p>
            </div>

            {/* INPUT */}
            <div className="panel p-6">
                <label className="label">TARGET URL</label>
                <div className="flex gap-4 mt-3">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 bg-transparent border border-[var(--border)] px-4 py-3 text-sm font-mono focus:border-[var(--bone)] outline-none transition-colors"
                    />
                    <button
                        onClick={handleCapture}
                        disabled={loading || !url}
                        className="btn-primary px-6 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        {loading ? "CAPTURING..." : "CAPTURE"}
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
                        <span className="label">SCREENSHOT CAPTURED</span>
                        <a
                            href={result.startsWith("data:") ? result : `data:image/png;base64,${result}`}
                            download="danrit-screenshot.png"
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download size={14} />
                            DOWNLOAD PNG
                        </a>
                    </div>
                    <div className="bg-[var(--border)] p-2 rounded max-h-[600px] overflow-auto">
                        <img
                            src={result.startsWith("data:") ? result : `data:image/png;base64,${result}`}
                            alt="Screenshot"
                            className="w-full rounded"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
