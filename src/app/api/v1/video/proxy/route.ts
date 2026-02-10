import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 min for large video streams
export const dynamic = 'force-dynamic';

/**
 * VIDEO PROXY ROUTE
 * Streams video bytes through our server to bypass 403 restrictions.
 * GoogleVideo URLs are IP-locked; this route fetches from our server IP.
 */
export async function GET(req: NextRequest) {
    try {
        const videoUrl = req.nextUrl.searchParams.get("url");

        if (!videoUrl) {
            return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
        }

        // Validate it's a video URL (basic security check)
        const decoded = decodeURIComponent(videoUrl);
        const allowed = [
            "googlevideo.com",
            "youtube.com",
            "ytimg.com",
            "instagram.com",
            "cdninstagram.com",
            "fbcdn.net",
            "tiktokcdn.com",
            "twitter.com",
            "twimg.com",
            "vimeo.com",
            "vimeocdn.com",
        ];

        const urlObj = new URL(decoded);
        const isAllowed = allowed.some(domain => urlObj.hostname.endsWith(domain));

        if (!isAllowed) {
            return NextResponse.json(
                { error: "Domain not in allowlist", hostname: urlObj.hostname },
                { status: 403 }
            );
        }

        console.log(`[VIDEO PROXY] Streaming from: ${urlObj.hostname}`);

        // Fetch the video from the source with proper headers
        // Fetch the video from the source with minimal headers to avoid triggering anti-bot protection
        const upstream = await fetch(decoded, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                // Removing Referer/Origin as they can sometimes cause 403s on direct video streams
            },
        });

        if (!upstream.ok) {
            console.error(`[VIDEO PROXY] Upstream Error: ${upstream.status} for ${decoded}`);
            return NextResponse.json(
                { error: `Upstream returned ${upstream.status}`, details: upstream.statusText },
                { status: upstream.status }
            );
        }

        // Get content info
        const contentType = upstream.headers.get("content-type") || "video/mp4";
        const contentLength = upstream.headers.get("content-length");

        // Try to derive filename from upstream or URL
        let filename = "danrit-video.mp4";
        const upstreamDisposition = upstream.headers.get("content-disposition");
        if (upstreamDisposition && upstreamDisposition.includes("filename=")) {
            const match = upstreamDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) filename = match[1];
        }

        // Stream the response with relaxed CORS
        const headers: Record<string, string> = {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        };

        if (contentLength) {
            headers["Content-Length"] = contentLength;
        }

        return new NextResponse(upstream.body, {
            status: 200,
            headers,
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Proxy Error";
        console.error("[VIDEO PROXY] Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
