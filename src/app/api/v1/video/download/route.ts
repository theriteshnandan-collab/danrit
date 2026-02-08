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

        const READER_URL = process.env.DANRIT_READER_URL || "http://localhost:3002";

        const response = await fetch(`${READER_URL}/v1/video/download`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reader Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // === DEDUCT CREDITS (Proper Tracking) ===
        await UsageService.deductCredits(user_id, "video_download");
        await UsageService.recordTransaction(user_id, "video_download", TOOL_CONFIG["video_download"].cost);

        const duration = Math.round(performance.now() - startTime);
        return NextResponse.json(data, {
            headers: { "x-duration": String(duration) }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
});
