"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-zinc-400 hover:text-white hover:bg-white/10"
        >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
        </Button>
    );
}
