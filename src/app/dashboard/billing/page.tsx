"use client";

import { Coins, Zap, Package } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const CREDIT_PACKS = [
    { id: "starter", name: "Starter", credits: 100, price: "$5", priceInCents: 500, popular: false },
    { id: "growth", name: "Growth", credits: 500, price: "$20", priceInCents: 2000, popular: true },
    { id: "pro", name: "Pro", credits: 2000, price: "$50", priceInCents: 5000, popular: false },
];

export default function BillingPage() {
    const { data: stats } = useSWR("/api/v1/user/stats", fetcher);
    const credits = stats?.credits_balance ?? 50;
    const tier = stats?.tier ?? "free";

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {/* HEADER */}
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Billing & Credits
                    </span>
                </h1>
                <p className="text-zinc-500">
                    Pro plans are launching soon. Enjoy free credits while we're in beta!
                </p>
            </div>

            {/* CURRENT BALANCE CARD */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Current Balance</p>
                        <div className="flex items-center gap-3">
                            <Coins className="w-8 h-8 text-amber-500" />
                            <span className="text-4xl font-bold text-amber-400">{credits}</span>
                            <span className="text-xl text-zinc-500">Credits</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Plan</p>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${tier === "pro" ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/30" : "bg-zinc-700/30 text-zinc-400 border border-zinc-600/30"}`}>
                            {tier.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* CREDIT PACKS */}
            <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    Credit Packs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CREDIT_PACKS.map((pack) => (
                        <div
                            key={pack.id}
                            className={`relative p-6 rounded-xl border transition-all ${pack.popular ? "bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700/50 ring-1 ring-amber-500/20" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"}`}
                        >
                            {pack.popular && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-black text-[10px] font-bold uppercase rounded-full">
                                    Most Popular
                                </span>
                            )}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-1">{pack.name}</h3>
                                <div className="text-3xl font-bold text-amber-400 mb-1">{pack.credits}</div>
                                <p className="text-sm text-zinc-500">Credits</p>
                                <div className="my-4 text-2xl font-bold text-white opacity-50">{pack.price}</div>
                                <button
                                    className="w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
                                    disabled
                                >
                                    <Zap size={16} />
                                    Coming Soon
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PRICING TABLE */}
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Tool Pricing
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div className="p-3 rounded-lg bg-zinc-800/50">
                        <div className="text-zinc-400 mb-1">DNS / QR</div>
                        <div className="text-emerald-400 font-bold">FREE</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800/50">
                        <div className="text-zinc-400 mb-1">Email</div>
                        <div className="text-amber-400 font-bold">1 Credit</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800/50">
                        <div className="text-zinc-400 mb-1">Scraper</div>
                        <div className="text-amber-400 font-bold">2 Credits</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800/50">
                        <div className="text-zinc-400 mb-1">PDF / Shot</div>
                        <div className="text-orange-400 font-bold">5 Credits</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800/50">
                        <div className="text-zinc-400 mb-1">Video Info</div>
                        <div className="text-orange-400 font-bold">5 Credits</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800/50">
                        <div className="text-zinc-400 mb-1">Video Download</div>
                        <div className="text-rose-400 font-bold">10 Credits</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
