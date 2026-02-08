import { Heart } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative z-10 pt-1 bg-[#050505]">
            {/* Gradient Border Line */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 py-20">
                {/* Pre-Footer CTA */}
                <div className="text-center mb-20 pb-16 border-b border-zinc-800/50">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                            Ready to Build Something
                        </span>{" "}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Amazing?
                        </span>
                    </h2>
                    <p className="text-zinc-500 mt-4 text-sm">Join thousands of developers using DANRIT.</p>
                    <a
                        href="/login"
                        className="group inline-flex items-center justify-center gap-3 px-8 py-4 mt-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-wider hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-orange-600/25"
                    >
                        Get Started Free
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    {/* Left: Brand */}
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase">
                            DANRIT
                        </h3>
                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-2">
                            The Universal API Standard
                        </p>
                    </div>

                    {/* Center: Made with Love */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-amber-700/20 bg-amber-900/10">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                                Made with Love
                            </span>
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Right: Contact */}
                    <div className="text-center md:text-right space-y-2">
                        <a
                            href="mailto:zunios.codes@gmail.com"
                            className="block text-sm font-mono text-zinc-500 hover:text-amber-400 transition-colors"
                        >
                            zunios.codes@gmail.com
                        </a>
                        <a
                            href="https://x.com/zunios_codes"
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm font-mono text-amber-500 hover:text-amber-400 transition-colors font-bold"
                        >
                            @zunios.codes
                        </a>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center mt-16 pt-8 border-t border-zinc-800/50">
                    <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                        © {new Date().getFullYear()} DANRIT. All Systems Operational.
                    </p>
                </div>
            </div>
        </footer>
    );
}
