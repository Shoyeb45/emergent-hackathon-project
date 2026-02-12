"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#ai-magic", label: "AI Magic" },
  { href: "#photos", label: "Photos" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#4A0E2B]/90 backdrop-blur-md border-b border-[#C6A75E]/40"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/vivaah-ai.png"
            alt="Vivaah"
            width={45}
            height={45}
            className="h-21 w-21 object-contain"
            priority
          />
          <span className="font-serif font-semibold text-[#F8F8F8] text-lg tracking-tight">
            Vivaah
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[#F8F8F8]/90 text-sm font-medium hover:text-[#C6A75E] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#C6A75E] group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full border border-[#C6A75E] text-[#C6A75E] text-sm font-medium hover:bg-[#C6A75E]/10 transition-colors duration-300"
          >
            Login
          </Link>
          <Link
            href="/login?signup=1"
            className="px-5 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] text-sm font-semibold hover:shadow-gold transition-all duration-300 hover:scale-[1.02]"
          >
            Get Into a Wedding
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
