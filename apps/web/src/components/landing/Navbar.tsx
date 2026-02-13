"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#for-you", label: "For you" },
  { href: "#how-it-works", label: "How it works" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#5c2a4a]/95 backdrop-blur-xl border-b border-[#C6A75E]/25 shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/vivaah-ai.png"
            alt="Vivaah"
            width={38}
            height={38}
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-serif font-semibold text-[#FAF8F8] text-lg tracking-tight">
            Vivaah
          </span>
        </Link>

        <ul className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[#FAF8F8]/90 text-sm font-medium hover:text-[#C6A75E] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex px-4 py-2 rounded-full border border-[#C6A75E]/70 text-[#C6A75E] text-sm font-medium hover:bg-[#C6A75E]/10 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login?signup=1"
            className="px-4 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] text-sm font-semibold hover:shadow-gold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
          </Link>

          <motion.button
            type="button"
            aria-label="Toggle menu"
            className="sm:hidden p-2 rounded-lg text-[#FAF8F8] hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
            whileTap={{ scale: 0.96 }}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[56px] bg-[#4a1a38]/98 backdrop-blur-xl sm:hidden z-40"
            onClick={() => setMobileOpen(false)}
          >
            <motion.ul
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="px-6 py-8 flex flex-col gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block py-3.5 px-4 rounded-xl text-[#FAF8F8] font-medium hover:bg-[#C6A75E]/20 hover:text-[#C6A75E]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <li className="mt-4 pt-4 border-t border-[#C6A75E]/30 flex flex-col gap-2">
                <Link href="/login" className="block py-3 px-4 rounded-xl border border-[#C6A75E]/60 text-[#C6A75E] font-medium text-center" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link href="/login?signup=1" className="block py-3 px-4 rounded-xl bg-[#C6A75E] text-[#2B2B2B] font-semibold text-center" onClick={() => setMobileOpen(false)}>
                  Get started
                </Link>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
