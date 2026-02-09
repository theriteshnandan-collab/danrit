import { NextResponse } from "next/server";
import { UsageService } from "@/lib/services/usage";

// Allow dynamic execution
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10s timeout for debug probe

export async function GET() {
    const startTime = performance.now();
    const readerUrl = UsageService.getReaderUrl();

    // Mask URL for safety but reveal protocol/domain
    const maskedUrl = readerUrl.replace(/:\/\/[^@]+@/, "://***@");

    let railwayStatus = "PENDING";
    let railwayLatency = 0;
    let errorDetails = null;

    try {
        console.log(`[DEBUG PROBE] Pinging ${readerUrl}/health...`);
        const res = await fetch(`${readerUrl}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(5000) // 5s timeout strict
        });

        railwayLatency = Math.round(performance.now() - startTime);

        if (res.ok) {
            railwayStatus = "ONLINE";
        } else {
            railwayStatus = `ERROR_${res.status}`;
            errorDetails = await res.text();
        }

    } catch (err: any) {
        railwayLatency = Math.round(performance.now() - startTime);
        railwayStatus = "UNREACHABLE";
        errorDetails = err.message;
        console.error("[DEBUG PROBE] Failed:", err);
    }

    return NextResponse.json({
        diagnosis: {
            timestamp: new Date().toISOString(),
            vercel_region: process.env.VERCEL_REGION || "dev",
            reader_config: {
                url: maskedUrl,
                protocol: readerUrl.startsWith("https") ? "HTTPS" : "HTTP",
            },
            connectivity: {
                status: railwayStatus,
                latency_ms: railwayLatency,
                details: errorDetails
            }
        }
    });
}
