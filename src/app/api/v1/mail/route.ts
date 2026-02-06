import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { UsageService } from "@/lib/services/usage";
import { MailRequestSchema } from "@/lib/types/schema";
import { withAuth } from "@/lib/api/handler";

// Initialize Drivers
const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

export const POST = withAuth(async (req, { user_id }) => {
    const startTime = performance.now();
    let status = 200;

    try {
        // 1. Parse Body
        const json = await req.json();
        const { to, subject, html, from_name } = MailRequestSchema.parse(json);

        // 2. Select Driver
        const driver = process.env.MAIL_DRIVER || "resend"; // 'resend' | 'smtp'
        let resultData = {};

        // 3. Execute Send
        if (driver === "smtp") {
            // ZERO PRICE MODE (Nodemailer)
            if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
                throw new Error("SMTP Configuration Missing (HOST, USER, PASS)");
            }

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            const info = await transporter.sendMail({
                from: `"${from_name || "Danrit"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: to,
                subject: subject,
                html: html,
            });

            resultData = { id: info.messageId, status: "sent", provider: "smtp" };

        } else {
            // RESEND MODE (Default)
            if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");

            const { data, error } = await resend.emails.send({
                from: `${from_name || "Danrit"} <onboarding@resend.dev>`,
                to: [to],
                subject: subject,
                html: html,
            });

            if (error) throw new Error(error.message);
            resultData = { id: data?.id, status: "sent", provider: "resend" };
        }

        // 4. Log Usage (2 Credits for Mail)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: user_id,
            endpoint: "/api/v1/mail",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        // 5. Return Success
        return NextResponse.json({
            success: true,
            data: resultData,
            meta: {
                duration_ms: duration,
                credits_used: 2,
                driver: driver
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
});
