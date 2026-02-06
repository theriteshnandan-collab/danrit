import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// 1. Configure Plugins (The "Ghost" Mode)
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

interface ChromiumConfig {
    args: string[];
    defaultViewport: { width: number; height: number };
    executablePath: () => Promise<string>;
    headless: boolean | "shell";
}

export class BrowserService {
    static async getBrowser() {
        if (process.env.NODE_ENV === 'production') {
            const chromiumConfig = (chromium as unknown) as ChromiumConfig;
            const executablePath = await chromiumConfig.executablePath();

            // Map "new" to true if the types only expect boolean | "shell"
            const headlessMode = (chromiumConfig.headless as unknown) === "new"
                ? true
                : chromiumConfig.headless;

            return await puppeteer.launch({
                args: [...chromiumConfig.args, '--hide-scrollbars', '--disable-web-security', '--ignore-certificate-errors'],
                defaultViewport: chromiumConfig.defaultViewport,
                executablePath: executablePath,
                headless: headlessMode as boolean | "shell",
            });
        } else {
            // Local fallback
            // Note: puppeteer-extra automatically uses the installed 'puppeteer' package locally
            return await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }
}
