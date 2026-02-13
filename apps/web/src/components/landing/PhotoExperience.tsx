"use client";

import { motion } from "framer-motion";

const benefits = [
  "Personal dashboard auto-created for every guest",
  "Family and group photos in one place",
  "One link to every wedding memory",
];

// 3×3 partition of one image: (row, col) → backgroundPosition for that tile
const COLLAGE_SRC = "/albums/wedding 3.jpg";
const rotations = [
  [-2, 1.5, -1],
  [1, 0, -1.5],
  [-1.5, 2, -0.5],
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

          {/* Cut-type collage: one photo partitioned into 3×3 with white borders and slight rotations */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-sm aspect-square bg-[#2B2B2B] rounded-xl p-3 sm:p-4">
              <div className="absolute inset-3 sm:inset-4 grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5">
                {[0, 1, 2].map((row) =>
                  [0, 1, 2].map((col) => {
                    const i = row * 3 + col;
                    const rot = rotations[row][col];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 * i }}
                        className="relative overflow-hidden rounded-sm border-[3px] border-white shadow-lg bg-[#2B2B2B]"
                        style={{
                          transform: `rotate(${rot}deg)`,
                          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                          backgroundImage: `url(${encodeURI(COLLAGE_SRC)})`,
                          backgroundSize: "300% 300%",
                          backgroundPosition: `${col * 50}% ${row * 50}%`,
                        }}
                      >
                        <span className="absolute inset-0 block" aria-hidden />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
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
