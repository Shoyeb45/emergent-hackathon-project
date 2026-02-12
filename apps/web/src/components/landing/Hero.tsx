"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#4A0E2B]">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: "linear-gradient(135deg, #4A0E2B 0%, #2B0A1A 100%)",
        }}
      />
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-2 4-4 8-6 12 2 0 4 0 6 0 2-4 4-8 6-12-2 0-4 0-6 0zm0 38c2-4 4-8 6-12-2 0-4 0-6 0-2 4-4 8-6 12 2 0 4 0 6 0z' fill='%23C6A75E' fill-opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 py-24 flex flex-col lg:flex-row items-center justify-between gap-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 max-w-xl"
        >
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F8F8F8] leading-tight tracking-tight">
            Vivaah — The AI for Seamless Weddings
          </h1>
          <p className="mt-6 text-lg text-[#F8F8F8]/80 max-w-md leading-relaxed">
            From RSVPs to memories — organize every moment with elegance and
            intelligence.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/login?signup=1"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold transition-all duration-300 hover:scale-[1.03]"
            >
              <span>👑</span> Host a Wedding
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-[#C6A75E] text-[#C6A75E] font-medium hover:bg-[#C6A75E]/10 transition-colors duration-300"
            >
              Explore Demo
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="flex-1 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-md rounded-2xl border border-[#C6A75E]/40 bg-white/5 backdrop-blur-md p-6 shadow-gold"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#F8F8F8]/70 text-sm">Guest count</span>
              <span className="font-serif text-[#C6A75E] font-semibold">127</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#F8F8F8]/70 text-sm">RSVP</span>
              <span className="font-serif text-[#C6A75E] font-semibold">84%</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-[#2B0A1A]/60 border border-[#C6A75E]/20"
                />
              ))}
            </div>
            <p className="mt-3 text-[#F8F8F8]/60 text-xs text-center">
              Photo preview
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
