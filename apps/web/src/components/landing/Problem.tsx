"use client";

import { motion } from "framer-motion";

const cards = [
  {
    icon: "📸",
    title: "Photo Chaos",
    text: "Guests struggle to find their memories among thousands of images.",
  },
  {
    icon: "⏳",
    title: "RSVP Uncertainty",
    text: "Late confirmations and no-shows create planning stress.",
  },
  {
    icon: "🧑‍🤝‍🧑",
    title: "Guest Coordination",
    text: "Tracking attendees across multiple events becomes overwhelming.",
  },
];

export function Problem() {
  return (
    <section id="features" className="py-24 bg-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="font-serif text-3xl sm:text-4xl font-semibold text-[#2B2B2B] text-center mb-16"
        >
          Weddings Are Beautiful. Managing Them Isn&apos;t.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl p-8 shadow-lg border-t-2 border-[#C6A75E] hover:shadow-gold transition-shadow duration-300"
            >
              <span className="text-3xl mb-4 block">{card.icon}</span>
              <h3 className="font-serif text-xl font-semibold text-[#2B2B2B] mb-2">
                {card.title}
              </h3>
              <p className="text-[#2B2B2B]/80 leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
