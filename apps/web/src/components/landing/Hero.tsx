"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { IconSparkles } from "@/components/landing/LandingIcons";

const fadeUp = { opacity: 0, y: 24 };
const fadeUpEnd = { opacity: 1, y: 0 };
const easeRoyal = [0.22, 1, 0.36, 1];
const t = (delay: number) => ({ duration: 0.7, delay, ease: easeRoyal });

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col md:flex-row md:items-center overflow-hidden w-full bg-[#4a1a38]"
      aria-label="Welcome to Vivaah"
    >
      {/* Lighter gradient — soft wine / mauve */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #5c2a4a 0%, #4a1a38 35%, #6b3355 70%, #4a1a38 100%)",
        }}
      />

      {/* Soft center glow */}
      <div
        className="absolute top-1/2 left-1/2 w-[120%] max-w-[1000px] h-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.15] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, #C6A75E 0%, transparent 65%)",
        }}
      />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 8c-4 6-8 12-12 18 4 0 8 0 12 0 4-6 8-12 12-18-4 0-8 0-12 0zm0 44c4-6 8-12 12-18-4 0-8 0-12 0-4 6-8 12-12 18 4 0 8 0 12 0z' fill='%23C6A75E'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content: two columns on desktop so sides are filled */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:py-24 md:flex md:items-center md:gap-12 lg:gap-16">
        {/* Left: copy + CTAs */}
        <div className="md:flex-1 md:max-w-[520px] text-center md:text-left">
          <motion.p
            initial={fadeUp}
            animate={fadeUpEnd}
            transition={t(0.1)}
            className="text-[#C6A75E] font-medium text-xs sm:text-sm uppercase tracking-[0.3em] mb-5"
          >
            Wedding, reimagined
          </motion.p>
          <motion.h1
            initial={fadeUp}
            animate={fadeUpEnd}
            transition={t(0.18)}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-[3.25rem] font-medium text-[#FAF8F8] leading-[1.1] tracking-tight"
          >
            Elegance for{" "}
            <span className="text-[#C6A75E]">every moment.</span>
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: easeRoyal }}
            className="mt-6 mb-6 md:mt-8 md:mb-8 w-20 h-px bg-gradient-to-r from-transparent via-[#C6A75E] to-transparent origin-center md:origin-left"
          />
          <motion.p
            initial={fadeUp}
            animate={fadeUpEnd}
            transition={t(0.3)}
            className="text-[#FAF8F8]/90 text-base sm:text-lg lg:text-xl max-w-md mx-auto md:mx-0 leading-relaxed"
          >
            Invites, RSVPs, events &amp; photos — one place. Your wedding, effortlessly.
          </motion.p>
          <motion.div
            initial={fadeUp}
            animate={fadeUpEnd}
            transition={t(0.45)}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3"
          >
            <Link
              href="/login?signup=1"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-w-[200px] px-7 py-3.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold shadow-[0_4px_20px_rgba(198,167,94,0.35)] hover:shadow-gold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconSparkles className="w-5 h-5 text-[#2B2B2B]" aria-hidden />
              Begin your wedding
            </Link>
            <Link
              href="#how-it-works"
              className="text-[#FAF8F8]/80 text-sm font-medium hover:text-[#C6A75E] transition-colors underline underline-offset-4 decoration-[#C6A75E]/40 hover:decoration-[#C6A75E]"
            >
              See how it works
            </Link>
          </motion.div>
        </div>

        {/* Right: dashboard-style preview — modern, more content */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: easeRoyal }}
          className="mt-12 md:mt-0 md:flex-1 flex justify-center md:justify-end lg:justify-center min-w-0"
        >
          <div className="w-full max-w-[420px] lg:max-w-[460px]">
            <div className="rounded-2xl border border-[#C6A75E]/30 bg-white/[0.06] backdrop-blur-xl p-[1px] shadow-2xl shadow-black/20">
              <div className="rounded-2xl bg-[#3d1530]/60 backdrop-blur-sm border border-[#C6A75E]/15 p-6 lg:p-7">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[#FAF8F8]/60 text-xs font-medium uppercase tracking-wider">
                    Your wedding at a glance
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#C6A75E]/20 text-[#C6A75E] text-[10px] font-semibold uppercase tracking-widest">
                    Live
                  </span>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Guests", value: "127", sub: "invited" },
                    { label: "RSVP", value: "84%", sub: "confirmed" },
                    { label: "Photos", value: "2.4k", sub: "in gallery" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                      className="rounded-xl border border-[#C6A75E]/20 bg-white/[0.05] px-3 py-3 text-center"
                    >
                      <p className="text-[#C6A75E] font-serif font-semibold text-lg">{stat.value}</p>
                      <p className="text-[#FAF8F8]/70 text-[10px] uppercase tracking-wider mt-0.5">{stat.label}</p>
                      <p className="text-[#FAF8F8]/50 text-[9px] mt-0.5">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Single hero photo from albums — light, warm moment */}
                <div className="mb-4">
                  <p className="text-[#FAF8F8]/70 text-xs font-medium mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6A75E]" />
                    My Photos — AI-matched
                  </p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#C6A75E]/20 ring-1 ring-white/[0.06]"
                  >
                    <Image
                      src="/albums/front.jpeg"
                      alt="Your wedding moments — AI finds every photo you’re in"
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover object-center"
                    />
                  </motion.div>
                </div>
                {/* Footer line */}
                <p className="text-[#FAF8F8]/50 text-[10px] text-center border-t border-[#C6A75E]/15 pt-3">
                  One link · RSVP · Events · Photos
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-[#FAF8F8]/40 text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-6 bg-gradient-to-b from-[#C6A75E]/50 to-transparent rounded-full"
        />
      </motion.div>
    </section>
  );
}
