"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { authApi, ApiClientError, setStoredTokens } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserFromLogin } = useAuth();
  const isSignup = searchParams.get("signup") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let res: { user: unknown; tokens: { accessToken: string; refreshToken?: string } };
      if (isSignup) {
        res = await authApi.signup({ name, email, password });
      } else {
        res = await authApi.signin({ email, password });
      }
      const { tokens, user: userData } = res;
      if (tokens?.accessToken && tokens?.refreshToken) {
        setStoredTokens(tokens.accessToken, tokens.refreshToken);
      } else if (tokens?.accessToken) {
        const { setStoredToken } = await import("@/lib/api");
        setStoredToken(tokens.accessToken);
      }
      const user = userData as { id: number; name: string; email: string } | null;
      if (user?.id != null) setUserFromLogin(user);
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) setError("Invalid password.");
        else if (err.status === 400 && !isSignup) setError("User not found. Create an account?");
        else setError(err.message || "Something went wrong.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md rounded-2xl border border-[#C6A75E]/50 bg-white/5 backdrop-blur-xl p-8 shadow-gold"
    >
      <h1 className="font-serif text-2xl font-semibold text-[#F8F8F8] text-center mb-6">
        {isSignup ? "Create an account" : "Welcome Back"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup && (
          <div>
            <label className="block text-[#F8F8F8]/80 text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isSignup}
              className="w-full rounded-xl border border-[#C6A75E]/40 bg-white/10 px-4 py-3 text-[#F8F8F8] placeholder-[#F8F8F8]/50 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/50"
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label className="block text-[#F8F8F8]/80 text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-[#C6A75E]/40 bg-white/10 px-4 py-3 text-[#F8F8F8] placeholder-[#F8F8F8]/50 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/50"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-[#F8F8F8]/80 text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-[#C6A75E]/40 bg-white/10 px-4 py-3 text-[#F8F8F8] placeholder-[#F8F8F8]/50 focus:outline-none focus:ring-2 focus:ring-[#C6A75E]/50"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-red-300/90 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-[#2B2B2B]/30 border-t-[#2B2B2B] rounded-full animate-spin" />
          ) : isSignup ? (
            "Create account"
          ) : (
            "Login"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[#F8F8F8]/70 text-sm">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-[#C6A75E] hover:underline">
              Login
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/login?signup=1" className="text-[#C6A75E] hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-2xl border border-[#C6A75E]/50 bg-white/5 backdrop-blur-xl p-8 animate-pulse h-96" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
