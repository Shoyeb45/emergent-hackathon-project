"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { inviteApi, rsvpApi, setStoredToken } from "@/lib/api";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [data, setData] = useState<{
    guest: { rsvpStatus: string; user?: { name: string } };
    wedding: { id: string; title: string; weddingDate: string; venue?: string; host?: { name: string } };
    hasResponded: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    inviteApi
      .get(token)
      .then(setData)
      .catch((e) => setError(e.message || "Invalid invitation link."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRsvp = async (accepted: boolean) => {
    setSubmitting(true);
    setError("");
    setPasswordError("");
    if (accepted && password) {
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters.");
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        setSubmitting(false);
        return;
      }
    }
    try {
      const res = await rsvpApi.submit(token, {
        rsvpStatus: accepted ? "accepted" : "declined",
        setPassword: accepted && password ? password : undefined,
      });
      if (accepted && res.accessToken) {
        setStoredToken(res.accessToken);
        router.push(`/wedding/${data?.wedding.id}`);
        router.refresh();
      } else if (accepted) {
        router.push(`/wedding/${data?.wedding.id}`);
        router.refresh();
      } else {
        setDeclined(true);
      }
    } catch (e: unknown) {
      setError((e as Error).message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #4A0E2B 0%, #2B0A1A 100%)" }}
      >
        <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #4A0E2B 0%, #2B0A1A 100%)" }}
      >
        <div className="rounded-2xl bg-white/5 border border-[#C6A75E]/40 p-8 text-center max-w-md">
          <p className="text-[#F8F8F8] mb-4">{error}</p>
          <Link href="/" className="text-[#C6A75E] hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #4A0E2B 0%, #2B0A1A 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/5 border border-[#C6A75E]/40 p-8 text-center max-w-md"
        >
          <p className="text-[#F8F8F8] text-lg">Thank you for letting us know.</p>
          <Link
            href="/"
            className="inline-block mt-6 text-[#C6A75E] hover:underline"
          >
            Back to home
          </Link>
        </motion.div>
      </div>
    );
  }

  const wedding = data!.wedding;
  const hasResponded = data!.hasResponded;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #4A0E2B 0%, #2B0A1A 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border-2 border-[#C6A75E]/60 bg-[#2B0A1A]/80 p-8 text-center shadow-gold">
          <p className="text-[#C6A75E]/80 text-xs uppercase tracking-wider mb-2">
            You&apos;re invited
          </p>
          <h1 className="font-serif text-2xl font-semibold text-[#F8F8F8] mb-2">
            {wedding.title}
          </h1>
          <p className="text-[#F8F8F8]/80 text-sm">
            {new Date(wedding.weddingDate).toLocaleDateString("en-IN", {
              dateStyle: "long",
            })}
          </p>
          {wedding.venue && (
            <p className="text-[#F8F8F8]/70 text-sm mt-1">{wedding.venue}</p>
          )}
          {wedding.host?.name && (
            <p className="text-[#C6A75E]/90 text-sm mt-2">
              Hosted by {wedding.host.name}
            </p>
          )}
        </div>

        {!hasResponded ? (
          <div className="mt-8 rounded-2xl bg-white/5 border border-[#C6A75E]/40 p-6">
            <p className="text-[#F8F8F8] font-medium mb-4">Will you attend?</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[#F8F8F8]/80 text-sm mb-1">
                  Set a password (optional, for your account)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full rounded-xl border border-[#C6A75E]/40 bg-white/10 px-4 py-2.5 text-[#F8F8F8] placeholder-[#F8F8F8]/50"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-[#C6A75E]/40 bg-white/10 px-4 py-2.5 text-[#F8F8F8] placeholder-[#F8F8F8]/50 mt-2"
                />
                {passwordError && (
                  <p className="text-red-300 text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRsvp(true)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold disabled:opacity-70"
                >
                  {submitting ? "…" : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRsvp(false)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-full border-2 border-[#C6A75E] text-[#C6A75E] font-medium hover:bg-[#C6A75E]/10 disabled:opacity-70"
                >
                  No
                </button>
              </div>
            </div>
            {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-[#F8F8F8]/80 mb-4">You&apos;ve already responded.</p>
            <Link
              href={`/wedding/${wedding.id}`}
              className="inline-block px-6 py-3 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold"
            >
              View wedding
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
