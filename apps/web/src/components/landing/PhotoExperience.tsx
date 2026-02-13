"use client";

import { motion } from "framer-motion";

const benefits = [
  "Personal dashboard auto-created for every guest",
  "Family and group photos in one place",
  "One link to every wedding memory",
];

export function PhotoExperience() {
  return (
    <section id="photos" className="py-24 sm:py-28 bg-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[#C6A75E] font-medium text-sm uppercase tracking-[0.2em] mb-3">
            For every guest
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2B2B] max-w-2xl mx-auto">
            Every guest gets their own memory album
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-[#2B2B2B]"
          >
            <p className="text-lg leading-relaxed">
              Upload photos once. AI detects guests and builds a personal dashboard for
              each one — no more hunting through thousands of images.
            </p>
            <ul className="space-y-3">
              {benefits.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#C6A75E]/30 border border-[#C6A75E]/50 flex items-center justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6A75E]" />
                  </span>
                  <span className="text-[#2B2B2B]/90">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-[#C6A75E]/20 p-5 hover:shadow-gold transition-shadow duration-300"
            >
              <div className="text-[#2B2B2B] font-semibold text-sm mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C6A75E]" />
                My Photos
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-[#FAF7F2] border border-[#C6A75E]/25"
                  />
                ))}
              </div>
              <p className="text-xs text-[#2B2B2B]/60">Your personal album — auto-built by AI</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 text-center text-[#2B2B2B]/70 italic font-serif text-lg"
        >
          No more — “Please send me the photos where I’m in.”
        </motion.p>
      </div>
    </section>
  );
}
