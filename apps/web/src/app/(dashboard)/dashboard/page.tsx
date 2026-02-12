"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { weddingsApi, type Wedding } from "@/lib/api";

export default function HostedWeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    weddingsApi
      .hosted()
      .then(setWeddings)
      .catch(() => setWeddings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
      </div>
    );
  }

  if (weddings.length === 0) {
    return (
      <div className="p-12 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white shadow-lg border border-[#C6A75E]/20 p-12 text-center max-w-lg mx-auto"
        >
          <span className="text-5xl mb-4 block">💒</span>
          <h2 className="font-serif text-2xl font-semibold text-[#2B2B2B] mb-2">
            You haven&apos;t hosted a wedding yet.
          </h2>
          <p className="text-[#2B2B2B]/70 mb-8">
            Create your first wedding and start inviting guests.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold transition-all"
          >
            👑 Host a Wedding
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-[1280px] mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-serif text-3xl font-semibold text-[#2B2B2B]">
          My Hosted Weddings
        </h1>
        <Link
          href="/dashboard/create"
          className="px-5 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold transition-all"
        >
          👑 Host a Wedding
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {weddings.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/wedding/${w.id}`}>
              <div className="rounded-2xl bg-white shadow-lg border border-[#C6A75E]/20 p-6 hover:shadow-gold hover:border-[#C6A75E]/40 transition-all duration-300 hover:-translate-y-0.5">
                <h3 className="font-serif text-lg font-semibold text-[#2B2B2B] mb-1">
                  {w.title}
                </h3>
                <p className="text-[#2B2B2B]/60 text-sm mb-2">
                  {new Date(w.weddingDate).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}
                </p>
                {w.venue && (
                  <p className="text-[#2B2B2B]/50 text-sm mb-4 truncate">
                    {w.venue}
                  </p>
                )}
                {w.guestStats && (
                  <p className="text-[#C6A75E] text-sm font-medium">
                    {w.guestStats.accepted ?? 0} / {w.guestStats.total ?? 0} RSVPs
                  </p>
                )}
                <div className="mt-3 h-16 rounded-lg bg-[#FAF7F2] border border-[#C6A75E]/20 flex items-center justify-center text-[#2B2B2B]/40 text-xs">
                  Photo preview
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
