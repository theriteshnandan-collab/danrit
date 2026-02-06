"use client";

import { motion } from "framer-motion";
import { Camera, FileText, Globe2, ScanSearch, Terminal, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";

const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

const engines = [
  {
    title: "Scrape-Jet",
    tag: "Stealth Capture",
    copy: "Extract clean structured payloads from hostile pages with anti-bot resistance.",
    icon: ScanSearch,
  },
  {
    title: "PDF-Jet",
    tag: "Print Fidelity",
    copy: "Compile production-grade PDF from HTML/CSS with predictable pagination and fonts.",
    icon: FileText,
  },
  {
    title: "Shot-Jet",
    tag: "4K Retina",
    copy: "Render deterministic screenshots with lazy-load stabilization and viewport control.",
    icon: Camera,
  },
  {
    title: "Vision Core",
    tag: "Context Ops",
    copy: "Feed pixel and document intelligence into autonomous agents in one signed request.",
    icon: Globe2,
  },
];

const trust = ["AERODYNE SYSTEMS", "BLACKLATTICE", "NOVA FREIGHT", "ORBITAL NEXUS", "KINETIC BANK"];

export function MonolithLanding() {
  const [url, setUrl] = useState("https://danrit.tech");
  const [html, setHtml] = useState("<h1>Mission Report</h1><p>Danrit powers unified execution across scraping, PDF, screenshot and vision.</p>");

  const pseudoScrapeResult = useMemo(() => {
    const domain = url.replace(/^https?:\/\//, "").split("/")[0] || "target.local";
    return {
      title: `Intel Packet: ${domain}`,
      latency: "218ms",
      entities: ["pricing", "documentation", "status", "careers"],
    };
  }, [url]);

  return (
    <main className="monolith-shell">
      <div className="monolith-backdrop" aria-hidden>
        <div className="noise-overlay" />
        <div className="scanlines" />
        <div className="grid-warp" />
        <div className="globe-stage">
          <Globe />
        </div>
      </div>

      <section className="hero-frame container-wide">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="hero-stack"
        >
          <p className="kicker">Universal API Infrastructure</p>
          <h1 className="hero-title">ONE KEY. ALL TOOLS.</h1>
          <p className="hero-subtitle">
            DANRIT is mission-control infrastructure for the next internet: scraping, PDF generation,
            screenshot capture and vision pipelines through one obsidian-grade interface.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard" className="btn-massive">
              Enter Mission Control <Terminal size={16} />
            </Link>
            <Link href="/dashboard/laboratory" className="btn-ghost">
              Live Engine Lab <Zap size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container-wide trust-strip glass-panel">
        {trust.map((name, index) => (
          <motion.span
            key={name}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 0.55, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            {name}
          </motion.span>
        ))}
      </section>

      <section className="container-wide bento-grid">
        <motion.article className="glass-panel bento-card bento-lg" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bento-head">
            <p className="kicker">Interactive Demo · Scrape-Jet</p>
            <h3>Live Extraction Feed</h3>
          </div>
          <input
            className="deck-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://target-site.com"
          />
          <div className="result-box">
            <p>{pseudoScrapeResult.title}</p>
            <p>Latency: {pseudoScrapeResult.latency}</p>
            <p>Signals: {pseudoScrapeResult.entities.join(" · ")}</p>
          </div>
        </motion.article>

        <motion.article className="glass-panel bento-card bento-lg" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bento-head">
            <p className="kicker">Interactive Demo · PDF-Jet</p>
            <h3>Instant Document Preview</h3>
          </div>
          <textarea className="deck-input deck-textarea" value={html} onChange={(e) => setHtml(e.target.value)} />
          <div className="result-box result-box-strong">
            <p>Compiled output: mission-report.pdf</p>
            <p>Pages: 1 · Color profile: Print</p>
            <p>Content snapshot: {html.slice(0, 86)}...</p>
          </div>
        </motion.article>

        {engines.map((engine, index) => (
          <motion.article
            key={engine.title}
            className="glass-panel bento-card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04 }}
          >
            <div className="engine-icon-wrap">
              <engine.icon size={20} />
            </div>
            <p className="engine-tag">{engine.tag}</p>
            <h4>{engine.title}</h4>
            <p>{engine.copy}</p>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
