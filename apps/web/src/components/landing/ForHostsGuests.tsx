"use client";

import { motion } from "framer-motion";

const hostItems = [
  { title: "Create your wedding", desc: "Set date, venue, and events in one place." },
  { title: "Invite with one link", desc: "Share a single link — guests RSVP in seconds." },
  { title: "Track RSVPs live", desc: "See who’s coming without chasing spreadsheets." },
  { title: "Manage multiple events", desc: "Haldi, Sangeet, Ceremony, Reception — all in one." },
  { title: "Unified photo gallery", desc: "One gallery; AI tags and organizes for everyone." },
];

const guestItems = [
  { title: "One-click RSVP", desc: "No forms, no hassle — just tap and confirm." },
  { title: "Add your photo once", desc: "Upload a selfie so AI can find you in every photo." },
  { title: "Get “My Photos” automatically", desc: "Your personal album of every photo you’re in." },
  { title: "Browse by event", desc: "Jump to Haldi, Sangeet, or Reception in one tap." },
  { title: "Download & share", desc: "Save your memories and share with family." },
];

export function ForHostsGuests() {
  return (
    <section id="for-you" className="py-24 sm:py-28 bg-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[#C6A75E] font-medium text-sm uppercase tracking-[0.2em] mb-3">
            Built for both sides
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2B2B] max-w-2xl mx-auto">
            For hosts. For guests. One experience.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Hosts */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-[#5c2a4a] p-8 sm:p-10 text-[#FAF8F8] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C6A75E]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-full bg-[#C6A75E]/20 text-[#C6A75E] text-xs font-semibold uppercase tracking-wider mb-6">
                Hosts
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold mb-6">
                Run your wedding without the runaround
              </h3>
              <ul className="space-y-4">
                {hostItems.map((item, i) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-4"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full border border-[#C6A75E]/50 flex items-center justify-center text-[#C6A75E] text-sm font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#FAF8F8]">{item.title}</p>
                      <p className="text-sm text-[#FAF8F8]/75 mt-0.5">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Guests */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-white border-2 border-[#C6A75E]/30 p-8 sm:p-10 text-[#2B2B2B] shadow-xl shadow-[#5c2a4a]/5 relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#C6A75E]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-full bg-[#C6A75E]/15 text-[#5c2a4a] text-xs font-semibold uppercase tracking-wider mb-6">
                Guests
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold mb-6 text-[#2B2B2B]">
                Your photos find you — no searching
              </h3>
              <ul className="space-y-4">
                {guestItems.map((item, i) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-4"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C6A75E]/20 border border-[#C6A75E]/40 flex items-center justify-center text-[#5c2a4a] text-sm font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#2B2B2B]">{item.title}</p>
                      <p className="text-sm text-[#2B2B2B]/75 mt-0.5">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
