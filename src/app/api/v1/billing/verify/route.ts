import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        // 2. Update Tier in DB
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { error } = await supabase
            .from('usage_metrics')
            .update({ tier: 'pro' })
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Account Upgraded to PRO" });

    } catch (error) {
        const err = error as Error;
        console.error("Verification Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
