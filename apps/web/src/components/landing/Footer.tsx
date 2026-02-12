"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#4A0E2B] py-16">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="w-full h-px bg-[#C6A75E]/50 mb-12" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-footer.png"
              alt="Vivaah"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="font-serif text-[#F8F8F8] font-medium">
              Vivaah
            </span>
          </div>
          <nav className="flex gap-8 text-[#F8F8F8]/80 text-sm">
            <Link href="/privacy" className="hover:text-[#C6A75E] transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-[#C6A75E] transition-colors">
              Contact
            </Link>
            <Link href="/terms" className="hover:text-[#C6A75E] transition-colors">
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-[#F8F8F8]/50 text-sm">
          © 2026 Vivaah — Wedding in Hindi, seamless by design
        </p>
      </div>
    </footer>
  );
}
