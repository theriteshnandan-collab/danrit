import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export class BrowserService {
    static async getBrowser() {
        if (process.env.NODE_ENV === 'production') {
            const executablePath = await (chromium as any).executablePath();
            return await puppeteer.launch({
                args: (chromium as any).args,
                defaultViewport: (chromium as any).defaultViewport,
                executablePath: executablePath,
                headless: (chromium as any).headless,
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
