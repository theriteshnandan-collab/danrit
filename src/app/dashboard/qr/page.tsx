"use client";

import { useState } from "react";
import { QrCode, Download, Loader2 } from "lucide-react";

export default function QRPage() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate() {
        if (!text) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/v1/qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, color: "black" })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setResult(data.data.qr || data.data.base64);
            } else {
                setError(data.error || "QR code generation failed");
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
                <span className="label">TOOL / QR CODE</span>
                <h1 className="text-3xl font-heading mt-2">QR CODE GENERATOR</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Generate high-resolution QR codes for URLs, text, or any data.</p>
            </div>

            {/* INPUT */}
            <div className="panel p-6">
                <label className="label">CONTENT</label>
                <div className="flex gap-4 mt-3">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="https://yoursite.com or any text..."
                        className="flex-1 bg-transparent border border-[var(--border)] px-4 py-3 text-sm font-mono focus:border-[var(--bone)] outline-none transition-colors"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !text}
                        className="btn-primary px-6 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                        {loading ? "GENERATING..." : "GENERATE"}
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
                        <span className="label">QR CODE READY</span>
                        <a
                            href={result.startsWith("data:") ? result : `data:image/png;base64,${result}`}
                            download="danrit-qr.png"
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download size={14} />
                            DOWNLOAD PNG
                        </a>
                    </div>
                    <div className="flex justify-center p-8 bg-white rounded">
                        <img
                            src={result.startsWith("data:") ? result : `data:image/png;base64,${result}`}
                            alt="QR Code"
                            className="max-w-[300px]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
