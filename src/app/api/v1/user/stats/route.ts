import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { UsageService } from "@/lib/services/usage";

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (req, { user_id }) => {
    try {
        const stats = await UsageService.getUserStats(user_id);
        return NextResponse.json(stats);
    } catch (error: unknown) {
        console.error("Stats Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
});
