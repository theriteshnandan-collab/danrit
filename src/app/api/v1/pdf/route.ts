import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UsageService } from '@/lib/services/usage';
import { BrowserService } from '@/lib/services/browser';
import { assertUrlIsSafe, runWithAbort } from '@/lib/services/network-policy';

export const maxDuration = 60; // Allow 60s for PDF generation

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
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const { url, format, print_background, wait_for, css, cookies } = json as any;

        const safeUrl = await assertUrlIsSafe(url);

        const pdfBuffer = await BrowserService.withIsolatedPage(
            { endpoint: '/api/v1/pdf', timeoutMs: REQUEST_TIMEOUT_MS, requestSignal: req.signal },
            async ({ page, signal }) => {
                if (cookies && Array.isArray(cookies)) {
                    await page.setCookie(...cookies);
                }

                await page.setViewport({ width: 1200, height: 800 });

                const navStart = performance.now();
                try {
                    await runWithAbort(
                        async () => page.goto(safeUrl, { waitUntil: 'networkidle0', timeout: NAV_TIMEOUT_MS }),
                        signal,
                    );
                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/pdf',
                        engine: 'chromium',
                        nav_time_ms: Math.round(performance.now() - navStart),
                        success: true,
                    });
                } catch (error) {
                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/pdf',
                        engine: 'chromium',
                        nav_time_ms: Math.round(performance.now() - navStart),
                        success: false,
                        failure_mode: error instanceof Error ? error.name : 'navigation_error',
                    });
                    throw error;
                }

                if (wait_for) {
                    try {
                        await runWithAbort(async () => page.waitForSelector(wait_for, { timeout: 5_000 }), signal);
                    } catch {
                        console.warn(`Timeout waiting for selector: ${wait_for}`);
                    }
                }

                if (css) {
                    await runWithAbort(async () => page.addStyleTag({ content: css }), signal);
                }

                const renderStart = performance.now();
                try {
                    const buffer = await runWithAbort(
                        async () => page.pdf({
                            format: format as
                                | 'a4'
                                | 'letter'
                                | 'legal'
                                | 'tabloid'
                                | 'ledger'
                                | 'a0'
                                | 'a1'
                                | 'a2'
                                | 'a3'
                                | 'a5'
                                | 'a6',
                            printBackground: print_background,
                            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
                        }),
                        signal,
                    );

                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/pdf',
                        engine: 'chromium',
                        render_time_ms: Math.round(performance.now() - renderStart),
                        success: true,
                    });

                    return buffer;
                } catch (error) {
                    BrowserService.emitMetric({
                        event: 'render_job',
                        endpoint: '/api/v1/pdf',
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
            endpoint: '/api/v1/pdf',
            method: 'POST',
            status_code: 200,
            duration_ms: duration,
        });

        const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

        return NextResponse.json({
            success: true,
            data: {
                base64: base64Pdf,
                filename: `danrit-${Date.now()}.pdf`,
            },
            meta: {
                duration_ms: duration,
                credits_used: 5,
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
                endpoint: '/api/v1/pdf',
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
