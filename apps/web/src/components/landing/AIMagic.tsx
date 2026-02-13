"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "🤖",
    title: "Face recognition",
    text: "Upload wedding photos once. AI identifies each guest and builds their personal gallery automatically.",
    highlight: true,
  },
  {
    icon: "📊",
    title: "RSVP at a glance",
    text: "See who’s coming in real time. No spreadsheets, no chasing — one dashboard.",
    highlight: false,
  },
  {
    icon: "📍",
    title: "Multi-event flow",
    text: "Haldi, Sangeet, Ceremony, Reception — one timeline, one gallery, one link.",
    highlight: false,
  },
];

const flowSteps = ["Upload", "AI detects faces", "Match to guests", "Personal galleries"];

export function AIMagic() {
  return (
    <section id="ai-magic" className="py-24 sm:py-28 bg-[#5c2a4a] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-[#C6A75E]/30" />
      <div className="relative max-w-[1280px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[#C6A75E] font-medium text-sm uppercase tracking-[0.2em] mb-4">
            AI that organizes every memory
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#FAF8F8] mb-4">
            Your guests don’t search. The photos find them.
          </h2>
          <p className="text-[#FAF8F8]/80 text-lg max-w-2xl mx-auto">
            One selfie from each guest. Then every photo they’re in shows up in their personal “My Photos” album.
          </p>
        </motion.div>

        {/* Flow viz */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-16 sm:mb-20 rounded-2xl border border-[#C6A75E]/40 bg-white/[0.05] backdrop-blur p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6">
            {flowSteps.map((step, i) => (
              <motion.span
                key={step}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-[#FAF8F8]/90 font-medium text-sm sm:text-base"
              >
                {step}
              </motion.span>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="aspect-square rounded-xl bg-[#4a1a38]/70 border-2 border-[#C6A75E]/40 relative overflow-hidden"
              >
                {i === 3 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[#C6A75E] font-semibold text-sm">
                    You
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          <p className="mt-4 text-[#FAF8F8]/60 text-sm text-center">
            Photo grid → AI face detection → Your personal gallery
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`rounded-2xl p-8 ${
                f.highlight
                  ? "bg-white/10 border-2 border-[#C6A75E]/60 shadow-gold md:-mt-2 md:mb-2"
                  : "bg-white/[0.06] border border-[#C6A75E]/30"
              }`}
            >
              <span className="text-3xl mb-4 block" aria-hidden>{f.icon}</span>
              <h3 className="font-serif text-xl font-semibold text-[#FAF8F8] mb-2">
                {f.title}
              </h3>
              <p className="text-[#FAF8F8]/80 leading-relaxed text-sm">
                {f.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
