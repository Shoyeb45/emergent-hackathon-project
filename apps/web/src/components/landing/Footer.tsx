"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { href: "#features", label: "Why Vivaah" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#ai-magic", label: "AI Photos" },
  { href: "/login", label: "Log in" },
  { href: "/login?signup=1", label: "Get started" },
];

export function Footer() {
  return (
    <footer className="bg-[#4a1a38] py-16">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6">
        <div className="w-full h-px bg-[#C6A75E]/40 mb-12" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/vivaah-ai.png"
              alt="Vivaah"
              width={96}
              height={96}
              className="h-16 w-16 sm:h-24 sm:w-24 object-contain"
            />
            <span className="font-serif text-[#FAF8F8] font-semibold text-xl sm:text-2xl tracking-tight not-italic">
              vivaah<span className="text-[#C6A75E]">.ai</span>
            </span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[#FAF8F8]/80 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#C6A75E] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-center text-[#FAF8F8]/50 text-sm">
          © {new Date().getFullYear()} Vivaah — Wedding in Hindi, seamless by design.
        </p>
      </div>
    </footer>
  );
}
