import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Missing Razorpay Keys in environment");
            return NextResponse.json({ error: "Billing setup incomplete" }, { status: 500 });
        }

        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { } // Read only here
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const order = await razorpay.orders.create({
            amount: 250000, // ₹2500 INR
            currency: "INR",
            receipt: `receipt_${user.id.substring(0, 10)}`,
        });

        return NextResponse.json({ orderId: order.id });

    } catch (error) {
        const err = error as Error;
        console.error("Razorpay Order Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
