import dynamic from "next/dynamic";
import { BentoGrid } from "@/components/BentoGrid";

// Dynamically import Globe to avoid SSR issues with Three.js
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] selection:bg-blue-600 selection:text-white">

      {/* Background Globe - Wireframe Aesthetics */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-10 h-full w-full pointer-events-none" />
        <Globe />
      </div>

      {/* The Monolith Interface */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center">
        <BentoGrid />
      </div>

      {/* Industrial Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600">
          System Status: Operational • Danrit Corp © 2026
        </p>
      </footer>
    </main>
  );
}
