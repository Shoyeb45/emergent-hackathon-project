"use client";

import { motion } from "framer-motion";
import { IconSparkles, IconCheck, IconPhoto, IconImageStack, IconCpu } from "./LandingIcons";

const steps = [
  {
    n: 1,
    Icon: IconSparkles,
    label: "Create your wedding",
    sub: "Add your events and get one invite link to share.",
  },
  {
    n: 2,
    Icon: IconCheck,
    label: "Guests RSVP",
    sub: "One link — they confirm in seconds. No forms, no chase.",
  },
  {
    n: 3,
    Icon: IconPhoto,
    label: "Guests add a photo",
    sub: "One selfie per guest so AI can find them in every photo.",
  },
  {
    n: 4,
    Icon: IconImageStack,
    label: "Upload the gallery",
    sub: "Drop your wedding photos once. We do the rest.",
  },
  {
    n: 5,
    Icon: IconCpu,
    label: "AI delivers",
    sub: "Everyone gets a personal “My Photos” album — automatically.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-28 md:py-32 bg-[#FAF7F2] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-[#C6A75E] font-semibold text-sm uppercase tracking-[0.25em] mb-3">
            Simple from start to finish
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2B2B2B]">
            How it works
          </h2>
          <p className="mt-4 text-[#2B2B2B]/75 text-lg max-w-xl mx-auto">
            Five steps from “we’re getting married” to “here are your photos.”
          </p>
        </motion.header>

        {/* Desktop: horizontal timeline with cards */}
        <div className="hidden lg:block relative pt-12">
          {/* Single horizontal line — runs through number badges */}
          <div
            className="absolute top-12 left-0 right-0 h-0.5 bg-[#C6A75E]/35 rounded-full"
            aria-hidden
          />
          <div className="grid grid-cols-5 gap-4 xl:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex flex-col items-center"
              >
                {/* Number badge — sits on the timeline */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 w-12 h-12 rounded-full border-2 border-[#C6A75E] bg-[#FAF7F2] flex items-center justify-center font-serif text-[#C6A75E] font-bold text-lg shadow-md">
                  {step.n}
                </div>
                {/* Step card */}
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative w-full rounded-2xl border-2 border-[#C6A75E]/25 bg-white p-6 pt-8 shadow-lg shadow-[#5c2a4a]/5 hover:border-[#C6A75E]/50 hover:shadow-gold transition-all duration-300"
                >
                  <span className="text-[#C6A75E] mb-3 flex" aria-hidden>
                    <step.Icon className="w-9 h-9" />
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#2B2B2B] leading-tight">
                    {step.label}
                  </h3>
                  <p className="mt-2 text-sm text-[#2B2B2B]/70 leading-snug">
                    {step.sub}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tablet: 2 columns */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex gap-4 rounded-2xl border-2 border-[#C6A75E]/25 bg-white p-5 shadow-lg shadow-[#5c2a4a]/5 hover:border-[#C6A75E]/40 hover:shadow-gold transition-all duration-300"
            >
              <div className="shrink-0 w-12 h-12 rounded-full border-2 border-[#C6A75E] bg-[#FAF7F2] flex items-center justify-center font-serif text-[#C6A75E] font-bold">
                {step.n}
              </div>
              <div>
                <span className="text-[#C6A75E]" aria-hidden><step.Icon className="w-8 h-8" /></span>
                <h3 className="font-serif font-semibold text-[#2B2B2B] mt-1">
                  {step.label}
                </h3>
                <p className="text-sm text-[#2B2B2B]/70 mt-1">{step.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative pl-8">
          {/* Vertical line */}
          <div
            className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-[#C6A75E]/35 rounded-full"
            aria-hidden
          />
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                {/* Dot on line */}
                <div className="absolute left-0 top-6 w-6 h-6 rounded-full border-2 border-[#C6A75E] bg-[#FAF7F2] flex items-center justify-center font-serif text-[#C6A75E] font-bold text-xs -translate-x-[5px] z-10">
                  {step.n}
                </div>
                <div className="flex-1 min-w-0 pt-4">
                  <div className="rounded-2xl border-2 border-[#C6A75E]/25 bg-white p-5 shadow-md hover:border-[#C6A75E]/40 hover:shadow-gold transition-all duration-300">
                    <span className="text-[#C6A75E]" aria-hidden><step.Icon className="w-8 h-8" /></span>
                    <h3 className="font-serif font-semibold text-[#2B2B2B] mt-2">
                      {step.label}
                    </h3>
                    <p className="text-sm text-[#2B2B2B]/70 mt-1.5 leading-relaxed">
                      {step.sub}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
