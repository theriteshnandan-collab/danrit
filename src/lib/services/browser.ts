import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// 1. Configure Plugins (The "Ghost" Mode)
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export class BrowserService {
    static async getBrowser() {
        if (process.env.NODE_ENV === 'production') {
            const chromium = await import('@sparticuz/chromium').then(mod => mod.default);
            const puppeteerCore = await import('puppeteer-core').then(mod => mod.default);

            // Configure Chromium
            chromium.setHeadlessMode = true;
            chromium.setGraphicsMode = false;

            return await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            const puppeteer = await import('puppeteer').then(mod => mod.default);
            return await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }
}
