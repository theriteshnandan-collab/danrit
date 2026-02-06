import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UsageService } from "@/lib/services/usage";
import { ShotRequestSchema } from "@/lib/types/schema";
import { BrowserService } from "@/lib/services/browser";
import { withAuth } from "@/lib/api/handler";

export const maxDuration = 60;

export const POST = withAuth(async (req, { user_id }) => {
    const startTime = performance.now();
    let status = 200;

    try {
        // 2. Parse Body
        const json = await req.json();
        const { url, width, height, full_page } = ShotRequestSchema.parse(json);

        // 3. Use Unified Browser Service
        const browser = await BrowserService.getBrowser();
        const page = await browser.newPage();

        // 3a. Retina Mode (High DPI)
        await page.setViewport({ width, height, deviceScaleFactor: 2 });

        // 3b. Smart Navigation
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Screenshot
        const buffer = await page.screenshot({
            fullPage: full_page,
            type: "png",
            encoding: "binary"
        });

        await browser.close();

        // 4. Log Usage (3 Credits for Shot)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: user_id,
            endpoint: "/api/v1/shot",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        // 5. Return Image (Base64)
        const base64Image = Buffer.from(buffer).toString('base64');

        return NextResponse.json({
            success: true,
            data: {
                base64: base64Image,
                mime_type: "image/png",
                filename: `shot-${Date.now()}.png`
            },
            meta: {
                duration_ms: duration,
                credits_used: 3
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
                endpoint: "/api/v1/shot",
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
