
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { UsageService } from "@/lib/services/usage";

export async function GET() {
    const supabase = createClient();

    // 1. Auth Check (Ironclad)
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 2. Fetch Stats
        const stats = await UsageService.getUserStats(user.id);

        // 3. Return Typed Response
        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
