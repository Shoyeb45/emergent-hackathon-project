"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { href: "/dashboard", label: "My Hosted Weddings" },
  { href: "/dashboard/invited", label: "Invited Weddings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isWeddingRoute = pathname.match(/^\/wedding\/[^/]+/);
  const showSidebar = !isWeddingRoute;

  const SidebarContent = () => (
    <>
      <Link href="/dashboard" className="p-6 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
        <Image
          src="/vivaah-ai.png"
          alt="Vivaah"
          width={36}
          height={36}
          className="h-10 w-10 object-contain"
        />
        <span className="font-serif font-semibold text-[#F8F8F8]">Vivaah</span>
      </Link>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#C6A75E]/20 text-[#C6A75E] border-l-2 border-[#C6A75E] ml-0"
                  : "text-[#F8F8F8]/80 hover:bg-white/5 hover:text-[#F8F8F8]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      {/* Lower left: profile trigger + upward dropdown */}
      <div className="p-4 border-t border-[#C6A75E]/30 shrink-0 relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/10 transition-colors"
          aria-expanded={profileOpen}
          aria-haspopup="true"
        >
          <span className="w-9 h-9 rounded-full bg-[#C6A75E]/30 flex items-center justify-center text-[#F8F8F8] shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="font-medium text-[#F8F8F8] text-sm truncate flex-1 min-w-0">
            {user.name}
          </span>
          <svg
            className={`w-4 h-4 text-[#F8F8F8]/70 shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        {profileOpen && (
          <div className="absolute left-4 right-4 bottom-full mb-2 py-2 rounded-xl bg-white border border-[#C6A75E]/20 shadow-lg z-50 min-w-[200px]">
            <div className="px-4 py-3 border-b border-[#C6A75E]/15">
              <p className="font-medium text-[#2B2B2B] truncate">{user.name}</p>
              <p className="text-sm text-[#2B2B2B]/70 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setMobileOpen(false);
                logout();
              }}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {showSidebar && (
        <>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-xl bg-[#4A0E2B] text-[#F8F8F8]"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {mobileOpen && (
            <button
              type="button"
              className="md:hidden fixed inset-0 z-40 bg-[#2B2B2B]/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
          )}
          <aside
            className={`w-64 shrink-0 bg-[#4A0E2B] flex flex-col fixed inset-y-0 z-50 transform transition-transform duration-300 ease-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <SidebarContent />
          </aside>
        </>
      )}
      <main className={`flex-1 min-h-screen bg-[#FAF7F2] ${showSidebar ? "md:ml-64 pt-14 md:pt-0" : ""}`}>
        {children}
      </main>
    </div>
  );
}
