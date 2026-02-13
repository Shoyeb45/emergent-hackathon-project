"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { guestsApi, type Guest } from "@/lib/api";

export default function WeddingInvitationsPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<{ guestName?: string; weddingTitle?: string } | null>(null);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [rsvpFilter, setRsvpFilter] = useState<string>("all");
  const [updatingGuestId, setUpdatingGuestId] = useState<string | null>(null);

  useEffect(() => {
    setGuestsLoading(true);
    const params = rsvpFilter === "all" ? undefined : { rsvpStatus: rsvpFilter };
    guestsApi
      .list(weddingId, params)
      .then(setGuests)
      .catch(() => setGuests([]))
      .finally(() => setGuestsLoading(false));
  }, [weddingId, rsvpFilter]);

  useEffect(() => {
    guestsApi.list(weddingId).then(setAllGuests).catch(() => setAllGuests([]));
  }, [weddingId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await guestsApi.add(weddingId, {
        guests: [{ email: email.trim() }],
      });
      if (res.errors?.length) {
        setError(res.errors.map((e) => `${e.email}: ${e.error}`).join(". "));
      } else {
        setSuccess(`Invitation sent to ${email}.`);
        setEmail("");
        setName("");
        setPreview({ guestName: name || email.split("@")[0], weddingTitle: "Wedding" });
        const [fullList, filtered] = await Promise.all([
          guestsApi.list(weddingId),
          rsvpFilter === "all" ? guestsApi.list(weddingId) : guestsApi.list(weddingId, { rsvpStatus: rsvpFilter }),
        ]);
        setAllGuests(fullList);
        setGuests(filtered);
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUploadPermission = async (guestId: string, uploadPermission: boolean) => {
    setUpdatingGuestId(guestId);
    try {
      await guestsApi.updateGuest(weddingId, guestId, { uploadPermission });
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guestId ? { ...g, uploadPermission, uploadRequestedAt: uploadPermission ? null : g.uploadRequestedAt } : g
        )
      );
      setAllGuests((prev) =>
        prev.map((g) =>
          g.id === guestId ? { ...g, uploadPermission, uploadRequestedAt: uploadPermission ? null : g.uploadRequestedAt } : g
        )
      );
    } finally {
      setUpdatingGuestId(null);
    }
  };

  const uploadRequests = allGuests.filter(
    (g) => g.uploadRequestedAt && !g.uploadPermission
  );

  return (
    <div className="max-w-4xl space-y-10">
      <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-8 mb-8">
        <h3 className="font-serif text-lg font-semibold text-[#2B2B2B] mb-6">
          Send Invitation
        </h3>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
              Guest Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B]"
              placeholder="Guest name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-[#FAF7F2] px-4 py-3 text-[#2B2B2B]"
              placeholder="guest@example.com"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-emerald-700 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold disabled:opacity-70"
          >
            {loading ? "Sending…" : "Send Invitation"}
          </button>
        </form>
      </div>

      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-[#C6A75E]/50 bg-[#4A0E2B] p-8 text-center max-w-md"
        >
          <p className="text-[#C6A75E]/80 text-xs uppercase tracking-wider mb-2">
            Invitation preview
          </p>
          <p className="font-serif text-[#F8F8F8] text-xl mb-1">
            {preview.weddingTitle}
          </p>
          <p className="text-[#F8F8F8]/80">
            You&apos;re invited, {preview.guestName}.
          </p>
        </motion.div>
      )}

      {/* Upload requests – guests who asked to upload */}
      {uploadRequests.length > 0 && (
        <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-8">
          <h3 className="font-serif text-lg font-semibold text-[#2B2B2B] mb-4">
            Upload requests
          </h3>
          <p className="text-sm text-[#2B2B2B]/70 mb-4">
            These guests have requested permission to upload photos. Approve to allow them.
          </p>
          <ul className="space-y-3">
            {uploadRequests.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between py-2 border-b border-[#C6A75E]/10 last:border-0"
              >
                <div>
                  <span className="font-medium text-[#2B2B2B]">
                    {g.user?.name ?? "—"}
                  </span>
                  <span className="text-[#2B2B2B]/60 text-sm ml-2">
                    {g.user?.email ?? ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateUploadPermission(g.id, true)}
                  disabled={updatingGuestId === g.id}
                  className="px-4 py-2 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-medium text-sm hover:shadow-gold disabled:opacity-70"
                >
                  {updatingGuestId === g.id ? "…" : "Approve"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* User management – invited and RSVP status */}
      <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-8">
        <h3 className="font-serif text-lg font-semibold text-[#2B2B2B] mb-4">
          Guest list
        </h3>
        <p className="text-sm text-[#2B2B2B]/70 mb-4">
          See who is invited and who accepted. You can allow guests to upload photos.
        </p>
        <div className="flex gap-2 mb-4">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "accepted", label: "Accepted" },
            { value: "declined", label: "Declined" },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRsvpFilter(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                rsvpFilter === value
                  ? "bg-[#C6A75E] text-[#2B2B2B]"
                  : "bg-[#FAF7F2] text-[#2B2B2B]/70 hover:text-[#2B2B2B] border border-[#C6A75E]/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {guestsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
          </div>
        ) : guests.length === 0 ? (
          <p className="text-[#2B2B2B]/60 py-6">No guests match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#C6A75E]/20">
                  <th className="pb-2 text-sm font-medium text-[#2B2B2B]/70">Name</th>
                  <th className="pb-2 text-sm font-medium text-[#2B2B2B]/70">Email</th>
                  <th className="pb-2 text-sm font-medium text-[#2B2B2B]/70">RSVP</th>
                  <th className="pb-2 text-sm font-medium text-[#2B2B2B]/70">Can upload</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.id} className="border-b border-[#C6A75E]/10">
                    <td className="py-3 font-medium text-[#2B2B2B]">
                      {g.user?.name ?? "—"}
                    </td>
                    <td className="py-3 text-[#2B2B2B]/80 text-sm">
                      {g.user?.email ?? "—"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          g.rsvpStatus === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : g.rsvpStatus === "declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {g.rsvpStatus === "pending"
                          ? "Pending"
                          : g.rsvpStatus === "accepted"
                            ? "Accepted"
                            : "Declined"}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateUploadPermission(g.id, !g.uploadPermission)
                        }
                        disabled={updatingGuestId === g.id}
                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                          g.uploadPermission
                            ? "bg-[#C6A75E]/20 text-[#2B2B2B]"
                            : "bg-[#FAF7F2] text-[#2B2B2B]/60 border border-[#C6A75E]/20"
                        } disabled:opacity-70`}
                      >
                        {updatingGuestId === g.id
                          ? "…"
                          : g.uploadPermission
                            ? "Yes"
                            : "No"}
                      </button>
                      {g.uploadRequestedAt && !g.uploadPermission && (
                        <span className="ml-2 text-xs text-amber-600">Requested</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
