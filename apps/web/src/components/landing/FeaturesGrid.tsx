"use client";

import { motion } from "framer-motion";

const features = [
  { icon: "🔗", title: "Smart invitations", desc: "One link for RSVP and event info" },
  { icon: "📸", title: "Face-match photos", desc: "AI finds you in every wedding photo" },
  { icon: "✅", title: "RSVP tracking", desc: "Live counts and reminders" },
  { icon: "📅", title: "Multi-event", desc: "Haldi, Sangeet, Ceremony, Reception" },
  { icon: "👤", title: "Guest dashboard", desc: "My Photos and event access" },
  { icon: "📥", title: "Download memories", desc: "Save and share your album" },
];

export function FeaturesGrid() {
  return (
    <section id="platform" className="py-24 sm:py-28 bg-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[#C6A75E] font-medium text-sm uppercase tracking-[0.2em] mb-3">
            Everything you need
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2B2B2B]">
            One platform. Every feature.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white p-6 shadow-lg border border-[#C6A75E]/15 hover:shadow-gold hover:border-[#C6A75E]/30 transition-all duration-300"
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-serif text-lg font-semibold text-[#2B2B2B]">{f.title}</h3>
              <p className="text-sm text-[#2B2B2B]/75 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
