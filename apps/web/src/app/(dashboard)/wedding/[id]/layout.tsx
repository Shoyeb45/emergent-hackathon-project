"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { weddingsApi, type Wedding } from "@/lib/api";

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
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
        <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="p-12 max-w-[1280px] mx-auto">
        <p className="text-red-600 mb-4">{error || "Wedding not found."}</p>
        <Link href="/dashboard" className="text-[#C6A75E] hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isHost = user && wedding.host && (wedding.host as { id?: number }).id === user.id;
  const tabs = [
    { href: `/wedding/${weddingId}`, label: "Events" },
    { href: `/wedding/${weddingId}/photos`, label: "Photos" },
    ...(isHost ? [{ href: `/wedding/${weddingId}/invitations`, label: "Invitations" }] : []),
  ];

  return (
    <div className="p-8 max-w-[1280px] mx-auto">
      <Link
        href="/dashboard"
        className="text-[#C6A75E] hover:underline text-sm font-medium mb-6 inline-block"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-[#2B2B2B]">
          {wedding.title}
        </h1>
        <p className="text-[#2B2B2B]/60 text-sm mt-1">
          {new Date(wedding.weddingDate).toLocaleDateString("en-IN", {
            dateStyle: "long",
          })}
          {wedding.venue && ` · ${wedding.venue}`}
        </p>
        <span
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            isHost
              ? "bg-[#C6A75E]/20 text-[#2B2B2B] border border-[#C6A75E]/40"
              : "bg-[#FAF7F2] text-[#2B2B2B]/80 border border-[#C6A75E]/20"
          }`}
        >
          {isHost ? "Host" : "Guest"}
        </span>
      </div>

      <nav className="flex gap-6 border-b border-[#C6A75E]/20 mb-8">
        {tabs.map((tab) => {
          const active =
            tab.href === `/wedding/${weddingId}`
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pb-3 text-sm font-medium transition-colors ${
                active
                  ? "text-[#C6A75E] border-b-2 border-[#C6A75E]"
                  : "text-[#2B2B2B]/70 hover:text-[#2B2B2B]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
