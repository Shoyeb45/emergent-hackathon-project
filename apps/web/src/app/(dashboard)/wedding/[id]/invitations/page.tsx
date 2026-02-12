"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { guestsApi } from "@/lib/api";

export default function WeddingInvitationsPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<{ guestName?: string; weddingTitle?: string } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await guestsApi.add(weddingId, {
        guests: [{ email: email.trim() }],
      });
      if (res.errors?.length) {
        setError(res.errors.map((e) => `${e.email}: ${e.error}`).join(". "));
      } else {
        setSuccess(`Invitation sent to ${email}.`);
        setEmail("");
        setName("");
        setPreview({ guestName: name || email.split("@")[0], weddingTitle: "Wedding" });
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-8 mb-8">
        <h3 className="font-serif text-lg font-semibold text-[#2B2B2B] mb-6">
          Send Invitation
        </h3>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
              Guest Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B]"
              placeholder="Guest name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B]"
              placeholder="guest@example.com"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-emerald-700 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold disabled:opacity-70"
          >
            {loading ? "Sending…" : "Send Invitation"}
          </button>
        </form>
      </div>

      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-[#C6A75E]/50 bg-[#4A0E2B] p-8 text-center max-w-md"
        >
          <p className="text-[#C6A75E]/80 text-xs uppercase tracking-wider mb-2">
            Invitation preview
          </p>
          <p className="font-serif text-[#F8F8F8] text-xl mb-1">
            {preview.weddingTitle}
          </p>
          <p className="text-[#F8F8F8]/80">
            You&apos;re invited, {preview.guestName}.
          </p>
        </motion.div>
      )}
    </div>
  );
}
