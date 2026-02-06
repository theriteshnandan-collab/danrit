import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get("secret");

    // The secret must match the env var
    // Default fallback to prevent lock-out if env not set: "danrit-admin-unlock"
    const MAINTENANCE_SECRET = process.env.MAINTENANCE_SECRET || "danrit-admin-unlock";

    if (secret !== MAINTENANCE_SECRET) {
        return NextResponse.json({ error: "Invalid Secret" }, { status: 401 });
    }

    // Determine domain for cookie (localhost vs production)
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    // Set the cookie that acts as the "Key"
    response.cookies.set("x-danrit-maintenance-bypass", "true", {
        httpOnly: true,
        secure: isProduction,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax"
    });

    return response;
}
