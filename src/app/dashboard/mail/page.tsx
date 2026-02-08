"use client";

import { useState } from "react";
import { Mail, Send, Loader2, Check } from "lucide-react";

export default function MailPage() {
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSend() {
        if (!to || !subject) return;
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch("/api/v1/mail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to, subject, html: body })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSuccess(true);
                setTo("");
                setSubject("");
                setBody("");
            } else {
                setError(data.error || "Email sending failed");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div>
                <span className="label">TOOL / MAIL</span>
                <h1 className="text-3xl font-heading mt-2">EMAIL SENDER</h1>
                <p className="text-sm text-[var(--ash)] mt-2">Send transactional emails via the DANRIT mail infrastructure.</p>
            </div>

            {/* FORM */}
            <div className="panel p-6 space-y-6">
                <div>
                    <label className="label">RECIPIENT</label>
                    <input
                        type="email"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="recipient@example.com"
                        className="w-full mt-2 bg-transparent border border-[var(--border)] px-4 py-3 text-sm font-mono focus:border-[var(--bone)] outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="label">SUBJECT</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Your subject line..."
                        className="w-full mt-2 bg-transparent border border-[var(--border)] px-4 py-3 text-sm focus:border-[var(--bone)] outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="label">MESSAGE (HTML OR PLAIN TEXT)</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your email content here..."
                        rows={8}
                        className="w-full mt-2 bg-transparent border border-[var(--border)] px-4 py-3 text-sm font-mono focus:border-[var(--bone)] outline-none transition-colors resize-none"
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={loading || !to || !subject}
                    className="btn-primary px-6 flex items-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {loading ? "SENDING..." : "TRANSMIT"}
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="panel p-4 border-[var(--signal-red)] bg-[var(--signal-red)]/10">
                    <p className="text-sm text-[var(--signal-red)]">{error}</p>
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div className="panel p-4 border-green-500 bg-green-500/10">
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <p className="text-sm text-green-500">Email sent successfully!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
