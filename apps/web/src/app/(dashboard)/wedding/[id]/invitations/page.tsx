"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { guestsApi, weddingsApi, type Guest } from "@/lib/api";

function GuestRowSkeleton() {
  return (
    <tr className="border-b border-[#C6A75E]/10">
      <td className="py-3"><div className="h-4 w-28 rounded bg-[#C6A75E]/10 animate-pulse" /></td>
      <td className="py-3"><div className="h-4 w-40 rounded bg-[#C6A75E]/10 animate-pulse" /></td>
      <td className="py-3"><div className="h-6 w-16 rounded-full bg-[#C6A75E]/10 animate-pulse" /></td>
      <td className="py-3"><div className="h-6 w-12 rounded-full bg-[#C6A75E]/10 animate-pulse" /></td>
    </tr>
  );
}

export default function WeddingInvitationsPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const [weddingTitle, setWeddingTitle] = useState("");
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
    weddingsApi.get(weddingId).then((w) => setWeddingTitle(w.title)).catch(() => {});
  }, [weddingId]);

  useEffect(() => {
    setGuestsLoading(true);
    const filterParams = rsvpFilter === "all" ? undefined : { rsvpStatus: rsvpFilter };
    guestsApi
      .list(weddingId, filterParams)
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
        setPreview({
          guestName: name || email.split("@")[0],
          weddingTitle: weddingTitle || "Wedding",
        });
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

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "declined", label: "Declined" },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Send Invitation card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-[#C6A75E]/20 shadow-sm overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-[#C6A75E]/15 bg-[#FAF7F2]/30">
          <h2 className="font-serif text-xl font-semibold text-[#2B2B2B]">
            Send invitation
          </h2>
          <p className="text-[#2B2B2B]/65 text-sm mt-1">
            Add a guest by email. They’ll receive an invitation with an RSVP link.
          </p>
        </div>
        <form onSubmit={handleInvite} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              Guest name <span className="text-[#2B2B2B]/50">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-white px-4 py-2.5 text-[#2B2B2B] focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none transition-shadow"
              placeholder="e.g. Priya Sharma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#C6A75E]/30 bg-white px-4 py-2.5 text-[#2B2B2B] focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none transition-shadow"
              placeholder="guest@example.com"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm bg-red-50/80 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-emerald-700 text-sm bg-emerald-50/80 rounded-lg px-3 py-2">{success}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-full bg-burgundy text-[#FAF7F2] font-semibold hover:bg-burgundy-dark disabled:opacity-70 transition-colors shadow-gold"
          >
            {loading ? "Sending…" : "Send invitation"}
          </button>
        </form>
      </motion.div>

      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-[#C6A75E]/30 bg-burgundy/95 p-6 sm:p-8 text-center max-w-md shadow-lg"
        >
          <p className="text-[#C6A75E] text-xs font-medium uppercase tracking-wider mb-2">
            Invitation preview
          </p>
          <p className="font-serif text-[#FAF7F2] text-xl mb-1">
            {preview.weddingTitle}
          </p>
          <p className="text-[#FAF7F2]/85">
            You’re invited, {preview.guestName}.
          </p>
        </motion.div>
      )}

      {/* Upload requests */}
      {uploadRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-[#C6A75E]/20 shadow-sm overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-[#C6A75E]/15">
            <h2 className="font-serif text-xl font-semibold text-[#2B2B2B]">
              Upload requests
            </h2>
            <p className="text-[#2B2B2B]/65 text-sm mt-1">
              These guests asked to upload photos. Approve to allow them.
            </p>
          </div>
          <ul className="divide-y divide-[#C6A75E]/10">
            {uploadRequests.map((g) => (
              <li
                key={g.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:px-6 sm:py-4"
              >
                <div>
                  <span className="font-medium text-[#2B2B2B]">
                    {g.user?.name ?? "—"}
                  </span>
                  <span className="text-[#2B2B2B]/60 text-sm block sm:inline sm:ml-2">
                    {g.user?.email ?? ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateUploadPermission(g.id, true)}
                  disabled={updatingGuestId === g.id}
                  className="shrink-0 px-4 py-2 rounded-full bg-burgundy text-[#FAF7F2] font-medium text-sm hover:bg-burgundy-dark disabled:opacity-70 transition-colors w-fit"
                >
                  {updatingGuestId === g.id ? "…" : "Approve"}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Guest list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-white border border-[#C6A75E]/20 shadow-sm overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-[#C6A75E]/15">
          <h2 className="font-serif text-xl font-semibold text-[#2B2B2B]">
            Guest list
          </h2>
          <p className="text-[#2B2B2B]/65 text-sm mt-1">
            See who’s invited and their RSVP status. You can allow guests to upload photos.
          </p>
        </div>

        <div className="p-4 sm:p-6 border-b border-[#C6A75E]/10">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRsvpFilter(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  rsvpFilter === value
                    ? "bg-burgundy text-[#FAF7F2]"
                    : "bg-[#FAF7F2] text-[#2B2B2B]/70 hover:text-[#2B2B2B] border border-[#C6A75E]/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 min-h-[200px]">
          {guestsLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#C6A75E]/20">
                    <th className="pb-3 text-sm font-medium text-[#2B2B2B]/70">Name</th>
                    <th className="pb-3 text-sm font-medium text-[#2B2B2B]/70">Email</th>
                    <th className="pb-3 text-sm font-medium text-[#2B2B2B]/70">RSVP</th>
                    <th className="pb-3 text-sm font-medium text-[#2B2B2B]/70">Can upload</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <GuestRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : guests.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#2B2B2B]/60">No guests match this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#C6A75E]/20">
                    <th className="pb-3 pr-4 text-sm font-medium text-[#2B2B2B]/70">Name</th>
                    <th className="pb-3 pr-4 text-sm font-medium text-[#2B2B2B]/70">Email</th>
                    <th className="pb-3 pr-4 text-sm font-medium text-[#2B2B2B]/70">RSVP</th>
                    <th className="pb-3 text-sm font-medium text-[#2B2B2B]/70">Can upload</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g) => (
                    <tr key={g.id} className="border-b border-[#C6A75E]/10 hover:bg-[#FAF7F2]/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-[#2B2B2B]">
                        {g.user?.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-[#2B2B2B]/80 text-sm">
                        {g.user?.email ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            g.rsvpStatus === "accepted"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                              : g.rsvpStatus === "declined"
                                ? "bg-red-50 text-red-700 border border-red-200/60"
                                : "bg-amber-50 text-amber-800 border border-amber-200/60"
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
                          className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                            g.uploadPermission
                              ? "bg-[#C6A75E]/20 text-[#2B2B2B] border border-[#C6A75E]/30"
                              : "bg-[#FAF7F2] text-[#2B2B2B]/60 border border-[#C6A75E]/20 hover:border-[#C6A75E]/40"
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
      </motion.div>
    </div>
  );
}
