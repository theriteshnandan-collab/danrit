import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UsageService } from "@/lib/services/usage";
import { PdfRequestSchema } from "@/lib/types/schema";
import { BrowserService } from "@/lib/services/browser";

export const maxDuration = 60; // Allow 60s for PDF generation

export async function POST(req: NextRequest) {
    const startTime = performance.now();
    let status = 200;
    let userId = "";

    try {
        // 1. Auth Check (Ironclad)
        userId = req.headers.get("x-user-id") || "";
        if (!userId) {
            status = 401;
            return NextResponse.json({ error: "Unauthorized" }, { status });
        }

        // 2. Parse Body
        const json = await req.json();
        const { url, format, print_background } = PdfRequestSchema.parse(json);

        // 3. Use Unified Browser Service
        browser = await BrowserService.getBrowser();

        const page = await browser.newPage();

        // Optimize for Print
        await page.setViewport({ width: 1200, height: 800 });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: format as any,
            printBackground: print_background,
            margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
        });

        await browser.close();

        // 4. Log Usage (5 Credits for PDF)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: userId,
            endpoint: "/api/v1/pdf",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        // 5. Return PDF (Base64 for Unified API)
        // Returning Base64 is cleaner for a universal JSON API than binary streams
        const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

        return NextResponse.json({
            success: true,
            data: {
                base64: base64Pdf,
                filename: `danrit-${Date.now()}.pdf`
            },
            meta: {
                duration_ms: duration,
                credits_used: 5 // Premium charge
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
                endpoint: "/api/v1/pdf",
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
