
"use client";

import { useState } from "react";
import { Eye, Code, Copy, Check } from "lucide-react";

interface DataViewerProps {
    data: any; // The scrape result object
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
                        {/* Simple Markdown Rendering (For MVP, we just display text comfortably) */}
                        <h1 className="text-xl font-bold text-white mb-4">{data.title}</h1>
                        <div className="flex gap-4 mb-8 text-[10px] uppercase tracking-widest text-[#666] border-b border-[#333] pb-4">
                            {data.metadata?.author && <span>AUT: {data.metadata.author}</span>}
                            {data.metadata?.date && <span>DAT: {data.metadata.date}</span>}
                        </div>

                        <div className="whitespace-pre-wrap font-sans text-[#ccc] leading-relaxed text-sm">
                            {markdownContent}
                        </div>
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
