import { NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { z } from "zod";
import { UsageService, TOOL_CONFIG } from "@/lib/services/usage";
import { withAuth } from "@/lib/api/handler";

export const maxDuration = 60; // Allow 60s for scraping
export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ status: "active", engine: "scrape-v1" });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Allow": "GET, POST, OPTIONS",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key"
        }
    });
}

const bodySchema = z.object({
    url: z.string().url(),
    format: z.enum(["markdown", "html", "text"]).optional().default("markdown"),
    crawlMode: z.boolean().optional().default(false),
    maxPages: z.number().optional().default(5),
    maxDepth: z.number().optional().default(3),
    render: z.boolean().optional().default(true),
    screenshot: z.boolean().optional().default(false)
});

export const POST = withAuth(async (req, { user_id }) => {
    const startTime = performance.now();
    let status = 200;

    try {
        const json = await req.json();
        const { url, crawlMode, maxPages, maxDepth, render, screenshot } = bodySchema.parse(json);

        // === CREDIT GATEKEEPER ===
        const tool = crawlMode ? "scrape" : "scrape"; // Crawl uses same cost model
        const cap = await UsageService.checkCap(user_id, tool);
        if (!cap.allowed) {
            return NextResponse.json({
                error: "Rate Limit",
                message: cap.reason,
                credits_remaining: cap.credits_remaining
            }, { status: 429 });
        }
        // === END GATEKEEPER ===

        const READER_URL = UsageService.getReaderUrl();
        const endpoint = crawlMode ? `${READER_URL}/v1/crawl` : `${READER_URL}/v1/scrape`;

        console.log(`[BRIDGE] Forwarding to ${endpoint} | Mode: ${crawlMode ? 'CRAWL' : 'SCRAPE'}`);

        try {
            const readerResponse = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(process.env.READER_API_KEY ? { "x-api-key": process.env.READER_API_KEY } : {})
                },
                body: JSON.stringify({
                    url,
                    render,
                    screenshot,
                    maxPages,
                    maxDepth
                })
            });

            if (!readerResponse.ok) {
                const errorText = await readerResponse.text();
                throw new Error(`Reader Service Error: ${readerResponse.status} ${errorText}`);
            }

            const readerData = await readerResponse.json();

            // Transform Reader format to internal format
            if (crawlMode) {
                const result = readerData.data;
                const duration = performance.now() - startTime;

                // === DEDUCT CREDITS (Per page scraped) ===
                const creditCost = Math.max(1, result.stats.pagesScraped) * TOOL_CONFIG["scrape"].cost;
                await UsageService.deductCredits(user_id, "scrape");
                await UsageService.recordTransaction(user_id, "crawl", creditCost);

                return NextResponse.json({
                    status: "success",
                    data: {
                        pages: result.pages.map((p: any) => ({
                            title: p.title,
                            content: p.content,
                            textContent: p.textContent,
                            url: p.url,
                            metadata: {
                                byline: p.byline,
                                siteName: p.siteName,
                                url: p.url
                            },
                            schema: p.schema
                        })),
                        stats: result.stats
                    },
                    meta: {
                        duration: Math.round(duration),
                        engine: "phantom-crawler-v1",
                        mode: "stealth"
                    }
                });
            } else {
                const result = readerData.data;
                const duration = performance.now() - startTime;

                // === DEDUCT CREDITS ===
                await UsageService.deductCredits(user_id, "scrape");
                await UsageService.recordTransaction(user_id, "scrape", TOOL_CONFIG["scrape"].cost);

                return NextResponse.json({
                    status: "success",
                    data: {
                        title: result.title,
                        content: result.content,
                        textContent: result.textContent,
                        url: result.url,
                        screenshot: result.screenshot,
                        schema: result.schema,
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
            }

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown Error";
            console.error("[BRIDGE] Error:", error);
            return NextResponse.json(
                { error: message || "Failed to contact Reader Service" },
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
