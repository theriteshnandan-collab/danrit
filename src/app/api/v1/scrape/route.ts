
import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { z } from "zod";
import { UsageService } from "@/lib/services/usage";

export const maxDuration = 60; // Allow 60s for scraping

const bodySchema = z.object({
    url: z.string().url(),
    format: z.enum(["markdown", "html", "text"]).optional().default("markdown"),
});

export async function POST(req: NextRequest) {
    const startTime = performance.now();
    let status = 200;
    let userId = "";

    try {
        // 1. Get User from Header
        userId = req.headers.get("x-user-id") || "";
        if (!userId) {
            status = 401;
            return NextResponse.json({ error: "Unauthorized" }, { status });
        }

        // 2. Parse Body
        const json = await req.json();
        const { url, format } = bodySchema.parse(json);

        // 3. Scrape (Danrit Engine)
        const result = await scrapeUrl(url, { format });

        // 4. Log Success
        const duration = Math.round(performance.now() - startTime);
        // Fire-and-forget logging to not block response
        UsageService.logRequest({
            user_id: userId,
            endpoint: "/api/v1/scrape",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        // 5. Return Data
        return NextResponse.json({
            success: true,
            data: result,
            meta: {
                duration_ms: duration,
                credits_used: 1
            }
        });

    } catch (error) {
        status = 500;
        let errorMessage = "Internal Server Error";
        let errorDetails: any = String(error);

        if (error instanceof z.ZodError) {
            status = 400;
            errorMessage = "Invalid Input";
            errorDetails = error.errors;
        }

        // Log Failure
        const duration = Math.round(performance.now() - startTime);
        if (userId) {
            UsageService.logRequest({
                user_id: userId,
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
}
