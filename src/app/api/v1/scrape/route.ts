import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { z } from "zod";
import { UsageService } from "@/lib/services/usage";
import { withAuth } from "@/lib/api/handler";

export const maxDuration = 60; // Allow 60s for scraping

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

        // 4. Log Success
        const duration = Math.round(performance.now() - startTime);
        // Fire-and-forget logging
        UsageService.logRequest({
            user_id: user_id, // Secure ID from Key
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
