"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-24 bg-[#4A0E2B]">
      <div className="max-w-[1280px] mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl sm:text-5xl font-semibold text-[#F8F8F8] mb-4"
        >
          Celebrate Without Chaos.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[#F8F8F8]/80 text-lg mb-10"
        >
          Built for modern weddings that deserve elegance.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/login?signup=1"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold text-lg hover:shadow-gold-lg transition-all duration-300 hover:scale-[1.02]"
          >
            👑 Get Into a Wedding
          </Link>
        </motion.div>
        <p className="mt-6 text-[#F8F8F8]/60 text-sm">
          Designed for hosts. Loved by guests.
        </p>
      </div>
    </section>
  );
}
