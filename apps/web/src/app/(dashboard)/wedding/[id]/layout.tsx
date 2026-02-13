"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { weddingsApi, type Wedding } from "@/lib/api";
import { formatWeddingDate } from "@/lib/date-time";
import { motion } from "framer-motion";

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const weddingId = params.id as string;

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!weddingId || !user) return;
    weddingsApi
      .get(weddingId)
      .then(setWedding)
      .catch((e) => {
        setError(e.message || "Failed to load wedding.");
        setWedding(null);
      })
      .finally(() => setLoading(false));
  }, [weddingId, user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-burgundy rounded-full animate-spin" />
          <p className="text-[#2B2B2B]/50 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-[1280px] mx-auto">
        <div className="h-5 w-32 rounded bg-[#C6A75E]/15 animate-pulse mb-6" />
        <div className="h-10 w-64 sm:w-80 rounded bg-[#C6A75E]/10 animate-pulse mb-2" />
        <div className="h-4 w-48 rounded bg-[#C6A75E]/10 animate-pulse mb-6" />
        <div className="flex gap-6 border-b border-[#C6A75E]/20 pb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-5 w-16 rounded bg-[#C6A75E]/10 animate-pulse"
            />
          ))}
        </div>
        <div className="py-12 flex justify-center">
          <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-burgundy rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="p-8 max-w-[1280px] mx-auto">
        <div className="rounded-2xl bg-white border border-red-200 p-6 text-center max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error || "Wedding not found."}</p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 rounded-full bg-burgundy text-[#FAF7F2] font-medium hover:bg-burgundy-dark transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isHost =
    user && wedding.host && (wedding.host as { id?: number }).id === user.id;
  const tabs = [
    { href: `/wedding/${weddingId}`, label: "Events" },
    { href: `/wedding/${weddingId}/photos`, label: "Photos" },
    ...(isHost
      ? [{ href: `/wedding/${weddingId}/invitations`, label: "Invitations" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="p-6 sm:p-8 max-w-[1280px] mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-burgundy hover:text-burgundy-dark text-sm font-medium mb-6 transition-colors"
        >
          <span aria-hidden>←</span> Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2B2B2B]">
            {wedding.title}
          </h1>
          <p className="text-[#2B2B2B]/65 text-sm sm:text-base mt-1">
            {formatWeddingDate(wedding.weddingDate)}
            {wedding.venue && (
              <span className="mt-1 block sm:inline sm:mt-0 sm:ml-1">
                · {wedding.venue}
              </span>
            )}
          </p>
          <span
            className={`inline-block mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isHost
                ? "bg-burgundy text-[#FAF7F2]"
                : "bg-[#C6A75E]/20 text-[#2B2B2B] border border-[#C6A75E]/40"
            }`}
          >
            {isHost ? "Host" : "Guest"}
          </span>
        </motion.div>

        {/* Tabs – pill bar for clear placement */}
        <nav
          className="flex gap-1 p-1.5 rounded-xl bg-white border border-[#C6A75E]/20 shadow-sm mb-8 w-fit"
          aria-label="Wedding sections"
        >
          {tabs.map((tab) => {
            const active =
              tab.href === `/wedding/${weddingId}`
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-burgundy text-[#FAF7F2] shadow-sm"
                    : "text-[#2B2B2B]/70 hover:text-[#2B2B2B] hover:bg-[#FAF7F2]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
