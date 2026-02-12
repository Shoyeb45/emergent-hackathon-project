"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="p-12 max-w-[1280px] mx-auto">
      <h1 className="font-serif text-3xl font-semibold text-[#2B2B2B] mb-8">
        Profile
      </h1>
      <div className="rounded-2xl bg-white shadow-lg border border-[#C6A75E]/20 p-8 max-w-md">
        <p className="text-[#2B2B2B]/70">
          <span className="font-medium text-[#2B2B2B]">Name:</span> {user?.name}
        </p>
        <p className="text-[#2B2B2B]/70 mt-2">
          <span className="font-medium text-[#2B2B2B]">Email:</span> {user?.email}
        </p>
      </div>
    </div>
  );
}
