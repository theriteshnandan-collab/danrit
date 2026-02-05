import dynamic from "next/dynamic";
import { BentoGrid } from "@/components/BentoGrid";
import { Navbar } from "@/components/Navbar";
import { Heart } from "lucide-react";

// Dynamically import Globe to avoid SSR issues with Three.js
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] selection:bg-blue-600 selection:text-white">

      {/* BACKGROUND: DEEP VOID + FIBER OPTIC BLOOM */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Grain Overlay */}
        <div className="absolute inset-0 z-20 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Fiber Optic Bloom (Animated in globals.css) */}
        <div className="absolute inset-0 z-0 fiber-optic opacity-20 mix-blend-screen" />

        {/* HUD Grid Overlay */}
        <div className="absolute inset-0 z-0 tech-grid" />

        {/* Scan Line */}
        <div className="scan-line" />

        {/* Globe - CRYSTAL CLEAR VISIBILITY */}
        <div className="absolute inset-0 z-10 opacity-80">
          {/* Subtle gradient at bottom only to blend with footer */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none" />
          <Globe />
        </div>
      </div>

      <Navbar />

      {/* THE MONOLITH: HERO CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col pt-32 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto">
        <BentoGrid />
      </div>

      {/* SECTION: SOCIAL PROOF (TRUST STRIP) */}
      <section className="relative z-10 py-12 border-y border-white/5 bg-[#050505]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-8">Trusted by Next-Gen Builders</p>
          <div className="flex justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simulated Logos using Text for now (can be replaced with SVGs) */}
            <span className="text-xl font-black text-white tracking-tighter">ACME<span className="text-blue-600">CORP</span></span>
            <span className="text-xl font-bold text-white tracking-widest">VERTEX</span>
            <span className="text-xl font-mono text-white">OBSIDIAN.io</span>
            <span className="text-xl font-black text-white italic">NEXUS</span>
          </div>
        </div>
      </section>

      {/* SECTION: CODE DEMO (DEVELOPER EXPERIENCE) */}
      <section className="relative z-10 py-24 bg-[#050505]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tighter mb-4">
              <span className="text-blue-600">///</span> INTEGRATE IN SECONDS
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Stop wrestling with complexities. Danrit provides a unified, typed SDK for every engine. Just install and deploy.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 border border-white/10 bg-white/5 rounded text-sm text-zinc-300 font-mono">
                npm install @danrit/sdk
              </div>
            </div>
          </div>

          {/* TERMINAL MOCKUP */}
          <div className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl shadow-blue-900/10">
            <div className="flex gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="p-6 font-mono text-sm text-blue-100/90 overflow-x-auto">
              <p className="mb-2"><span className="text-pink-500">const</span> <span className="text-blue-400">danrit</span> = <span className="text-yellow-400">new</span> <span className="text-green-400">Danrit</span>(process.env.KEY);</p>
              <p className="mb-2"><span className="text-zinc-500">// 1. Scrape the entire web</span></p>
              <p className="mb-4"><span className="text-pink-500">await</span> danrit.scrape.<span className="text-blue-400">extract</span>(<span className="text-green-300">"https://example.com"</span>);</p>
              <p className="mb-2"><span className="text-zinc-500">// 2. Generate PDF Invoice</span></p>
              <p className="mb-4"><span className="text-pink-500">await</span> danrit.pdf.<span className="text-blue-400">create</span>(htmlContent);</p>
              <p className="text-zinc-500 animate-pulse">_</p>
            </div>
          </div>
        </div>
      </section>

      {/* BILLION DOLLAR FOOTER */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* LEFT: BRAND */}
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h3 className="text-xl font-black tracking-tighter text-white uppercase">DAN-RIT</h3>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
              The Universal API Standard
            </p>
          </div>

          {/* CENTER: LOVE SIGNATURE */}
          <div className="flex items-center gap-2 px-6 py-3 border border-white/5 rounded-full bg-white/5 hover:bg-white/10 transition-colors group cursor-default">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest group-hover:text-white transition-colors">
              Made with Love
            </span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
          </div>

          {/* RIGHT: CONTACT */}
          <div className="flex flex-col gap-1 text-center md:text-right">
            <a href="mailto:zunios.codes@gmail.com" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">
              zunios.codes@gmail.com
            </a>
            <a href="https://x.com/zunios_codes" target="_blank" rel="noreferrer" className="text-xs font-mono text-blue-500 hover:text-blue-400 transition-colors font-bold">
              @zunios.codes
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
