import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { UsageService } from "@/lib/services/usage";
import { VideoRequestSchema } from "@/lib/types/schema";
import fs from "fs";
import path from "path";
import os from "os";
import { promisify } from "util";
import fetch from "node-fetch";

// Configure FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath!);

export const maxDuration = 60; // Max allowed for Serverless

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export async function POST(req: NextRequest) {
    const startTime = performance.now();
    let status = 200;
    let userId = "";

    // Unique Session ID for temp files
    const sessionId = Math.random().toString(36).substring(7);
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${sessionId}.mp4`);
    const outputPath = path.join(tmpDir, `output-${sessionId}`);

    try {
        // 1. Auth Check
        userId = req.headers.get("x-user-id") || "";
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Body
        const json = await req.json();
        const { url, action, options } = VideoRequestSchema.parse(json);

        // 3. Download Video to /tmp
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);
        const buffer = await response.buffer();
        await writeFile(inputPath, buffer);

        // 4. Process Video (FFmpeg)
        let mimeType = "video/mp4";
        let finalOutputPath = outputPath + ".mp4";

        await new Promise((resolve, reject) => {
            const command = ffmpeg(inputPath);

            if (action === "compress") {
                // Compress: Reduced bitrate, standardized scale
                command
                    .videoCodec("libx264")
                    .size(options?.width ? `${options.width}x?` : "640x?") // Resize keeping aspect ratio
                    .outputOptions("-crf 28") // Higher CRF = Lower Quality/Lower Size
                    .output(finalOutputPath)
                    .on("end", resolve)
                    .on("error", reject)
                    .run();
            } else if (action === "thumbnail") {
                // Thumbnail: Extract single frame
                mimeType = "image/jpeg";
                finalOutputPath = outputPath + ".jpg";

                command
                    .screenshot({
                        timestamps: [options?.time || "00:00:01"],
                        filename: path.basename(finalOutputPath),
                        folder: tmpDir,
                        size: options?.width ? `${options.width}x?` : "320x?"
                    })
                    .on("end", resolve)
                    .on("error", reject);
            } else {
                reject(new Error(`Action ${action} not implemented yet`));
            }
        });

        // 5. Read Output & Cleanup
        const outputBuffer = await readFile(finalOutputPath);
        const base64Data = outputBuffer.toString("base64");

        // Async Cleanup (Fire and forget)
        Promise.all([
            unlink(inputPath).catch(() => { }),
            unlink(finalOutputPath).catch(() => { })
        ]);

        // 6. Log Usage (10 Credits for Video - High resource)
        const duration = Math.round(performance.now() - startTime);
        UsageService.logRequest({
            user_id: userId,
            endpoint: "/api/v1/video",
            method: "POST",
            status_code: 200,
            duration_ms: duration,
        });

        return NextResponse.json({
            success: true,
            data: {
                base64: base64Data,
                mime_type: mimeType,
                filename: path.basename(finalOutputPath)
            },
            meta: {
                duration_ms: duration,
                credits_used: 10
            }
        });

    } catch (error) {
        // Cleanup on error
        unlink(inputPath).catch(() => { });
        unlink(outputPath + ".mp4").catch(() => { });
        unlink(outputPath + ".jpg").catch(() => { });

        status = 500;
        let errorMessage = "Internal Server Error";
        let errorDetails: unknown = String(error);

        if (error instanceof z.ZodError) {
            status = 400;
            errorMessage = "Invalid Input";
            errorDetails = error.issues;
        }

        // Log Failure
        const duration = Math.round(performance.now() - startTime);
        if (userId) {
            UsageService.logRequest({
                user_id: userId,
                endpoint: "/api/v1/video",
                method: "POST",
                status_code: status,
                duration_ms: duration,
            });
        }

        return NextResponse.json({
            error: errorMessage,
            details: errorDetails
        }, { status });
    }
}
