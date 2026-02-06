"use client";

import { useState } from "react";
import { Terminal, FileText, Mail, Camera, QrCode, Globe } from "lucide-react";
import PrecisionLoader from "./PrecisionLoader";
import DataViewer from "./DataViewer";
import { SharedApiResult } from "@/lib/types/schema";

type EngineType = "scrape" | "pdf" | "mail" | "shot" | "qr" | "dns";

export default function Laboratory() {
    const [engine, setEngine] = useState<EngineType>("scrape");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SharedApiResult | null>(null);
    const [status, setStatus] = useState<"IDLE" | "RUNNING" | "SUCCESS" | "ERROR">("IDLE");

    // Inputs
    const [url, setUrl] = useState("");
    const [format] = useState<"markdown" | "json">("markdown");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [html] = useState("");
    const [qrText, setQrText] = useState("");
    const [domain, setDomain] = useState("");

    const handleExecute = async () => {
        setLoading(true);
        setStatus("RUNNING");
        setResult(null);

        try {
            let endpoint = "";
            let body = {};

            switch (engine) {
                case "scrape":
                    endpoint = "/api/v1/scrape";
                    body = { url, format };
                    break;
                case "pdf":
                    endpoint = "/api/v1/pdf";
                    body = { url, format: "a4" };
                    break;
                case "mail":
                    endpoint = "/api/v1/mail";
                    body = { to: email, subject, html };
                    break;
                case "shot":
                    endpoint = "/api/v1/shot";
                    body = { url, full_page: true };
                    break;
                case "qr":
                    endpoint = "/api/v1/qr";
                    body = { text: qrText, color: "black" };
                    break;
                case "dns":
                    endpoint = "/api/v1/dns";
                    body = { domain, type: "A" };
                    break;
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": "lab-user-uuid" // Mock ID for Lab
                },
                body: JSON.stringify(body)
            });

            // Handle non-JSON responses (e.g. Vercel 500/504 HTML pages)
            const contentType = res.headers.get("content-type");
            let data;

            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("API Returned Non-JSON:", text);
                throw new Error(`API Error (${res.status}): ${res.statusText || "Unknown Error"}`);
            }

            if (res.ok && (data.success || data.records)) { // DNS returns records, others return success
                setResult(data.data || data); // Store the payload
                setStatus("SUCCESS");
            } else {
                setResult(data || { error: "Unknown API Error" });
                setStatus("ERROR");
            }

        } catch (err) {
            console.error("Lab Execution Error:", err);
            setResult({ error: err instanceof Error ? err.message : "Unknown Execution Failure" });
            setStatus("ERROR");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#09090b] border border-white/10 rounded-xl m-4 shadow-2xl relative">

            {/* Tab Bar (Engine Selector) */}
            <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-[#000]">
                {[
                    { id: "scrape", icon: Terminal, label: "Scrape" },
                    { id: "pdf", icon: FileText, label: "PDF" },
                    { id: "mail", icon: Mail, label: "Mail" },
                    { id: "shot", icon: Camera, label: "Shot" },
                    { id: "qr", icon: QrCode, label: "QR" },
                    { id: "dns", icon: Globe, label: "DNS" },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setEngine(item.id as EngineType); setResult(null); setStatus("IDLE"); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wide transition-all ${engine === item.id
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-[#666] hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <item.icon size={14} />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Control Deck (Inputs) */}
            <div className="h-14 border-b border-white/10 flex items-center px-4 gap-4 bg-[#09090b]">
                {loading && <PrecisionLoader />}

                {/* Status Dot */}
                <div className={`w-2 h-2 rounded-full ${status === "IDLE" ? "bg-white/20" : status === "RUNNING" ? "bg-[#FF4F00] animate-pulse" : status === "SUCCESS" ? "bg-[#00E054]" : "bg-red-500"}`} />

                {/* Dynamic Inputs */}
                <div className="flex-1 flex items-center gap-4">
                    {(engine === "scrape" || engine === "pdf" || engine === "shot") && (
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-white/20"
                        />
                    )}
                    {engine === "mail" && (
                        <>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="recipient@example.com" className="bg-transparent text-white font-mono text-xs outline-none w-48 border-b border-white/10" />
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject..." className="flex-1 bg-transparent text-white font-mono text-xs outline-none" />
                        </>
                    )}
                    {engine === "qr" && (
                        <input
                            type="text"
                            value={qrText}
                            onChange={(e) => setQrText(e.target.value)}
                            placeholder="Enter text for QR Code..."
                            className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-white/20"
                        />
                    )}
                    {engine === "dns" && (
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="example.com"
                            className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-white/20"
                        />
                    )}
                </div>

                {/* Execute Button */}
                <button
                    onClick={handleExecute}
                    disabled={loading}
                    className="bg-[#FF4F00] text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#FF6F30] rounded-[2px] disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? "PROCESSING" : "EXECUTE"}
                </button>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 flex overflow-hidden relative bg-[#050505] font-mono text-xs text-[#888]">
                {!result && !loading && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none pointer-events-none">
                        <div className="text-center space-y-2">
                            <Terminal size={32} className="mx-auto text-white/20" />
                            <p>AWAITING COMMAND</p>
                        </div>
                    </div>
                )}
                {result && <DataViewer data={result} />}
            </div>
        </div>
    );
}
