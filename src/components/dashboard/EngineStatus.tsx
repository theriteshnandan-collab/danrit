import { Play, Pause, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EngineStatus() {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Engine Status</h3>
            <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-white">Mail Engine (SMTP)</span>
                    </div>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-white">Scrape Engine (Ghost)</span>
                    </div>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-white">PDF Engine (Printer)</span>
                    </div>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium text-zinc-400">Video Engine (FFmpeg)</span>
                    </div>
                    <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">Shelved</Badge>
                </div>
            </div>
        </div>
    );
}
