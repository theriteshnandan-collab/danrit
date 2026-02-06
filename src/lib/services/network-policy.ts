import dns from 'node:dns/promises';
import net from 'node:net';

const DENIED_HOSTNAMES = new Set([
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0',
    'metadata.google.internal',
]);

const DENIED_SUFFIXES = ['.local', '.internal', '.localhost'];

function isPrivateIp(ip: string) {
    if (net.isIPv4(ip)) {
        const [a, b] = ip.split('.').map(Number);
        if (a === 10) return true;
        if (a === 127) return true;
        if (a === 169 && b === 254) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 192 && b === 168) return true;
        return false;
    }

    if (net.isIPv6(ip)) {
        const lower = ip.toLowerCase();
        return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
    }

    return false;
}

function isExplicitlyAllowed(hostname: string) {
    const configured = (process.env.BROWSER_TARGET_ALLOWLIST ?? '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

    if (configured.length === 0) {
        return true;
    }

    return configured.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
}

function isDenied(hostname: string) {
    if (DENIED_HOSTNAMES.has(hostname)) return true;
    return DENIED_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

export async function assertUrlIsSafe(rawUrl: string) {
    let target: URL;

    try {
        target = new URL(rawUrl);
    } catch {
        throw new Error('Invalid URL');
    }

    if (!['http:', 'https:'].includes(target.protocol)) {
        throw new Error('Unsupported URL protocol');
    }

    const hostname = target.hostname.toLowerCase();

    if (!isExplicitlyAllowed(hostname)) {
        throw new Error('Host is not in allowlist');
    }

    if (isDenied(hostname)) {
        throw new Error('Target hostname is blocked');
    }

    if (net.isIP(hostname) && isPrivateIp(hostname)) {
        throw new Error('Private network targets are blocked');
    }

    const records = await dns.lookup(hostname, { all: true });
    if (records.some((record) => isPrivateIp(record.address))) {
        throw new Error('Target resolves to a private network address');
    }

    return target.toString();
}

export async function runWithAbort<T>(
    promiseFactory: (signal: AbortSignal) => Promise<T>,
    signal: AbortSignal,
): Promise<T> {
    if (signal.aborted) {
        throw signal.reason instanceof Error ? signal.reason : new Error('Request aborted');
    }

    return await Promise.race([
        promiseFactory(signal),
        new Promise<T>((_, reject) => {
            signal.addEventListener('abort', () => {
                reject(signal.reason instanceof Error ? signal.reason : new Error('Request aborted'));
            }, { once: true });
        }),
    ]);
}
