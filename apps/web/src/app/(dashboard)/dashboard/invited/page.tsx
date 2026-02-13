"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { weddingsApi, type Wedding } from "@/lib/api";
import { formatDateMedium } from "@/lib/date-time";

const rsvpBadge = (status?: string) => {
  switch (status) {
    case "accepted":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "declined":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-800 border-amber-200";
  }
};

export default function InvitedWeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    weddingsApi
      .invited()
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
          <span className="text-5xl mb-4 block">💌</span>
          <h2 className="font-serif text-2xl font-semibold text-[#2B2B2B] mb-2">
            You haven&apos;t been invited to any weddings yet.
          </h2>
          <p className="text-[#2B2B2B]/70">
            When someone invites you, it will show up here.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-[1280px] mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-[#2B2B2B] mb-10">
        Invited Weddings
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {weddings.map((w, i) => {
          const status = w.guestStats?.rsvpStatus ?? "pending";
          return (
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
                  {w.host && (
                    <p className="text-[#2B2B2B]/60 text-sm mb-2">
                      Host: {w.host.name}
                    </p>
                  )}
                  <p className="text-[#2B2B2B]/60 text-sm mb-3">
                    {formatDateMedium(w.weddingDate)}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${rsvpBadge(status)}`}
                  >
                    {status === "accepted"
                      ? "Confirmed"
                      : status === "declined"
                        ? "Declined"
                        : "Pending"}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
