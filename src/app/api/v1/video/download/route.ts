/**
 * ============================================================
 * 🎥 VIDEO DOWNLOAD ROUTE (Vercel → Railway StreamJet)
 * ============================================================
 * This route calls Railway's /v1/video/stream endpoint,
 * which streams the video bytes through Railway's server
 * (bypassing IP-lock 403 errors).
 * ============================================================
 */

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { UsageService, TOOL_CONFIG } from "@/lib/services/usage";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req, { user_id }) => {
    const startTime = performance.now();
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "Missing URL" }, { status: 400 });
        }

        // === CREDIT GATEKEEPER ===
        const cap = await UsageService.checkCap(user_id, "video_download");
        if (!cap.allowed) {
            return NextResponse.json({
                error: "Rate Limit",
                message: cap.reason,
                credits_remaining: cap.credits_remaining
            }, { status: 429 });
        }
        // === END GATEKEEPER ===

        const READER_URL = UsageService.getReaderUrl();

        // 🔥 CALL THE NEW STREAMJET ENDPOINT
        // Railway streams the actual bytes (no URL redirect, no 403)
        const streamResponse = await fetch(`${READER_URL}/v1/video/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        if (!streamResponse.ok) {
            const errorText = await streamResponse.text();
            throw new Error(`StreamJet Error: ${streamResponse.status} ${errorText}`);
        }

        // === DEDUCT CREDITS ===
        await UsageService.deductCredits(user_id, "video_download");
        await UsageService.recordTransaction(user_id, "video_download", TOOL_CONFIG["video_download"].cost);

        // Get headers from Railway's stream response
        const contentType = streamResponse.headers.get("content-type") || "video/mp4";
        const contentDisposition = streamResponse.headers.get("content-disposition") || `attachment; filename="danrit-video.mp4"`;
        const contentLength = streamResponse.headers.get("content-length");

        // Build response headers
        const headers: Record<string, string> = {
            "Content-Type": contentType,
            "Content-Disposition": contentDisposition,
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        };

        if (contentLength) {
            headers["Content-Length"] = contentLength;
        }

        const duration = Math.round(performance.now() - startTime);
        headers["x-duration"] = String(duration);

        // Pass the stream body directly through
        return new NextResponse(streamResponse.body, {
            status: 200,
            headers,
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        console.error("[VIDEO DOWNLOAD]", message);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
});
