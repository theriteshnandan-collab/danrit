/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: [
            'puppeteer-core',
            '@sparticuz/chromium-min',
            'puppeteer-extra',
            'puppeteer-extra-plugin-stealth',
            'puppeteer-extra-plugin-adblocker-puppeteer-extra'
        ],
    },
};

export default nextConfig;
