"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ServiceStatus {
    name: string;
    url: string;
    status: "checking" | "online" | "offline";
    latency?: number;
}

const SERVICES: ServiceStatus[] = [
    { name: "READER", url: process.env.NEXT_PUBLIC_READER_URL || "http://localhost:3002", status: "checking" },
    // Future services
    // { name: "VIDEO", url: "http://localhost:3003", status: "checking" },
];

async function checkService(url: string): Promise<{ online: boolean; latency: number }> {
    const start = performance.now();
    try {
        const res = await fetch(`${url}/health`, { method: "GET", signal: AbortSignal.timeout(5000) });
        const latency = Math.round(performance.now() - start);
        return { online: res.ok, latency };
    } catch {
        return { online: false, latency: 0 };
    }
}

export default function SystemsPage() {
    const [services, setServices] = useState<ServiceStatus[]>(SERVICES);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    async function refreshAll() {
        setServices(prev => prev.map(s => ({ ...s, status: "checking" as const })));

        const updated = await Promise.all(
            SERVICES.map(async (service) => {
                const result = await checkService(service.url);
                return {
                    ...service,
                    status: result.online ? "online" as const : "offline" as const,
                    latency: result.latency
                };
            })
        );

        setServices(updated);
        setLastChecked(new Date());
    }

    useEffect(() => {
        refreshAll();
        const interval = setInterval(refreshAll, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="label">INFRASTRUCTURE</span>
                    <h1 className="text-3xl font-heading mt-2">Systems Monitor</h1>
                </div>
                <button onClick={refreshAll} className="btn-secondary flex items-center gap-2">
                    <RefreshCw size={14} />
                    REFRESH
                </button>
            </div>

            {/* SERVICE GRID */}
            <div className="panel">
                <div className="panel-header">
                    <span className="label">REMOTE MICROSERVICES</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-[var(--border)]">
                            <tr className="text-left text-[var(--ash)]">
                                <th className="p-4 font-normal label">Service</th>
                                <th className="p-4 font-normal label">Endpoint</th>
                                <th className="p-4 font-normal label">Status</th>
                                <th className="p-4 font-normal label">Latency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.name} className="border-b border-[var(--border)] last:border-b-0">
                                    <td className="p-4 font-heading">{service.name}</td>
                                    <td className="p-4 font-mono text-xs text-[var(--ash)]">{service.url}</td>
                                    <td className="p-4">
                                        {service.status === "checking" && (
                                            <span className="flex items-center gap-2 text-[var(--ash)]">
                                                <Loader2 size={14} className="animate-spin" />
                                                CHECKING
                                            </span>
                                        )}
                                        {service.status === "online" && (
                                            <span className="flex items-center gap-2 text-[var(--signal-green)]">
                                                <CheckCircle size={14} />
                                                ONLINE
                                            </span>
                                        )}
                                        {service.status === "offline" && (
                                            <span className="flex items-center gap-2 text-[var(--signal-red)]">
                                                <XCircle size={14} />
                                                OFFLINE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono text-xs">
                                        {service.status === "online" && service.latency !== undefined
                                            ? `${service.latency}ms`
                                            : "—"
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LAST CHECKED */}
            {lastChecked && (
                <p className="text-xs text-[var(--ash)]">
                    Last checked: {lastChecked.toLocaleTimeString()}
                </p>
            )}

            {/* ARCHITECTURE INFO */}
            <div className="panel">
                <div className="panel-header">
                    <span className="label">ARCHITECTURE NOTES</span>
                </div>
                <div className="panel-body text-sm text-[var(--ash)] space-y-2">
                    <p>• <strong className="text-[var(--bone)]">READER</strong> runs on Railway/Fly as a dedicated microservice with Puppeteer.</p>
                    <p>• <strong className="text-[var(--bone)]">VIDEO</strong> (Coming Soon) will handle heavy media downloads.</p>
                    <p>• The main dashboard (this site) is hosted on Vercel for global speed.</p>
                </div>
            </div>
        </div>
    );
}
