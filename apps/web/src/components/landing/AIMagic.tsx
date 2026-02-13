"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { IconScanFace, IconChart, IconMapPin } from "./LandingIcons";

// Irregular collage: 11 photos in 4×3 grid; first row 4, second 4, third row 3 (last photo spans 2 cols)
const albumPhotos: { src: string; colSpan: number; rowSpan: number; isYou?: boolean }[] = [
  { src: "/albums/album-11.png", colSpan: 1, rowSpan: 1 },
  { src: "/albums/one-collage-photo.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/wedding 2.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/a-12.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/wedding 5.jpg", colSpan: 1, rowSpan: 1, isYou: true },
  { src: "/albums/wedding 6.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/full-shot-people-posing-wedding.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/wedding 7.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/wedding 9.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/wedding 3.jpg", colSpan: 1, rowSpan: 1 },
  { src: "/albums/wedding-10.jpg", colSpan: 2, rowSpan: 1 },
];

const features = [
  {
    Icon: IconScanFace,
    title: "Face recognition",
    text: "Upload wedding photos once. AI identifies each guest and builds their personal gallery automatically.",
    highlight: true,
  },
  {
    Icon: IconChart,
    title: "RSVP at a glance",
    text: "See who’s coming in real time. No spreadsheets, no chasing — one dashboard.",
    highlight: false,
  },
  {
    Icon: IconMapPin,
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
      <div className="relative max-w-[1280px] mx-auto px-3 sm:px-4">
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
          className="mb-16 sm:mb-20 rounded-2xl border border-[#C6A75E]/40 bg-white/[0.05] backdrop-blur px-3 py-5 sm:px-4 sm:py-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-5">
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
          <div
            className="grid grid-cols-4 gap-1 sm:gap-1.5 w-full"
            style={{ gridTemplateRows: "repeat(3, minmax(0, 1fr))", aspectRatio: "16/9" }}
          >
            {albumPhotos.map((photo, i) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className={`rounded-lg border border-[#C6A75E]/40 relative overflow-hidden bg-[#4a1a38]/50 min-h-0 ${
                  photo.colSpan === 2 ? "col-span-2" : ""
                } ${photo.rowSpan === 2 ? "row-span-2" : ""}`}
              >
                <Image
                  src={encodeURI(photo.src)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
                {photo.isYou && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#4a1a38]/80 text-[#C6A75E] font-semibold text-xs sm:text-sm backdrop-blur-[2px]">
                    You
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-[#FAF8F8]/60 text-sm text-center">
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
              <span className="text-[#C6A75E] mb-4 flex" aria-hidden><f.Icon className="w-10 h-10" /></span>
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
