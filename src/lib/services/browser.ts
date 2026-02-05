import puppeteer, { Viewport } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

interface ChromiumConfig {
    args: string[];
    defaultViewport: Viewport;
    executablePath: () => Promise<string>;
    headless: boolean | "new";
}

export class BrowserService {
    static async getBrowser() {
        if (process.env.NODE_ENV === 'production') {
            const chromiumConfig = (chromium as unknown) as ChromiumConfig;
            const executablePath = await chromiumConfig.executablePath();
            return await puppeteer.launch({
                args: chromiumConfig.args,
                defaultViewport: chromiumConfig.defaultViewport,
                executablePath: executablePath,
                headless: chromiumConfig.headless,
            });
        } else {
            // Local fallback (assumes local Chromium is available)
            // We use the standard 'puppeteer' package which includes chromium locally
            const localPuppeteer = await import('puppeteer');
            return await localPuppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }
}
