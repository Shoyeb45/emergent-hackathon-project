"use client";

import { motion } from "framer-motion";

const events = [
  { name: "Haldi", short: "Pre-wedding", icon: "🌸" },
  { name: "Sangeet", short: "Music & dance", icon: "🎵" },
  { name: "Ceremony", short: "The big moment", icon: "💒" },
  { name: "Reception", short: "Celebrate", icon: "🥂" },
];

export function EventsSection() {
  return (
    <section id="events" className="py-24 sm:py-28 bg-[#5c2a4a] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0v40M0 20h40' stroke='%23C6A75E' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
      }} />
      <div className="relative max-w-[1280px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[#C6A75E] font-medium text-sm uppercase tracking-[0.2em] mb-3">
            One place for every moment
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#FAF8F8] max-w-2xl mx-auto">
            From Haldi to reception — all in one timeline
          </h2>
          <p className="mt-4 text-[#FAF8F8]/75 text-lg max-w-xl mx-auto">
            Create events, add photos per event, and let guests jump to the moments that matter.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {events.map((event, i) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-[#C6A75E]/40 bg-white/[0.06] backdrop-blur-sm p-6 sm:p-8 text-center hover:bg-white/[0.08] hover:border-[#C6A75E]/60 transition-all duration-300"
            >
              <span className="text-4xl mb-3 block" aria-hidden>{event.icon}</span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#FAF8F8]">
                {event.name}
              </h3>
              <p className="text-sm text-[#FAF8F8]/70 mt-1">{event.short}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
