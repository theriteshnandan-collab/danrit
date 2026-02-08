import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ArsenalGrid } from "@/components/landing/ArsenalGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";

// Dynamically import animated components to avoid SSR issues
const TerminalDemo = dynamic(
  () => import("@/components/landing/TerminalDemo").then((mod) => mod.TerminalDemo),
  { ssr: false }
);

// Optional: Keep old Globe for background if desired
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] selection:bg-orange-600 selection:text-white">

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grain Overlay */}
        <div className="absolute inset-0 z-20 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/5 via-transparent to-transparent" />

        {/* Optional Globe Background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <Globe />
        </div>
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <Hero />

      {/* TECH TICKER - Fills the visual gap */}
      <div className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden py-3">
        <div className="flex gap-16 animate-infinite-scroll whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-16 items-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              <span>System Status: <span className="text-emerald-500">OPTIMAL</span></span>
              <span>Latency: <span className="text-amber-400">12ms</span></span>
              <span>Encryption: <span className="text-zinc-400">AES-256</span></span>
              <span>Uptime: <span className="text-zinc-400">99.99%</span></span>
              <span>Active Nodes: <span className="text-amber-500">8,492</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* TERMINAL DEMO */}
      <TerminalDemo />

      {/* ARSENAL GRID */}
      <div id="arsenal">
        <ArsenalGrid />
      </div>

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* SOCIAL PROOF */}
      <section className="relative z-10 py-16 border-y border-white/5 bg-[#050505]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest mb-8">
            Trusted by Next-Gen Builders
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500">
            <span className="text-xl font-black text-white tracking-tighter">
              ACME<span className="text-blue-500">CORP</span>
            </span>
            <span className="text-xl font-bold text-white tracking-widest">VERTEX</span>
            <span className="text-xl font-mono text-white">OBSIDIAN.io</span>
            <span className="text-xl font-black text-white italic">NEXUS</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
