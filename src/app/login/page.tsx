"use client";

import { useState } from "react";
import { Shield, Loader2, Mail, Lock, Chrome } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

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
                router.push("/");
                router.refresh();
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
            // Priority: Hardcoded URL for Production > window.location.origin
            const isProduction = window.location.hostname !== "localhost";
            const origin = isProduction
                ? "https://pdf-jet-cyan.vercel.app"
                : window.location.origin;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Google Authentication Failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 font-mono">
            {/* Background Grain Effect */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="w-full max-w-md bg-background border border-[var(--border)] relative z-10 overflow-hidden shadow-2xl">
                {/* Accent Top Bar */}
                <div className="h-1 bg-primary w-full" />

                <div className="p-8">
                    <header className="text-center mb-8">
                        <div className="w-12 h-12 border border-[var(--border)] flex items-center justify-center mx-auto mb-4 bg-muted/50">
                            <Shield className="text-primary" size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase">PDF-JET GATE</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">Secure Access Terminal</p>
                    </header>

                    <style jsx global>{`
                        input:-webkit-autofill,
                        input:-webkit-autofill:hover, 
                        input:-webkit-autofill:focus, 
                        input:-webkit-autofill:active {
                            -webkit-box-shadow: 0 0 0 30px black inset !important;
                            -webkit-text-fill-color: white !important;
                            caret-color: white !important;
                        }
                    `}</style>

                    <button
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className="w-full bg-white text-black py-3 mb-6 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 border border-white/20"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={14} /> : <Chrome size={14} />}
                        <span>Connect_via_Google</span>
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-border flex-1 opacity-20" />
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">OR_USE_PROTOCOL</span>
                        <div className="h-px bg-border flex-1 opacity-20" />
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Email_Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="operator@system.io"
                                    className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Security_Pass</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] uppercase font-bold tracking-wider animate-in fade-in slide-in-from-top-1">
                                [Error]: {error}
                            </div>
                        )}

                        <button
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground py-4 font-black uppercase text-xs tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
                            {isSignUp ? "INITIALIZE_IDENTITY" : "ESTABLISH_CONNECTION"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[10px] text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors font-bold"
                        >
                            {isSignUp ? "Existing User? Connect_Terminal" : "New Operator? Request_Access"}
                        </button>
                    </div>
                </div>

                <footer className="bg-muted/30 p-4 border-t border-[var(--border)] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Auth_Node_Online</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground opacity-30 font-bold uppercase cursor-default select-none tracking-widest">Secure TLS 1.3</span>
                </footer>
            </div>
        </div>
    );
}
