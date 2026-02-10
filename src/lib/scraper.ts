
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
    hiddenState?: {
        next_data?: any;
        nuxt_data?: any;
        apollo_state?: any;
        redux_state?: any;
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

        // PHANTOM PROTOCOL: Phase 1 (Stealth Entry)
        console.log(`[PHANTOM] Engaging Target: ${url}`);

        // Randomize Viewport (1366x768 -> 1920x1080)
        const width = 1366 + Math.floor(Math.random() * 500);
        const height = 768 + Math.floor(Math.random() * 300);
        await page.setViewport({ width, height });

        // 2. Smart Navigation: 'domcontentloaded' is faster. AdBlocker cleans the noise.
        // PHANTOM PROTOCOL: Phase 1 (Stealth Entry)
        console.log(`[PHANTOM] Engaging Target: ${url}`);



        // NAVIGATION STRATEGY: Conqueror Mode (SPA Support)
        // We wait for networkidle2 (no more than 2 connections for 500ms) to ensure hydration.
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        } catch (e) {
            console.warn(`[PHANTOM] Navigation timeout, proceeding with partial load.`);
        }

        // Force Scroll (Trigger Hydration/Lazy Loading)
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 50);
            });
        });

        // Wait a beat for post-scroll hydration
        await new Promise(r => setTimeout(r, 1000));


        // PHANTOM PHASE 1.5: Human Presence Simulation
        // Move mouse in a Bezier curve to center
        try {
            await page.mouse.move(100, 100);
            await page.mouse.move(width / 2, height / 2, { steps: 25 });
        } catch (e) { /* Ignore mouse errors */ }

        // PHANTOM PHASE 2: Deep Extraction Injection
        // Extract hidden state from the DOM context
        const hiddenState = await page.evaluate(() => {
            const getMeta = (prop: string) => document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`)?.getAttribute('content') || null;

            return {
                // 1. Grab Standard JSON-LD
                json_ld: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                    .map(script => {
                        try { return JSON.parse(script.textContent || '{}'); }
                        catch (e) { return null; }
                    }).filter(Boolean),

                // 2. Grab "Hydration States" (The Gold Mine)
                // @ts-ignore
                next_data: window.__NEXT_DATA__ || null,
                // @ts-ignore
                nuxt_data: window.__NUXT__ || null,
                // @ts-ignore
                apollo_state: window.__APOLLO_STATE__ || null,
                // @ts-ignore
                redux_state: window.__INITIAL_STATE__ || null,

                // 3. Grab Meta Tags
                meta_tags: {
                    description: getMeta('description') || getMeta('og:description'),
                    image: getMeta('og:image') || getMeta('twitter:image'),
                    site_name: getMeta('og:site_name'),
                    type: getMeta('og:type'),
                    keywords: getMeta('keywords'),
                    date: getMeta('article:published_time') || getMeta('date')
                }
            };
        });

        // Extract raw HTML
        const html = await page.content();

        // Parse with JSDOM (Still useful for Readability)
        const doc = new JSDOM(html, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (!article) {
            throw new Error("Failed to parse content from page.");
        }

        // --- PHANTOM PHASE 3: Data Merge & Cleanup ---

        // Prioritize JSON-LD if content is thin
        const isThinContent = (article.content?.length || 0) < 200;
        const hasRichData = hiddenState.json_ld.length > 0;

        let finalContent = article.content || '';

        // Convert to Markdown
        if (options.format === 'markdown') {
            finalContent = turndownService.turndown(finalContent);
        } else if (options.format === 'text') {
            finalContent = article.textContent || '';
        }

        console.log(`✅ Scraped: ${article.title}`);

        return {
            title: article.title || 'Untitled',
            content: finalContent,
            html: options.format === 'html' ? (article.content || '') : undefined,
            metadata: {
                author: article.byline || undefined,
                date: hiddenState.meta_tags.date || undefined,
                description: article.excerpt || hiddenState.meta_tags.description || undefined,
                image: hiddenState.meta_tags.image || undefined,
                siteName: hiddenState.meta_tags.site_name || undefined,
                type: hiddenState.meta_tags.type || 'website',
                keywords: hiddenState.meta_tags.keywords ? hiddenState.meta_tags.keywords.split(',').map((k: string) => k.trim()) : undefined
            },
            jsonLd: hiddenState.json_ld,
            // @ts-ignore
            hiddenState: {
                next_data: hiddenState.next_data,
                nuxt_data: hiddenState.nuxt_data,
                apollo_state: hiddenState.apollo_state,
                redux_state: hiddenState.redux_state
            }
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
