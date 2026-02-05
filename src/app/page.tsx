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
        <div className="absolute inset-0 z-0 fiber-optic opacity-40 mix-blend-screen" />

        {/* Globe Overlay with Gradient Mask */}
        <div className="absolute inset-0 z-10 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-20 h-full w-full" />
          <Globe />
        </div>
      </div>

      <Navbar />

      {/* THE MONOLITH: HERO CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col pt-24 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto">
        <BentoGrid />
      </div>

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
