
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
        siteName?: string;
        type?: string;
        keywords?: string[];
    };
    jsonLd?: any[];
    links?: string[];
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

        // --- DEVEX UPGRADE: Structured Data Extraction ---

        // 1. JSON-LD Extraction
        interface JsonLd {
            [key: string]: any;
        }

        const jsonLd: JsonLd[] = [];
        const scriptTags = doc.window.document.querySelectorAll('script[type="application/ld+json"]');
        scriptTags.forEach(script => {
            try {
                if (script.textContent) {
                    const data = JSON.parse(script.textContent);
                    jsonLd.push(data);
                }
            } catch (e) {
                console.warn("Failed to parse JSON-LD block:", e);
            }
        });

        // 2. Rich Metadata (OpenGraph + Twitter)
        const getMeta = (prop: string) => doc.window.document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`)?.getAttribute('content') || undefined;

        const metadata = {
            author: article.byline || getMeta('author') || getMeta('twitter:creator') || undefined,
            description: article.excerpt || getMeta('description') || getMeta('og:description') || undefined,
            date: getMeta('article:published_time') || getMeta('date') || undefined,
            image: getMeta('og:image') || getMeta('twitter:image') || undefined,
            siteName: getMeta('og:site_name') || undefined,
            type: getMeta('og:type') || 'website',
            keywords: getMeta('keywords') ? getMeta('keywords')?.split(',').map(k => k.trim()) : undefined
        };

        // 3. Link Extraction (Outgoing)
        const links: string[] = [];
        doc.window.document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('http')) {
                links.push(href);
            }
        });

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
            metadata,
            jsonLd: jsonLd.length > 0 ? jsonLd : undefined,
            links: links.length > 0 ? links : undefined
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
