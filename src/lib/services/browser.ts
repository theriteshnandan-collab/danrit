import chromium from '@sparticuz/chromium-min';
import puppeteer, { type Browser, type BrowserContext, type Page } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// 1. Configure Plugins (The "Ghost" Mode)
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

interface ChromiumConfig {
    args: string[];
    defaultViewport: { width: number; height: number };
    executablePath: () => Promise<string>;
    headless: boolean | 'shell';
}

export interface BrowserMetricEvent {
    event: 'browser_launch' | 'render_job';
    endpoint?: string;
    engine: 'chromium';
    launch_time_ms?: number;
    nav_time_ms?: number;
    render_time_ms?: number;
    duration_ms?: number;
    success: boolean;
    failure_mode?: string;
}

export interface WithIsolatedPageOptions {
    endpoint: string;
    timeoutMs: number;
    requestSignal?: AbortSignal;
}

export class BrowserService {
    private static browserPromise: Promise<Browser> | null = null;

    static emitMetric(event: BrowserMetricEvent) {
        console.info(JSON.stringify({
            type: 'browser_metric',
            ts: new Date().toISOString(),
            ...event,
        }));
    }

    private static shouldEnableInsecureFlags() {
        const hardenedMode = process.env.BROWSER_HARDENED_ALLOWLIST_MODE === 'true';
        const allowlist = (process.env.BROWSER_INSECURE_ALLOWLIST ?? '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        return hardenedMode && allowlist.length > 0;
    }

    private static async launchBrowser() {
        const launchStart = performance.now();
        const insecureFlagsEnabled = this.shouldEnableInsecureFlags();

        try {
            if (process.env.NODE_ENV === 'production') {
                const chromiumConfig = chromium as unknown as ChromiumConfig;
                const executablePath = await chromiumConfig.executablePath();

                const headlessMode = (chromiumConfig.headless as unknown) === 'new'
                    ? true
                    : chromiumConfig.headless;

                const args = [...chromiumConfig.args, '--hide-scrollbars'];
                if (insecureFlagsEnabled) {
                    args.push('--disable-web-security', '--ignore-certificate-errors');
                }

                const browser = await puppeteer.launch({
                    args,
                    defaultViewport: chromiumConfig.defaultViewport,
                    executablePath,
                    headless: headlessMode as boolean | 'shell',
                });

                this.emitMetric({
                    event: 'browser_launch',
                    engine: 'chromium',
                    launch_time_ms: Math.round(performance.now() - launchStart),
                    success: true,
                });

                return browser;
            }

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            this.emitMetric({
                event: 'browser_launch',
                engine: 'chromium',
                launch_time_ms: Math.round(performance.now() - launchStart),
                success: true,
            });

            return browser;
        } catch (error) {
            this.emitMetric({
                event: 'browser_launch',
                engine: 'chromium',
                launch_time_ms: Math.round(performance.now() - launchStart),
                success: false,
                failure_mode: error instanceof Error ? error.name : 'launch_error',
            });
            throw error;
        }
    }

    static async getBrowser() {
        if (!this.browserPromise) {
            this.browserPromise = this.launchBrowser();
        }

        return this.browserPromise;
    }

    static async withIsolatedPage<T>(
        options: WithIsolatedPageOptions,
        task: (ctx: { page: Page; context: BrowserContext; signal: AbortSignal }) => Promise<T>,
    ): Promise<T> {
        const browser = await this.getBrowser();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(new Error('Request timed out')), options.timeoutMs);

        if (options.requestSignal) {
            options.requestSignal.addEventListener('abort', () => {
                controller.abort(options.requestSignal?.reason ?? new Error('Request aborted by client'));
            }, { once: true });
        }

        const durationStart = performance.now();
        let context: BrowserContext | null = null;
        let failed: unknown;

        try {
            context = await browser.createBrowserContext();
            const page = await context.newPage();
            return await task({ page, context, signal: controller.signal });
        } catch (error) {
            failed = error;
            throw error;
        } finally {
            clearTimeout(timeout);
            if (context) {
                await context.close();
            }
            this.emitMetric({
                event: 'render_job',
                endpoint: options.endpoint,
                engine: 'chromium',
                duration_ms: Math.round(performance.now() - durationStart),
                success: !failed,
                failure_mode: failed instanceof Error ? failed.name : failed ? 'job_error' : undefined,
            });
        }
    }
}
