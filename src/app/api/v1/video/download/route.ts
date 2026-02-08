import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { UsageService } from "@/lib/services/usage";

export const maxDuration = 300; // Allow 5 minutes? No, this just returns a URL.
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req, { user_id }) => {
    const startTime = performance.now();
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "Missing URL" }, { status: 400 });
        }

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

        // Log Usage (5 credits for download/resolve)
        await UsageService.recordTransaction(user_id, "video_download", 5.0);

        const duration = Math.round(performance.now() - startTime);
        return NextResponse.json(data, {
            headers: { "x-duration": String(duration) }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
});
