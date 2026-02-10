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

        // === PHANTOM PROTOCOL: LOCAL MODE (Vercel Serverless) ===
        // We bypass the Railway microservice to use the upgraded "Conqueror" logic locally.

        try {
            // Note: We currently only support single-page scrape in Local Mode.
            // Crawl mode would need a loop here, but for now we focus on deep extraction.
            const result = await scrapeUrl(url, { format: "markdown" });
            const duration = performance.now() - startTime;

            // === DEDUCT CREDITS ===
            await UsageService.deductCredits(user_id, "scrape");
            await UsageService.recordTransaction(user_id, "scrape", TOOL_CONFIG["scrape"].cost);

            // Construct GOD-MODE Response from Local Result
            return NextResponse.json({
                meta: {
                    status: 200,
                    version: "danrit-phantom-v1-local",
                    timestamp: new Date().toISOString(),
                    processing_time_ms: Math.round(duration)
                },
                source: {
                    url: url,
                    domain: new URL(url).hostname,
                    title: result.title,
                    author: result.metadata?.author || null,
                    date_published: result.metadata?.date || null
                },
                content: {
                    markdown: result.content,
                    html_clean: result.html, // Only if requested
                    excerpt: result.metadata?.description || null,
                    language: "en" // Todo: auto-detect
                },
                deep_mine: {
                    structured_data: result.jsonLd || [],
                    social_graph: {
                        og_image: result.metadata?.image || null,
                        site_name: result.metadata?.siteName || null,
                        type: result.metadata?.type || null,
                        keywords: result.metadata?.keywords || []
                    },
                    hidden_state: result.hiddenState || null,
                    outgoing_links: result.links || []
                },
                debug: {
                    stealth_mode: true,
                    engine: "phantom-crawler-v1-local"
                }
            });

        } catch (error: any) {
            console.error("Local Scraper Error:", error);
            throw error; // Let outer catch handle it
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
