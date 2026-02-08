export function CodeDemo() {
    return (
        <section className="relative z-10 py-24 bg-[#050505]">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Column: Text */}
                <div>
                    <span className="text-xs font-mono text-[var(--signal-orange)] uppercase tracking-widest">
                        DEVELOPER EXPERIENCE
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-4">
                        <span className="text-blue-500">{"///"}</span> INTEGRATE IN SECONDS
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed mt-6">
                        Stop wrestling with complexities. Danrit provides a unified, typed SDK for every engine.
                        Just install and deploy.
                    </p>
                    <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded border border-white/10 bg-white/5 font-mono text-sm text-zinc-300">
                        <span className="text-zinc-500">$</span>
                        npm install @danrit/sdk
                    </div>
                </div>

                {/* Right Column: Code Block */}
                <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl shadow-blue-900/10">
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        <span className="ml-4 text-xs font-mono text-zinc-500">example.ts</span>
                    </div>

                    {/* Code Content */}
                    <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                        <p className="mb-1">
                            <span className="text-pink-400">const</span>{" "}
                            <span className="text-blue-400">danrit</span> ={" "}
                            <span className="text-yellow-400">new</span>{" "}
                            <span className="text-green-400">Danrit</span>(process.env.KEY);
                        </p>
                        <p className="mb-4 text-zinc-600">{"// Initialize once, use everywhere"}</p>

                        <p className="text-zinc-600 mb-1">{"// 1. Extract web content"}</p>
                        <p className="mb-4">
                            <span className="text-pink-400">const</span> article ={" "}
                            <span className="text-pink-400">await</span> danrit.scrape.
                            <span className="text-blue-400">extract</span>(
                            <span className="text-green-300">&quot;https://...&quot;</span>);
                        </p>

                        <p className="text-zinc-600 mb-1">{"// 2. Generate a PDF"}</p>
                        <p className="mb-4">
                            <span className="text-pink-400">const</span> pdf ={" "}
                            <span className="text-pink-400">await</span> danrit.pdf.
                            <span className="text-blue-400">create</span>(article.content);
                        </p>

                        <p className="text-zinc-600 mb-1">{"// 3. Send via Email"}</p>
                        <p>
                            <span className="text-pink-400">await</span> danrit.mail.
                            <span className="text-blue-400">send</span>({"{"} to: <span className="text-green-300">&quot;user@...&quot;</span>, attach: pdf {"}"});
                        </p>

                        <p className="mt-4 text-[var(--signal-orange)] animate-pulse">_</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
