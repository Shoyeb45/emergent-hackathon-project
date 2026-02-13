"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { weddingsApi, type Wedding } from "@/lib/api";
import { formatDateMedium } from "@/lib/date-time";

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
      <div className="p-8 sm:p-12 max-w-[1280px] mx-auto min-h-[50vh] flex flex-col justify-center">
        <div className="h-8 w-48 rounded bg-[#C6A75E]/15 animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white border border-[#C6A75E]/15 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (weddings.length === 0) {
    return (
      <div className="p-8 sm:p-12 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white shadow-sm border border-[#C6A75E]/20 p-10 sm:p-14 text-center max-w-lg mx-auto"
        >
          <span className="text-5xl mb-5 block opacity-90">💒</span>
          <h2 className="font-serif text-2xl font-semibold text-[#2B2B2B] mb-2">
            You haven&apos;t hosted a wedding yet
          </h2>
          <p className="text-[#2B2B2B]/70 mb-8">
            Create your first wedding and start inviting guests.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-burgundy text-[#FAF7F2] font-semibold hover:bg-burgundy-dark shadow-gold transition-all"
          >
            Host a Wedding
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-12 max-w-[1280px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B2B2B]">
          My Hosted Weddings
        </h1>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-burgundy text-[#FAF7F2] font-semibold hover:bg-burgundy-dark shadow-gold transition-all w-fit"
        >
          Host a Wedding
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {weddings.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={`/wedding/${w.id}`}>
              <div className="rounded-2xl bg-white shadow-sm border border-[#C6A75E]/20 p-6 hover:shadow-gold hover:border-[#C6A75E]/35 transition-all duration-300 hover:-translate-y-0.5">
                <h3 className="font-serif text-lg font-semibold text-[#2B2B2B] mb-1.5">
                  {w.title}
                </h3>
                <p className="text-[#2B2B2B]/65 text-sm mb-2">
                  {formatDateMedium(w.weddingDate)}
                </p>
                {w.venue && (
                  <p className="text-[#2B2B2B]/55 text-sm mb-4 truncate" title={w.venue}>
                    {w.venue}
                  </p>
                )}
                {w.guestStats && (
                  <p className="text-burgundy/90 text-sm font-medium">
                    {w.guestStats.accepted ?? 0} / {w.guestStats.total ?? 0} RSVPs
                  </p>
                )}
                <div className="mt-4 h-14 rounded-xl bg-[#FAF7F2] border border-[#C6A75E]/15 flex items-center justify-center text-[#2B2B2B]/40 text-xs">
                  View events & photos
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
