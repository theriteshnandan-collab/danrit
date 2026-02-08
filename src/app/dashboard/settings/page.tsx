"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Shield, Key, LogOut, Copy, Check, Trash2, Plus, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SettingsPage() {
    const supabase = createClient();
    const [user, setUser] = useState<{ id: string; email: string } | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [showKey, setShowKey] = useState<string | null>(null);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");

    // Fetch API Keys
    const { data: keysData, mutate: refreshKeys } = useSWR("/api/v1/keys", fetcher);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUser({ id: user.id, email: user.email || "" });
        };
        getUser();
    }, [supabase.auth]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) return;
        setIsCreatingKey(true);
        try {
            await fetch("/api/v1/keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName }),
            });
            setNewKeyName("");
            refreshKeys();
        } finally {
            setIsCreatingKey(false);
        }
    };

    const handleDeleteKey = async (keyId: string) => {
        if (!confirm("Are you sure you want to delete this API key?")) return;
        await fetch(`/api/v1/keys/${keyId}`, { method: "DELETE" });
        refreshKeys();
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* HEADER */}
            <div>
                <span className="label">CONTROL PANEL</span>
                <h1 className="text-3xl font-heading mt-2">Settings</h1>
                <p className="text-zinc-500 mt-1">Manage your account, API keys, and preferences.</p>
            </div>

            {/* PROFILE SECTION */}
            <section className="card">
                <div className="flex items-center gap-3 mb-6">
                    <User className="text-amber-500" size={20} />
                    <h2 className="text-lg font-bold">Profile</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Mail className="text-zinc-500" size={16} />
                            <span className="text-sm text-zinc-400">Email</span>
                        </div>
                        <span className="text-sm font-mono text-white">{user?.email || "Loading..."}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Shield className="text-zinc-500" size={16} />
                            <span className="text-sm text-zinc-400">User ID</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-500 truncate max-w-[200px]">{user?.id || "..."}</span>
                            <button
                                onClick={() => user && handleCopy(user.id, "user-id")}
                                className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                            >
                                {copied === "user-id" ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-zinc-500" />}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* API KEYS SECTION */}
            <section className="card">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Key className="text-amber-500" size={20} />
                        <h2 className="text-lg font-bold">API Keys</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Key name..."
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600"
                        />
                        <Button
                            onClick={handleCreateKey}
                            disabled={isCreatingKey || !newKeyName.trim()}
                            className="bg-amber-600 hover:bg-amber-500 text-white"
                            size="sm"
                        >
                            <Plus size={14} className="mr-1" />
                            Create
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    {keysData?.keys?.length > 0 ? (
                        keysData.keys.map((key: { id: string; name: string; key_preview: string; created_at: string; last_used_at: string }) => (
                            <div key={key.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">{key.name}</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded font-mono">
                                            {key.key_preview}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-zinc-600">Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                        {key.last_used_at && (
                                            <span className="text-xs text-zinc-600">Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                                        className="p-2 hover:bg-zinc-800 rounded transition-colors"
                                        title="Toggle visibility"
                                    >
                                        {showKey === key.id ? <EyeOff size={14} className="text-zinc-400" /> : <Eye size={14} className="text-zinc-400" />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="p-2 hover:bg-red-900/30 rounded transition-colors"
                                        title="Delete key"
                                    >
                                        <Trash2 size={14} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-zinc-600">
                            <Key size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No API keys yet. Create one to get started.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* DANGER ZONE */}
            <section className="card border-red-900/30">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="text-red-500" size={20} />
                    <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-white">Sign Out</p>
                        <p className="text-xs text-zinc-500">End your current session on this device.</p>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-500"
                    >
                        <LogOut size={14} className="mr-2" />
                        Sign Out
                    </Button>
                </div>
            </section>
        </div>
    );
}
