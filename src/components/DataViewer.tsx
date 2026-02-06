
"use client";

import { useState } from "react";
import { Eye, Code, Copy, Check } from "lucide-react";

import { SharedApiResult } from "@/lib/types/schema";

interface DataViewerProps {
    data: SharedApiResult;
}

export default function DataViewer({ data }: DataViewerProps) {
    const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const markdownContent = data?.content || "";
    const jsonContent = JSON.stringify(data, null, 2);

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b] border-l border-[#333]">
            {/* Viewer Toolbar */}
            <div className="flex border-b border-[#333] shrink-0">
                <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors ${activeTab === "preview"
                        ? "bg-[#1a1a1a] text-white border-r border-[#333]"
                        : "text-[#666] hover:text-white border-r border-[#333]"
                        }`}
                >
                    <Eye size={12} />
                    Visual
                </button>
                <button
                    onClick={() => setActiveTab("raw")}
                    className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors ${activeTab === "raw"
                        ? "bg-[#1a1a1a] text-white border-r border-[#333]"
                        : "text-[#666] hover:text-white border-r border-[#333]"
                        }`}
                >
                    <Code size={12} />
                    Source_Data
                </button>
                <div className="flex-1" />
                <button
                    onClick={handleCopy}
                    className="px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-[#666] hover:text-[#FF4F00] transition-colors flex items-center gap-2"
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "COPIED" : "COPY_JSON"}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                {activeTab === "preview" ? (
                    <div className="p-8 max-w-3xl mx-auto prose prose-invert prose-sm">
                        {data.title && <h1 className="text-xl font-bold text-white mb-4">{data.title}</h1>}
                        {(data.metadata?.author || data.metadata?.date) && (
                            <div className="flex gap-4 mb-8 text-[10px] uppercase tracking-widest text-[#666] border-b border-[#333] pb-4">
                                {data.metadata?.author && <span>AUT: {String(data.metadata.author)}</span>}
                                {data.metadata?.date && <span>DAT: {String(data.metadata.date)}</span>}
                            </div>
                        )}

                        {(data.image || data.base64) && (
                            <div className="mb-8 rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-[#000] flex justify-center py-8">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={data.image || `data:${data.mime_type || 'image/png'};base64,${data.base64}`}
                                    alt="API Result"
                                    className="max-w-full h-auto max-h-[500px] object-contain"
                                />
                            </div>
                        )}

                        {data.records && (
                            <div className="space-y-4 mb-8">
                                <h3 className="text-white text-xs font-bold uppercase tracking-widest">DNS Records</h3>
                                <div className="bg-black/50 rounded-lg p-4 border border-white/5 font-mono text-[10px]">
                                    {data.records.map((record, i) => (
                                        <div key={i} className="py-1 border-b border-white/5 last:border-0 text-[#00E054]">
                                            {JSON.stringify(record, null, 2)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {markdownContent && (
                            <div className="whitespace-pre-wrap font-sans text-[#ccc] leading-relaxed text-sm">
                                {markdownContent}
                            </div>
                        )}

                        {data.url && !data.image && (
                            <div className="p-4 bg-white/5 rounded border border-white/10 flex items-center justify-between gap-4">
                                <span className="text-xs truncate">{data.url}</span>
                                <a
                                    href={data.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 bg-[#FF4F00] text-white text-[10px] font-bold rounded"
                                >
                                    OPEN_LINK
                                </a>
                            </div>
                        )}

                        {data.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                                ERROR: {data.error}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-0 h-full">
                        <textarea
                            className="w-full h-full bg-[#050505] text-[#00E054] font-mono text-xs p-6 outline-none resize-none leading-relaxed border-none"
                            value={jsonContent}
                            readOnly
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
