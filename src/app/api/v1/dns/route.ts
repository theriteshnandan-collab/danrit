import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dns from "dns/promises";
import { UsageService } from "@/lib/services/usage";
import { DnsRequestSchema } from "@/lib/types/schema";

export const maxDuration = 10;

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
        const { domain, type } = DnsRequestSchema.parse(json);

        // 3. Resolve DNS (Danrit Engine)
        let records: unknown[] = [];

        // Map types to dns.promises functions
        switch (type) {
            case "A":
                records = await dns.resolve4(domain);
                break;
            case "MX":
                records = await dns.resolveMx(domain);
                break;
            case "TXT":
                records = await dns.resolveTxt(domain);
                // Flatten TXT records array of arrays
                records = records.flat();
                break;
            case "NS":
                records = await dns.resolveNs(domain);
                break;
            case "CNAME":
                records = await dns.resolveCname(domain);
                break;
            default:
                records = await dns.resolve4(domain);
        }

        // 4. Log Usage (1 Credit for DNS)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: userId,
            endpoint: "/api/v1/dns",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        // 5. Return Records
        return NextResponse.json({
            success: true,
            data: {
                domain,
                type,
                records
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
        } else if ((error as { code?: string }).code?.startsWith("ENODATA") || (error as { code?: string }).code?.startsWith("ENOTFOUND")) {
            status = 404;
            errorMessage = "Records Not Found";
            errorDetails = `No ${type} records found for ${domain}`;
        }

        // Log Failure
        const duration = Math.round(performance.now() - startTime);
        if (userId) {
            UsageService.logRequest({
                user_id: userId,
                endpoint: "/api/v1/dns",
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
