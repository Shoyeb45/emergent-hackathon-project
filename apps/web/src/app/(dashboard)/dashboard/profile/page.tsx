"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
    </div>
  );
}
