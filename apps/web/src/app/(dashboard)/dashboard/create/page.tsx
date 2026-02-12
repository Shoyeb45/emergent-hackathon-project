"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { weddingsApi, ApiClientError } from "@/lib/api";

export default function CreateWeddingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const wedding = await weddingsApi.create({
        title,
        weddingDate,
        venue: venue || undefined,
        description: description || undefined,
      });
      router.push(`/wedding/${wedding.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || "Failed to create wedding.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-[1280px] mx-auto">
      <Link
        href="/dashboard"
        className="text-[#C6A75E] hover:underline text-sm font-medium mb-6 inline-block"
      >
        ← Back to dashboard
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white shadow-lg border border-[#C6A75E]/20 p-8 max-w-xl"
      >
        <h1 className="font-serif text-2xl font-semibold text-[#2B2B2B] mb-6">
          Host a Wedding
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#2B2B2B] font-medium text-sm mb-1">
              Wedding Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/50"
              placeholder="e.g. Priya & Rahul"
            />
          </div>
          <div>
            <label className="block text-[#2B2B2B] font-medium text-sm mb-1">
              Date
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              required
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/50"
            />
          </div>
          <div>
            <label className="block text-[#2B2B2B] font-medium text-sm mb-1">
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/50"
              placeholder="Venue name"
            />
          </div>
          <div>
            <label className="block text-[#2B2B2B] font-medium text-sm mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/50 resize-none"
              placeholder="A few words about your wedding"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#2B2B2B]/30 border-t-[#2B2B2B] rounded-full animate-spin" />
            ) : (
              "Create Wedding"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
