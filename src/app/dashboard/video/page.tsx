"use client";

import { useState } from "react";
import { Search, Loader2, Download, Video, Play, ExternalLink } from "lucide-react";

interface VideoMetadata {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: number;
    uploader: string;
    platform: string;
    view_count: number;
}

export default function VideoPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    async function handleGetInfo() {
        if (!url) return;
        setLoading(true);
        setError(null);
        setMetadata(null);

        try {
            const res = await fetch("/api/v1/video/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });

            const data = await res.json();
            if (!res.ok) {
                let errorMsg = data.error || "Analysis failed";
                if (data.message) errorMsg += `: ${data.message}`;
                if (data.details) errorMsg += ` | Details: ${data.details}`;
                if (data.target) errorMsg += ` | Target: ${data.target}`;
                if (data.credits_remaining !== undefined) errorMsg += ` (Credits: ${data.credits_remaining})`;
                throw new Error(errorMsg);
            }

            setMetadata(data.data);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload() {
        if (!url) return;
        setDownloading(true);
        setError(null);
        try {
            const res = await fetch("/api/v1/video/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });

            if (!res.ok) {
                // If error, the response is JSON
                const data = await res.json();
                let errorMsg = data.error || "Failed to download video";
                if (data.message) errorMsg += `: ${data.message}`;
                if (data.credits_remaining !== undefined) errorMsg += ` (Credits: ${data.credits_remaining})`;
                throw new Error(errorMsg);
            }

            // 🔥 SUCCESS: The response is a binary stream (video bytes)
            const blob = await res.blob();

            // Extract filename from Content-Disposition header
            const disposition = res.headers.get("content-disposition");
            let filename = "danrit-video.mp4";
            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            // Create a download link from the blob
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup the blob URL after download starts
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch (err: any) {
            setError(err.message || "Download failed");
        } finally {
            setDownloading(false);
        }
    }

    function formatDuration(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">TOOL / VIDEO</span>
                <h1 className="text-3xl font-heading mt-2">Video Intelligence</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Extract metadata and download streams from major platforms.</p>
            </div>

            {/* INPUT PANEL */}
            <div className="panel">
                <div className="panel-header">
                    <span className="label">VIDEO URL</span>
                </div>
                <div className="panel-body flex gap-2">
                    <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="input-industrial flex-1 text-lg"
                        onKeyDown={(e) => e.key === "Enter" && handleGetInfo()}
                    />
                    <button
                        onClick={handleGetInfo}
                        disabled={loading || !url}
                        className="btn-primary w-32 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        ANALYZE
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

            {/* RESULTS */}
            {metadata && (
                <div className="panel animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="panel-header flex items-center justify-between">
                        <span className="label">TARGET ACQUIRED</span>
                        <span className="label text-[var(--signal-orange)]">{metadata.platform.toUpperCase()}</span>
                    </div>
                    <div className="panel-body grid md:grid-cols-[300px_1fr] gap-8">
                        {/* THUMBNAIL */}
                        <div className="relative aspect-video bg-black rounded border border-[var(--border)] overflow-hidden group">
                            <img
                                src={metadata.thumbnail}
                                alt={metadata.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-[var(--void)]/50 backdrop-blur-sm p-3 rounded-full border border-[var(--bone)]">
                                    <Play size={24} className="fill-[var(--bone)]" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-xs font-mono text-[var(--bone)] rounded">
                                {formatDuration(metadata.duration)}
                            </div>
                        </div>

                        {/* INFO */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-heading leading-tight">{metadata.title}</h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-[var(--ash)]">
                                    <span className="flex items-center gap-1">
                                        <Video size={14} />
                                        {metadata.uploader}
                                    </span>
                                    <span>•</span>
                                    <span>{metadata.view_count.toLocaleString()} Views</span>
                                </div>
                            </div>

                            <p className="text-sm text-[var(--ash)] line-clamp-3 leading-relaxed">
                                {metadata.description}
                            </p>

                            <div className="flex items-center gap-4 pt-4 border-t border-[var(--border)]">
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
                                >
                                    {downloading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            RESOLVING STREAM...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={18} />
                                            DOWNLOAD STREAM
                                        </>
                                    )}
                                </button>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-ghost px-4 py-3 border border-[var(--border)] hover:border-[var(--bone)]"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
