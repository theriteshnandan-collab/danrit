import { NextRequest, NextResponse } from "next/server";
import { DemoService } from "@/lib/services/demo";
import { UsageService } from "@/lib/services/usage";
import { scrapeUrl } from "@/lib/scraper";
import { BrowserService } from "@/lib/services/browser";
import QRCode from "qrcode";
// import { z } from "zod"; // Optional validation

export const maxDuration = 60; // Allow sufficient time for demo

export async function POST(req: NextRequest, { params }: { params: { engine: string } }) {
    const engine = params.engine;
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // 1. Rate Limit Check
    const allowed = await DemoService.checkRateLimit(ip);
    if (!allowed) {
        return NextResponse.json({
            error: "Demo Limit Exceeded",
            message: "You have used your 10 free demo requests this hour. Create an account for unlimited access."
        }, { status: 429 });
    }

    const startTime = performance.now();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let result: any = null;
    let credits = 1;

    try {
        const body = await req.json();

        // 2. Route to Engine Logic (Direct Invocation)
        switch (engine) {
            case "scrape":
                // Demo Restriction: Only allow format selection, maybe limit URL types?
                // For now, full power.
                result = await scrapeUrl(body.url, { format: body.format || "markdown" });
                break;

            case "pdf":
                credits = 5;
                const browser = await BrowserService.getBrowser();
                const page = await browser.newPage();
                await page.goto(body.url || "https://example.com", { waitUntil: 'networkidle0', timeout: 15000 });
                const pdf = await page.pdf({ format: "a4" });
                await browser.close();
                result = { base64: Buffer.from(pdf).toString("base64"), filename: "demo.pdf" };
                break;

            case "shot":
                credits = 3;
                const b2 = await BrowserService.getBrowser();
                const p2 = await b2.newPage();
                await p2.setViewport({ width: 1280, height: 720 });
                await p2.goto(body.url || "https://example.com", { waitUntil: 'networkidle0', timeout: 15000 });
                const shot = await p2.screenshot({ type: "png" });
                await b2.close();
                result = { base64: Buffer.from(shot).toString("base64"), mime_type: "image/png" };
                break;

            case "qr":
                const qr = await QRCode.toDataURL(body.text || "https://danrit.tech");
                result = { base64: qr.replace(/^data:image\/png;base64,/, ""), mime_type: "image/png" };
                break;

            default:
                return NextResponse.json({ error: "Unknown Engine" }, { status: 404 });
        }

        // 3. Log Usage (as DEMO_GUEST)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: DemoService.getDemoUser(),
            ip_address: ip,
            endpoint: `/api/demo/${engine}`,
            method: "POST",
            status_code: 200,
            duration_ms: duration
        });

        return NextResponse.json({
            success: true,
            data: result,
            meta: {
                demo: true,
                credits_used: credits,
                duration_ms: duration
            }
        });

    } catch (error) {
        console.error("Demo Error:", error);
        return NextResponse.json({ error: "Demo Failed", details: String(error) }, { status: 500 });
    }
}
