"use client";

import { useState } from "react";
import { Globe, Loader2, Copy, Check } from "lucide-react";

interface DNSRecord {
    type: string;
    value: string;
    ttl?: number;
}

export default function DNSPage() {
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<DNSRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleLookup() {
        if (!domain) return;
        setLoading(true);
        setError(null);
        setRecords(null);

        try {
            const res = await fetch("/api/v1/dns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain, type: "ALL" })
            });

            const data = await res.json();
            if (res.ok && (data.success || data.records)) {
                setRecords(data.records || data.data?.records || []);
            } else {
                setError(data.error || "DNS lookup failed");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">TOOL / DNS</span>
                <h1 className="text-3xl font-heading mt-2">DNS LOOKUP</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Query DNS records for any domain: A, AAAA, MX, TXT, NS, CNAME.</p>
            </div>

            {/* INPUT */}
            <div className="panel p-6">
                <label className="label">DOMAIN</label>
                <div className="flex gap-4 mt-3">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="example.com"
                        className="flex-1 bg-transparent border border-[var(--border)] px-4 py-3 text-sm font-mono focus:border-[var(--bone)] outline-none transition-colors"
                    />
                    <button
                        onClick={handleLookup}
                        disabled={loading || !domain}
                        className="btn-primary px-6 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                        {loading ? "LOOKING UP..." : "LOOKUP"}
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
            {records && records.length > 0 && (
                <div className="panel">
                    <div className="panel-header flex items-center justify-between">
                        <span className="label">DNS RECORDS ({records.length})</span>
                        <button
                            onClick={() => copyToClipboard(JSON.stringify(records, null, 2))}
                            className="btn-secondary flex items-center gap-2 text-xs"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? "COPIED" : "COPY JSON"}
                        </button>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {records.map((record, i) => (
                            <div key={i} className="p-4 flex items-center gap-4">
                                <span className="text-[10px] font-bold bg-[var(--border)] px-2 py-1 rounded min-w-[60px] text-center">
                                    {record.type}
                                </span>
                                <span className="font-mono text-sm flex-1 text-[var(--ash)]">{record.value}</span>
                                {record.ttl && (
                                    <span className="text-[10px] text-[var(--ash)]">TTL: {record.ttl}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
