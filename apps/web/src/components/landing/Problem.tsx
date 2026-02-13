"use client";

import { motion } from "framer-motion";

const cards = [
  {
    icon: "📸",
    title: "Photo chaos",
    text: "Guests scroll through thousands of images to find the few where they appear.",
  },
  {
    icon: "⏳",
    title: "RSVP uncertainty",
    text: "Late confirmations and no-shows make catering and seating a guessing game.",
  },
  {
    icon: "🧑‍🤝‍🧑",
    title: "Guest coordination",
    text: "Tracking who’s coming to which event across Haldi, Sangeet, and more.",
  },
];

export function Problem() {
  return (
    <section id="features" className="py-24 sm:py-28 bg-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[#C6A75E] font-medium text-sm uppercase tracking-[0.2em] mb-3">
            Why Vivaah exists
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2B2B] max-w-2xl mx-auto">
            Weddings are beautiful. Managing them isn’t.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group bg-white rounded-2xl p-8 shadow-lg border-t-2 border-[#C6A75E] hover:shadow-gold transition-all duration-300"
            >
              <span className="text-3xl mb-4 block" aria-hidden>{card.icon}</span>
              <h3 className="font-serif text-xl font-semibold text-[#2B2B2B] mb-2">
                {card.title}
              </h3>
              <p className="text-[#2B2B2B]/80 leading-relaxed text-sm sm:text-base">
                {card.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
