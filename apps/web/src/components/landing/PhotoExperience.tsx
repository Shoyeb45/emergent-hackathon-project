"use client";

import { motion } from "framer-motion";

export function PhotoExperience() {
  return (
    <section id="photos" className="py-24 bg-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl sm:text-4xl font-semibold text-[#2B2B2B] text-center mb-16"
        >
          Every Guest Gets Their Own Memory Album
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-[#2B2B2B]"
          >
            <p className="text-lg leading-relaxed">
              Upload photos once. Our AI detects guests and builds a personal
              dashboard for each one — no more hunting through thousands of
              images.
            </p>
            <ul className="space-y-2 text-[#2B2B2B]/90">
              <li>• Personal dashboard auto-created for every guest</li>
              <li>• Family photo grouping</li>
              <li>• One place for all your wedding memories</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-64 rounded-2xl bg-white shadow-lg border border-[#C6A75E]/20 p-4 hover:shadow-gold transition-shadow">
              <div className="text-[#2B2B2B] font-medium text-sm mb-3">
                Guest dashboard
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-[#FAF7F2] border border-[#C6A75E]/20"
                  />
                ))}
              </div>
              <div className="text-xs text-[#2B2B2B]/60">Family section</div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-[#2B2B2B]/70 italic"
        >
          No more — &ldquo;Please send me the photos where I&apos;m there.&rdquo;
        </motion.p>
      </div>
    </section>
  );
}
