"use client";

import { motion } from "framer-motion";

const steps = [
  { n: 1, label: "Host Your Wedding" },
  { n: 2, label: "Invite Guests Instantly" },
  { n: 3, label: "Guests RSVP via Smart Link" },
  { n: 4, label: "AI Organizes Photos Automatically" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#FAF7F2]">
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl sm:text-4xl font-semibold text-[#2B2B2B] text-center mb-20"
        >
          How It Works
        </motion.h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col sm:flex-row items-center gap-4 flex-1"
            >
              <div className="w-14 h-14 rounded-full border-2 border-[#C6A75E] bg-[#FAF7F2] flex items-center justify-center font-serif text-[#C6A75E] font-semibold text-lg shrink-0 hover:shadow-gold transition-shadow">
                {step.n}
              </div>
              {i < steps.length - 1 && (
                <div className="hidden sm:block flex-1 h-px max-w-[80px] bg-[#C6A75E]/50 mx-2" />
              )}
              <p className="text-[#2B2B2B] font-medium text-center sm:text-left text-sm max-w-[180px]">
                {step.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
