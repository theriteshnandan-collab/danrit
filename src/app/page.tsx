import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import { Shield, Zap, CircleDollarSign } from "lucide-react";

// Dynamically import Globe to avoid SSR issues with Three.js
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Background Globe */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505] z-10 h-full w-full pointer-events-none" />
        <Globe />
      </div>

      <Hero />

      {/* Feature Grid (The "Why") */}
      <section className="relative z-10 py-24 px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 border border-white/10 bg-white/[0.02] rounded-[2px] hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-[2px] bg-[#FF4F00]/10 flex items-center justify-center mb-6 text-[#FF4F00]">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">The API for Agents</h3>
            <p className="text-[#666] text-sm leading-relaxed">
              Scrape, PDF, Mail, Screenshot, QR, and DNS.
              Six powerful engines, one unified API Key.
              Designed for LLM tool calling.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 border border-white/10 bg-white/[0.02] rounded-[2px] hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-[2px] bg-[#3B82F6]/10 flex items-center justify-center mb-6 text-[#3B82F6]">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Undetectable</h3>
            <p className="text-[#666] text-sm leading-relaxed">
              Enterprise-grade fingerprint resolution.
              We handle the headless browsers, captchas, and proxies.
              You just get the JSON.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 border border-white/10 bg-white/[0.02] rounded-[2px] hover:border-white/20 transition-colors">
            <div className="w-10 h-10 rounded-[2px] bg-[#00E054]/10 flex items-center justify-center mb-6 text-[#00E054]">
              <CircleDollarSign size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">One Wallet</h3>
            <p className="text-[#666] text-sm leading-relaxed">
              Forget subscribing to 5 different SaaS tools.
              Buy Danrit Credits once. Spend them on any engine.
              Scale from $5 to IPO.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-[#444] text-xs">
        <p>© 2026 DANRIT SYSTEMS. ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}
