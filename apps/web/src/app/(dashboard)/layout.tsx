"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  { href: "/dashboard", label: "My Hosted Weddings" },
  { href: "/dashboard/invited", label: "Invited Weddings" },
  { href: "/dashboard/profile", label: "Profile" },
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

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

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
      <nav className="flex-1 px-4 space-y-1">
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
      <div className="p-4 border-t border-[#C6A75E]/30">
        <button
          onClick={() => logout()}
          className="w-full py-2.5 rounded-xl text-[#F8F8F8]/80 text-sm font-medium hover:bg-white/10 hover:text-[#F8F8F8]"
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {showSidebar && (
        <>
          {/* Mobile menu button */}
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
          {/* Drawer overlay */}
          {mobileOpen && (
            <button
              type="button"
              className="md:hidden fixed inset-0 z-40 bg-[#2B2B2B]/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
          )}
          {/* Sidebar: drawer on mobile, fixed on desktop */}
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
