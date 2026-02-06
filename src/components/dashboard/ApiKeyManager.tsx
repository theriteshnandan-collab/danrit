"use client";

import { useState } from "react";
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ApiKey {
    id: string;
    key_prefix: string;
    status: "active" | "revoked";
    created_at: string;
}

export function ApiKeyManager({ keys }: { keys: ApiKey[] }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [newKey, setNewKey] = useState<string | null>(null);

    const handleCreateKey = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/v1/keys/create", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create key");

            setNewKey(data.key); // The full key (sk_live_...) returned only once
            toast.success("API Key Generated", {
                description: "Copy it now. You won't see it again."
            });
            // Ideally revalidatePath here via Server Action, but for now we might require refresh
            // or use router.refresh() if available.
        } catch (error) {
            toast.error("Error", { description: String(error) });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-white">API Keys</h3>
                    <p className="text-xs text-zinc-500">Manage access to the engines.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateKey}
                    disabled={isGenerating}
                    className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {isGenerating ? "Rolling..." : "Roll New Key"}
                </Button>
            </div>

            {newKey && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">New Secret Key</span>
                        <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/20"
                                onClick={() => {
                                    navigator.clipboard.writeText(newKey);
                                    toast.success("Copied to clipboard");
                                }}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="font-mono text-sm text-emerald-400 break-all p-2 bg-black/50 rounded border border-emerald-500/20">
                        {newKey}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                        ⚠️ This key will not be shown again. Store it safely.
                    </p>
                </div>
            )}

            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-zinc-900">
                            <TableHead className="text-zinc-400">Prefix</TableHead>
                            <TableHead className="text-zinc-400">Created</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-right text-zinc-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keys.map((key) => (
                            <TableRow key={key.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                <TableCell className="font-mono text-xs text-zinc-300">
                                    {key.key_prefix}...
                                </TableCell>
                                <TableCell className="text-xs text-zinc-500">
                                    {new Date(key.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            key.status === 'active'
                                                ? "border-emerald-500/20 text-emerald-500"
                                                : "border-red-500/20 text-red-500"
                                        }
                                    >
                                        {key.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-red-500">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
