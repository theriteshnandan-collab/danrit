import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { UsageService } from "@/lib/services/usage";
import { MailRequestSchema } from "@/lib/types/schema";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789"); // Default to prevent crash if not set

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
        const { to, subject, html, from_name } = MailRequestSchema.parse(json);

        // 3. Send Email (Danrit Engine)
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not configured.");
        }

        const { data, error } = await resend.emails.send({
            from: `${from_name || "Danrit"} <onboarding@resend.dev>`, // Default Resend Domain
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            throw new Error(error.message);
        }

        // 4. Log Usage (2 Credits for Mail)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: userId,
            endpoint: "/api/v1/mail",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        // 5. Return Success
        return NextResponse.json({
            success: true,
            data: {
                id: data?.id,
                status: "sent"
            },
            meta: {
                duration_ms: duration,
                credits_used: 2
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
                endpoint: "/api/v1/mail",
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
