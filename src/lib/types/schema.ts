import { z } from "zod";

// --- DATABASE MODELS ---

/**
 * usage_logs
 * Tracks every API request for billing and telemetry.
 */
export const UsageLogSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    key_id: z.string().uuid().optional(), // Which API key was used
    endpoint: z.string(), // e.g., "/api/v1/scrape"
    method: z.string(), // "POST"
    status_code: z.number().int(),
    duration_ms: z.number().int(),
    created_at: z.string().datetime(),
    ip_address: z.string().optional(),
    cost: z.number().optional(), // Calculated cost in credits
});

export type UsageLog = z.infer<typeof UsageLogSchema>;

/**
 * api_keys
 * Stores hashed API keys.
 */
export const ApiKeySchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    name: z.string(),
    key_hash: z.string(),
    key_prefix: z.string(), // First 8 chars for display
    created_at: z.string().datetime(),
    last_used_at: z.string().datetime().nullable(),
    is_active: z.boolean(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

// --- API CONTRACTS (Responses) ---

export const ScrapeResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(), // The scraped content
    meta: z.object({
        duration_ms: z.number(),
        credits_used: z.number(),
    }),
});

export const UsageStatsSchema = z.object({
    total_requests: z.number(),
    success_rate: z.number(), // 0-100
    recent_logs: z.array(UsageLogSchema),
});

// --- DANRIT ENGINE CONTRACTS ---

export const PdfRequestSchema = z.object({
    url: z.string().url(),
    format: z.enum(["a4", "letter"]).optional().default("a4"),
    print_background: z.boolean().optional().default(true),
});

export const MailRequestSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1),
    html: z.string().min(1),
    from_name: z.string().optional(),
});

export const ShotRequestSchema = z.object({
    url: z.string().url(),
    width: z.number().int().min(100).max(3840).optional().default(1920),
    height: z.number().int().min(100).max(2160).optional().default(1080),
    full_page: z.boolean().optional().default(false),
});

export const QrRequestSchema = z.object({
    text: z.string().min(1).max(2000),
    width: z.number().int().min(100).max(2000).optional().default(500),
    color: z.enum(["black", "blue", "red"]).optional().default("black"),
});

export const DnsRequestSchema = z.object({
    domain: z.string().min(1),
    type: z.enum(["A", "MX", "TXT", "NS", "CNAME"]).optional().default("A"),
});

export const OcrRequestSchema = z.object({
    url: z.string().url("Valid Image URL is required"),
    lang: z.string().default("eng"), // 'eng', 'spa', 'fra', etc.
});

export const VideoRequestSchema = z.object({
    url: z.string().url("Valid Video URL is required"),
    action: z.enum(["compress", "thumbnail", "convert"]),
    options: z.object({
        width: z.number().optional(), // For resizing/thumbnail
        height: z.number().optional(),
        format: z.string().optional(), // 'mp4', 'mov' etc.
        quality: z.string().optional(), // 'low', 'medium', 'high'
        time: z.string().optional(), // '00:00:05' for thumbnail
    }).optional(),
});

export type OcrRequest = z.infer<typeof OcrRequestSchema>;
export type VideoRequest = z.infer<typeof VideoRequestSchema>;

export interface SharedApiResult {
    title?: string;
    content?: string;
    url?: string;
    image?: string;
    records?: unknown[];
    success?: boolean;
    error?: string;
    metadata?: {
        author?: string;
        date?: string;
        [key: string]: unknown;
    };
}
