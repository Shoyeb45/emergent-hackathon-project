"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section id="cta" className="py-24 sm:py-28 bg-[#5c2a4a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-2 4-4 8-6 12 2 0 4 0 6 0 2-4 4-8 6-12-2 0-4 0-6 0zm0 38c2-4 4-8 6-12-2 0-4 0-6 0-2 4-4 8-6 12 2 0 4 0 6 0z' fill='%23C6A75E'/%3E%3C/svg%3E")`,
      }} />
      <div className="relative max-w-[1280px] mx-auto px-5 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#FAF8F8] mb-4"
        >
          Celebrate without chaos.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-[#FAF8F8]/85 text-lg sm:text-xl mb-10 max-w-xl mx-auto"
        >
          Built for modern weddings that deserve elegance — and guests who deserve their photos.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/login?signup=1"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold text-lg shadow-gold hover:shadow-gold-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span aria-hidden>👑</span> Get started — host a wedding
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#C6A75E]/80 text-[#C6A75E] font-medium hover:bg-[#C6A75E]/10 transition-colors"
          >
            I have an invite
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-[#FAF8F8]/60 text-sm"
        >
          Designed for hosts. Loved by guests.
        </motion.p>
      </div>
    </section>
  );
}
