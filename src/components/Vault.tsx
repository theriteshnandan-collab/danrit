"use client";

import { useState, useEffect } from "react";
import { Key, Copy, Plus, AlertTriangle } from "lucide-react";
import { ApiKey } from "@/lib/types/schema";

export default function Vault() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKey, setNewKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        const res = await fetch("/api/dashboard/keys");
        const data = await res.json();
        if (data.success) {
            setKeys(data.data);
        }
        setLoading(false);
    };

    const createKey = async () => {
        const name = `Key ${keys.length + 1}`;
        const res = await fetch("/api/dashboard/keys", {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (data.success) {
            setNewKey(data.data.secret_key); // Use the Full Secret Key returned only once
            fetchKeys();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-[#FF4F00]" />
                        API Vault
                    </h2>
                    <p className="text-[#666] text-sm mt-1">Manage your secure access credentials.</p>
                </div>
                <button
                    onClick={createKey}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={16} />
                    Generate New Key
                </button>
            </div>

            {newKey && (
                <div className="mb-8 p-6 rounded-xl border border-[#FF4F00]/20 bg-[#FF4F00]/5 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-[#FF4F00] w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-white font-bold mb-1">Store this key immediately</h3>
                            <p className="text-[#888] text-xs mb-4">It will never be shown again. If you lose it, you will need to generate a new one.</p>

                            <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded px-3 py-2.5 font-mono text-sm text-white">
                                <span className="flex-1 break-all">{newKey}</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(newKey)}
                                    className="text-[#666] hover:text-white transition-colors"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setNewKey(null)}
                        className="mt-4 text-xs font-bold text-[#FF4F00] uppercase tracking-wide hover:underline"
                    >
                        I have saved it
                    </button>
                </div>
            )}

            <div className="rounded-xl border border-white/10 bg-[#09090b] overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-3 border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase text-[#666] tracking-wider">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-4">Key Prefix</div>
                    <div className="col-span-2">Created</div>
                    <div className="col-span-2 text-right">Status</div>
                </div>
                <div className="divide-y divide-white/5">
                    {loading && <div className="p-6 text-[#666] text-sm text-center">Loading vault...</div>}
                    {keys.map((key) => (
                        <div key={key.id} className="grid grid-cols-12 px-6 py-4 items-center text-sm hover:bg-white/[0.02] transition-colors">
                            <div className="col-span-4 font-medium text-white">{key.name}</div>
                            <div className="col-span-4 font-mono text-[#888]">{key.key_prefix}</div>
                            <div className="col-span-2 text-[#666] text-xs">
                                {new Date(key.created_at).toLocaleDateString()}
                            </div>
                            <div className="col-span-2 text-right">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E054]/10 text-[#00E054]">
                                    ACTIVE
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
