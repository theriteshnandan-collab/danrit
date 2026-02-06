import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UsageService } from '@/lib/services/usage';
import { ShotRequestSchema } from '@/lib/types/schema';
import { BrowserService } from '@/lib/services/browser';
import { assertUrlIsSafe, runWithAbort } from '@/lib/services/network-policy';

export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = 45_000;
const NAV_TIMEOUT_MS = 30_000;

export async function POST(req: NextRequest) {
    const startTime = performance.now();
    let status = 200;
    let userId = '';

    try {
        userId = req.headers.get('x-user-id') || '';
        if (!userId) {
            status = 401;
            return NextResponse.json({ error: 'Unauthorized' }, { status });
        }

        const json = await req.json();
        const { url, width, height, full_page } = ShotRequestSchema.parse(json);
        const safeUrl = await assertUrlIsSafe(url);

        const buffer = await BrowserService.withIsolatedPage(
            { endpoint: '/api/v1/shot', timeoutMs: REQUEST_TIMEOUT_MS, requestSignal: req.signal },
            async ({ page, signal }) => {
                await page.setViewport({ width, height, deviceScaleFactor: 2 });

                const navStart = performance.now();
                try {
                    await runWithAbort(
                        async () => page.goto(safeUrl, { waitUntil: 'networkidle0', timeout: NAV_TIMEOUT_MS }),
                        signal,
                    );
                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/shot',
                        engine: 'chromium',
                        nav_time_ms: Math.round(performance.now() - navStart),
                        success: true,
                    });
                } catch (error) {
                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/shot',
                        engine: 'chromium',
                        nav_time_ms: Math.round(performance.now() - navStart),
                        success: false,
                        failure_mode: error instanceof Error ? error.name : 'navigation_error',
                    });
                    throw error;
                }

                const renderStart = performance.now();
                try {
                    const imageBuffer = await runWithAbort(
                        async () => page.screenshot({
                            fullPage: full_page,
                            type: 'png',
                            encoding: 'binary',
                        }),
                        signal,
                    );

                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/shot',
                        engine: 'chromium',
                        render_time_ms: Math.round(performance.now() - renderStart),
                        success: true,
                    });

                    return imageBuffer;
                } catch (error) {
                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/shot',
                        engine: 'chromium',
                        render_time_ms: Math.round(performance.now() - renderStart),
                        success: false,
                        failure_mode: error instanceof Error ? error.name : 'render_error',
                    });
                    throw error;
                }
            },
        );

        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: userId,
            endpoint: '/api/v1/shot',
            method: 'POST',
            status_code: 200,
            duration_ms: duration,
        });

        const base64Image = Buffer.from(buffer).toString('base64');

        return NextResponse.json({
            success: true,
            data: {
                base64: base64Image,
                mime_type: 'image/png',
                filename: `shot-${Date.now()}.png`,
            },
            meta: {
                duration_ms: duration,
                credits_used: 3,
            },
        });
    } catch (error) {
        status = 500;
        let errorMessage = 'Internal Server Error';
        let errorDetails: unknown = String(error);

        if (error instanceof z.ZodError) {
            status = 400;
            errorMessage = 'Invalid Input';
            errorDetails = error.issues;
        }

        const duration = Math.round(performance.now() - startTime);
        if (userId) {
            UsageService.logRequest({
                user_id: userId,
                endpoint: '/api/v1/shot',
                method: 'POST',
                status_code: status,
                duration_ms: duration,
            });
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: errorDetails,
            },
            { status },
        );
    }
}
