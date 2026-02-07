"use client";

import { useState } from "react";
import { Shield, Loader2, Mail, Lock, Hexagon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const useRouterHook = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                alert("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                useRouterHook.push("/");
                useRouterHook.refresh();
            }
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            let origin = window.location.origin;
            if (window.location.hostname === "danrit.tech") {
                origin = "https://danrit.tech";
            }
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${origin}/auth/callback` },
            });
            if (error) throw error;
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Google Authentication Failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* AMBIENT GLOWS (The 3rd Color: CYAN) */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00F0FF] opacity-[0.03] blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#FF4F00] opacity-[0.03] blur-[100px] pointer-events-none" />

            {/* THE MONOLITH CARD */}
            <div className="w-full max-w-[400px] bg-[#0A0A0A] border border-[#222] relative z-10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                {/* STRIPE HEADER (The 2nd Color: ORANGE) */}
                <div className="h-1 bg-[#FF4F00] w-full" />

                <div className="p-8">
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <Hexagon className="text-[#FF4F00]" size={24} strokeWidth={2} />
                            <h1 className="text-xl font-bold tracking-tight text-white">DANRIT<span className="text-[#444]">_GATE</span></h1>
                        </div>
                        <p className="text-[11px] text-[#666] uppercase tracking-widest font-mono">Secure Access Terminal v2.1</p>
                    </header>

                    <button
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className="w-full bg-[#111] hover:bg-[#161616] text-white py-3 border border-[#333] mb-6 flex items-center justify-center gap-3 transition-all duration-200 group"
                    >
                        {isLoading ? <Loader2 className="animate-spin text-[#888]" size={16} /> : (
                            <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center text-[10px] group-hover:bg-white group-hover:text-black transition-colors">G</div>
                        )}
                        <span className="text-xs font-medium tracking-wide">CONTINUE WITH GOOGLE</span>
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-[#222] flex-1" />
                        <span className="text-[10px] text-[#444] font-mono">OR</span>
                        <div className="h-px bg-[#222] flex-1" />
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-[10px] font-bold text-[#666] uppercase tracking-wider">Identity</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#00F0FF] transition-colors" size={16} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="OPERATOR@DANRIT.TECH"
                                    className="w-full bg-[#050505] border border-[#222] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00F0FF] transition-colors font-mono placeholder:text-[#333]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-[10px] font-bold text-[#666] uppercase tracking-wider">Passcode</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#00F0FF] transition-colors" size={16} />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#050505] border border-[#222] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#00F0FF] transition-colors font-mono placeholder:text-[#333]"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-[#110505] border border-[#FF4F00]/30 text-[#FF4F00] text-xs flex items-center gap-2">
                                <Shield size={12} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            disabled={isLoading}
                            className="w-full bg-[#E5E5E5] text-black py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                            {isSignUp ? "INITIALIZE" : "AUTHENTICATE"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-xs text-[#666] hover:text-[#00F0FF] transition-colors"
                        >
                            {isSignUp ? "Have an account? Login" : "No credentials? Request Access"}
                        </button>
                    </div>
                </div>

                <div className="h-1 w-full bg-gradient-to-r from-[#FF4F00] via-[#000000] to-[#00F0FF]" />
            </div>
        </div>
    );
}

