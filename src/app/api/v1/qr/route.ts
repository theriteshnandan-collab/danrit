import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { UsageService } from "@/lib/services/usage";
import { QrRequestSchema } from "@/lib/types/schema";

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
        const { text, width, color } = QrRequestSchema.parse(json);

        // 3. Generate QR (Danrit Engine)
        const dataUrl = await QRCode.toDataURL(text, {
            width: width,
            color: {
                dark: color === "black" ? "#000000" : color === "blue" ? "#0000FF" : "#FF0000",
                light: "#FFFFFF"
            }
        });

        // Remove "data:image/png;base64," prefix for cleaner API response
        const base64Image = dataUrl.replace(/^data:image\/png;base64,/, "");

        // 4. Log Usage (1 Credit for QR)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: userId,
            endpoint: "/api/v1/qr",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        // 5. Return Image
        return NextResponse.json({
            success: true,
            data: {
                base64: base64Image,
                mime_type: "image/png",
                filename: `qr-${Date.now()}.png`
            },
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
            errorDetails = error.errors;
        }

        // Log Failure
        const duration = Math.round(performance.now() - startTime);
        if (userId) {
            UsageService.logRequest({
                user_id: userId,
                endpoint: "/api/v1/qr",
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
