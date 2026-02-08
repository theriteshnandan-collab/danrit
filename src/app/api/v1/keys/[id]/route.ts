import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const keyId = params.id;

    // Verify ownership before deleting
    const { count } = await supabase
        .from("api_keys")
        .select("*", { count: "exact", head: true })
        .eq("id", keyId)
        .eq("user_id", user.id);

    if (count === 0) {
        return new NextResponse("Key not found or unauthorized", { status: 404 });
    }

    const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return new NextResponse(null, { status: 200 });
}
