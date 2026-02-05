
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { BrowserService } from './services/browser';

// Initialize Turndown service
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

export interface ScrapeResult {
    title: string;
    content: string; // Markdown
    html?: string;
    metadata: {
        author?: string;
        date?: string;
        description?: string;
        image?: string;
    };
}

export async function scrapeUrl(url: string, options: { format: 'markdown' | 'html' | 'text' } = { format: 'markdown' }): Promise<ScrapeResult> {
    let browser = null;
    try {
        console.log(`🚀 Launching Scraper for: ${url}`);

        // Use Unified Browser Service
        browser = await BrowserService.getBrowser();

        const page = await browser.newPage();

        // 1. Stealth Mode: Set realistic User-Agent (Fallback if plugin misses)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // 2. Smart Navigation: 'domcontentloaded' is faster. AdBlocker cleans the noise.
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Extract raw HTML
        const html = await page.content();

        // Parse with JSDOM
        const doc = new JSDOM(html, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (!article) {
            throw new Error("Failed to parse content from page.");
        }

        // Extract Metadata
        const metadata = {
            author: article.byline || undefined,
            description: article.excerpt || undefined,
            date: doc.window.document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || undefined,
            image: doc.window.document.querySelector('meta[property="og:image"]')?.getAttribute('content') || undefined
        };

        // Convert to Markdown if requested
        let finalContent = article.content || '';
        if (options.format === 'markdown') {
            finalContent = turndownService.turndown(article.content || '');
        } else if (options.format === 'text') {
            finalContent = article.textContent || '';
        }

        console.log(`✅ Scraped: ${article.title}`);

        return {
            title: article.title || 'Untitled',
            content: finalContent,
            html: options.format === 'html' ? (article.content || '') : undefined,
            metadata
        };

    } catch (error) {
        console.error("❌ Scrape Error:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
