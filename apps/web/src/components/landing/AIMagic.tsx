"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "🤖",
    title: "Face Recognition Sorting",
    text: "Upload all wedding photos. Our AI identifies each guest and builds their personal gallery automatically.",
    highlight: true,
  },
  {
    icon: "📊",
    title: "RSVP Forecasting",
    text: "Predict attendance trends and reduce last-minute surprises.",
    highlight: false,
  },
  {
    icon: "📍",
    title: "Multi-Event Tracking",
    text: "Track Haldi, Sangeet, Ceremony and Reception seamlessly.",
    highlight: false,
  },
];

export function AIMagic() {
  return (
    <section id="ai-magic" className="py-24 bg-[#4A0E2B]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="w-24 h-px bg-[#C6A75E] mx-auto mb-12" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl sm:text-4xl font-semibold text-[#F8F8F8] text-center mb-4"
        >
          AI That Organizes Every Memory
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[#F8F8F8]/80 text-center text-lg max-w-2xl mx-auto mb-20"
        >
          Your guests don&apos;t search for photos. The photos find them.
        </motion.p>

        {/* Demo viz placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-20 rounded-2xl border border-[#C6A75E]/40 bg-white/5 backdrop-blur p-6 sm:p-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-[#2B0A1A]/60 border-2 border-[#C6A75E]/50 relative overflow-hidden"
              >
                {i === 3 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[#C6A75E] font-medium text-sm">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[#F8F8F8]/70 text-sm text-center">
            Photo grid → AI face detection → Your personal gallery
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`rounded-2xl p-8 ${
                f.highlight
                  ? "bg-white/10 border-2 border-[#C6A75E]/60 shadow-gold md:-mt-4 md:mb-4"
                  : "bg-white/5 border border-[#C6A75E]/30"
              }`}
            >
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="font-serif text-xl font-semibold text-[#F8F8F8] mb-2">
                {f.title}
              </h3>
              <p className="text-[#F8F8F8]/80 leading-relaxed text-sm">
                {f.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
