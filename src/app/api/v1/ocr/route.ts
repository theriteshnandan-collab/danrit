import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createWorker } from "tesseract.js";
import { UsageService } from "@/lib/services/usage";
import { OcrRequestSchema } from "@/lib/types/schema";

export const maxDuration = 60; // OCR can be slow

export async function POST(req: NextRequest) {
    const startTime = performance.now();
    let status = 200;
    let userId = "";

    try {
        // 1. Auth Check
        userId = req.headers.get("x-user-id") || "";
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Body
        const json = await req.json();
        const { url, lang } = OcrRequestSchema.parse(json);

        // 3. Initialize Tesseract Worker
        const worker = await createWorker(lang); // 'eng' by default

        // 4. Recognize Text
        // Tesseract.js can take a URL directly, but it's safer to fetch buffer if URL is sensitive or CORS restricted?
        // Actually Tesseract.js handles URLs fine if they are public.
        // For robustness, let's pass the URL.
        const { data: { text, confidence } } = await worker.recognize(url);

        await worker.terminate();

        // 5. Log Usage (3 Credits for OCR - high CPU)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: userId,
            endpoint: "/api/v1/ocr",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        return NextResponse.json({
            success: true,
            data: {
                text: text.trim(),
                confidence: confidence
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
        if (userId) {
            UsageService.logRequest({
                user_id: userId,
                endpoint: "/api/v1/ocr",
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
