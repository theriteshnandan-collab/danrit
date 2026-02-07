import { NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { z } from "zod";
import { UsageService } from "@/lib/services/usage";
import { withAuth } from "@/lib/api/handler";

export const maxDuration = 60; // Allow 60s for scraping
export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ status: "active", engine: "scrape-v1" });
}

const bodySchema = z.object({
    url: z.string().url(),
    format: z.enum(["markdown", "html", "text"]).optional().default("markdown"),
});

export const POST = withAuth(async (req, { user_id }) => {
    const startTime = performance.now();
    let status = 200;

    try {
        // 2. Parse Body
        const json = await req.json();
        const { url, format } = bodySchema.parse(json);

        // 3. Scrape (Danrit Engine)
        const result = await scrapeUrl(url, { format });
        const body = bodySchema.parse(json); // Renamed `url, format` to `body` for clarity with proxy

        // --- PHASE 107: THE BRIDGE ---
        // Forward request to Danrit Reader Microservice
        const READER_URL = process.env.DANRIT_READER_URL || "http://localhost:3002";

        console.log(`[BRIDGE] Forwarding to Reader: ${READER_URL}/v1/scrape`);

        try {
            const readerResponse = await fetch(`${READER_URL}/v1/scrape`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(process.env.READER_API_KEY ? { "x-api-key": process.env.READER_API_KEY } : {})
                },
                body: JSON.stringify({
                    url: body.url,
                    render: true, // Always use render for best results
                    screenshot: false // Optional: toggle based on plan
                })
            });

            if (!readerResponse.ok) {
                const errorText = await readerResponse.text();
                throw new Error(`Reader Service Error: ${readerResponse.status} ${errorText}`);
            }

            const readerData = await readerResponse.json();

            // Transform Reader format to internal format if needed
            // Reader returns: { success: true, data: { ... } }
            const result = readerData.data;

            const duration = performance.now() - startTime;
            await UsageService.recordTransaction(user_id, "scrape", 1); // 1 credit

            return NextResponse.json({
                status: "success",
                data: {
                    title: result.title,
                    content: result.content,
                    textContent: result.textContent,
                    metadata: {
                        byline: result.byline,
                        siteName: result.siteName,
                        url: result.url
                    }
                },
                meta: {
                    duration: Math.round(duration),
                    engine: "danrit-reader-v1",
                    mode: "stealth"
                }
            });

        } catch (error: any) {
            console.error("[BRIDGE] Error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to contact Reader Service" },
                { status: 502 } // Bad Gateway
            );
        }

    } catch (error) {
        status = 500;
        let errorMessage = "Internal Server Error";
        let errorDetails: unknown = String(error);

        if (error instanceof z.ZodError) {
            status = 400;
            errorMessage = "Invalid Input";
            errorDetails = error.issues;
        }

        // Log Failure
        const duration = Math.round(performance.now() - startTime);
        if (user_id) {
            UsageService.logRequest({
                user_id: user_id,
                endpoint: "/api/v1/scrape",
                method: "POST",
                status_code: status,
                duration_ms: duration,
            });
        }

        return NextResponse.json({
            error: errorMessage,
            details: errorDetails
        }, { status });
    }
});
