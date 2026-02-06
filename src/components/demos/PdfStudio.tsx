"use client";

import { useState } from "react";
import { FileText, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PdfStudio() {
    const [html, setHtml] = useState("<h1>Invoice #001</h1><p>Billed to: Acme Corp</p><p>Total: $5,000.00</p>");
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const generatePdf = async () => {
        setLoading(true);
        // Special logic: The demo proxy doesn't handle RAW HTML yet (only URLs).
        // Let's adjust the demo proxy OR send a data URL?
        // Wait, for this demo we might need to update the proxy or client-side trick.
        // Actually, let's just use the proxy logic but pass HTML if supported?
        // Proxy currently expects URL.
        // Hack for demo: Pass a data URI of the HTML!
        const dataUrl = `data:text/html,${encodeURIComponent(html)}`;

        try {
            const res = await fetch("/api/demo/pdf", {
                method: "POST",
                body: JSON.stringify({ url: dataUrl }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.success) {
                setPdfUrl(`data:application/pdf;base64,${data.data.base64}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] border border-zinc-800/50 rounded-lg overflow-hidden group hover:border-red-500/30 transition-all duration-500">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">PDF-Jet Studio</span>
                </div>
                <Button
                    size="sm"
                    className="h-5 text-[9px] bg-white text-black hover:bg-zinc-200"
                    onClick={generatePdf}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current mr-1" />}
                    RENDER
                </Button>
            </div>

            {/* SPLIT VIEW */}
            <div className="flex-1 flex overflow-hidden">
                {/* EDITOR */}
                <div className="w-1/2 p-0 border-r border-zinc-800 bg-black">
                    <textarea
                        className="w-full h-full bg-transparent text-zinc-300 font-mono text-[10px] p-3 resize-none focus:outline-none"
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        spellCheck={false}
                    />
                </div>

                {/* PREVIEW */}
                <div className="w-1/2 bg-zinc-900/50 flex items-center justify-center relative">
                    {pdfUrl ? (
                        <iframe src={pdfUrl + "#toolbar=0&navpanes=0"} className="w-full h-full border-none" />
                    ) : (
                        <div className="text-center opacity-30">
                            <div className="w-16 h-20 border-2 border-dashed border-zinc-600 mx-auto mb-2 rounded" />
                            <span className="text-[9px] uppercase tracking-widest">Preview</span>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
