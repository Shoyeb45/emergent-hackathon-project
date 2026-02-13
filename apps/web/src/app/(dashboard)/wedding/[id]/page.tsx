"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { eventsApi, type Event } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { weddingsApi } from "@/lib/api";
import {
  formatTimeAmPm,
  formatEventDate,
  formatEventDateShort,
} from "@/lib/date-time";

function EventCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-[#C6A75E]/15 overflow-hidden">
      <div className="p-6 flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#C6A75E]/10 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded bg-[#C6A75E]/15 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-[#C6A75E]/10 animate-pulse" />
          <div className="h-4 w-full rounded bg-[#C6A75E]/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function EventsLoadingState() {
  return (
    <div className="space-y-4">
      <p className="text-[#2B2B2B]/50 text-sm font-medium uppercase tracking-wider mb-6">
        Loading events…
      </p>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <EventCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export default function WeddingEventsPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<{ hostId?: number } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [newEvent, setNewEvent] = useState({
    name: "",
    eventDate: "",
    startTime: "10:00",
    endTime: "",
    location: "",
    description: "",
  });

  const isHost =
    user && wedding?.hostId !== undefined && wedding.hostId === user.id;

  useEffect(() => {
    Promise.all([
      eventsApi.list(weddingId),
      weddingsApi
        .get(weddingId)
        .then((w) => ({ hostId: (w.host as { id?: number })?.id })),
    ])
      .then(([list, w]) => {
        setEvents(list);
        setWedding(w);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [weddingId]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const created = await eventsApi.create(weddingId, {
        events: [
          {
            name: newEvent.name,
            eventDate: newEvent.eventDate,
            startTime: newEvent.startTime,
            endTime: newEvent.endTime || undefined,
            location: newEvent.location || undefined,
            description: newEvent.description || undefined,
          },
        ],
      });
      setEvents((prev) => [...created, ...prev]);
      setShowAddModal(false);
      setNewEvent({
        name: "",
        eventDate: "",
        startTime: "10:00",
        endTime: "",
        location: "",
        description: "",
      });
    } catch (err: unknown) {
      setAddError((err as Error).message || "Failed to add event.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await eventsApi.delete(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setExpandedId((id) => (id === eventId ? null : id));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[320px]"
      >
        <EventsLoadingState />
      </motion.div>
    );
  }

  if (events.length === 0 && !isHost) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white border border-[#C6A75E]/20 shadow-gold/10 p-12 sm:p-16 text-center"
      >
        <span className="text-4xl mb-4 block opacity-70">📅</span>
        <h2 className="font-serif text-xl font-semibold text-[#2B2B2B] mb-2">
          Events coming soon
        </h2>
        <p className="text-[#2B2B2B]/65 max-w-sm mx-auto">
          The host will add event details here. Check back later.
        </p>
      </motion.div>
    );
  }

  if (events.length === 0) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-[#C6A75E]/20 shadow-gold/10 p-12 sm:p-16 text-center"
        >
          <span className="text-4xl mb-4 block opacity-70">✨</span>
          <h2 className="font-serif text-xl font-semibold text-[#2B2B2B] mb-2">
            No events yet
          </h2>
          <p className="text-[#2B2B2B]/65 mb-8 max-w-sm mx-auto">
            Add your first event — Haldi, Sangeet, ceremony, or reception.
          </p>
          {isHost && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-full bg-burgundy text-[#FAF7F2] font-semibold hover:bg-burgundy-dark transition-colors shadow-gold"
            >
              Add event
            </button>
          )}
        </motion.div>
        {showAddModal && (
          <AddEventModal
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            addError={addError}
            addLoading={addLoading}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddEvent}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <p className="text-[#2B2B2B]/60 text-sm">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </p>
        {isHost && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-full bg-burgundy text-[#FAF7F2] font-semibold hover:bg-burgundy-dark transition-colors shadow-gold inline-flex items-center gap-2"
          >
            <span aria-hidden>+</span> Add event
          </button>
        )}
      </div>

      <div className="space-y-5">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            layout
            className="rounded-2xl bg-white border border-[#C6A75E]/20 overflow-hidden shadow-sm hover:shadow-gold/10 hover:border-[#C6A75E]/30 transition-all duration-300"
          >
            <button
              type="button"
              className="w-full flex flex-col sm:flex-row sm:items-stretch text-left"
              onClick={() =>
                setExpandedId((id) => (id === event.id ? null : event.id))
              }
            >
              {/* Date badge */}
              <div className="sm:w-24 shrink-0 flex sm:flex-col items-center sm:items-center sm:justify-center py-4 sm:py-6 px-4 bg-burgundy/5 border-b sm:border-b-0 sm:border-r border-[#C6A75E]/15">
                <span className="font-serif text-2xl font-semibold text-burgundy leading-tight">
                  {formatEventDateShort(event.eventDate).day}
                </span>
                <span className="text-xs font-medium text-[#2B2B2B]/70 uppercase tracking-wider mt-0.5">
                  {formatEventDateShort(event.eventDate).month}
                </span>
              </div>

              {/* Main content */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#2B2B2B]">
                    {event.name}
                  </h3>
                  <p className="text-[#2B2B2B]/60 text-sm mt-1">
                    {formatEventDate(event.eventDate)}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-[#2B2B2B]/80">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-[#C6A75E]" aria-hidden>🕐</span>
                      <strong className="text-[#2B2B2B] font-medium">Start</strong>
                      <span>{formatTimeAmPm(event.startTime) || "—"}</span>
                    </span>
                    {event.endTime && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[#C6A75E]" aria-hidden>→</span>
                        <strong className="text-[#2B2B2B] font-medium">End</strong>
                        <span>{formatTimeAmPm(event.endTime) || "—"}</span>
                      </span>
                    )}
                    {event.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[#C6A75E]" aria-hidden>📍</span>
                        <span className="truncate max-w-[200px] sm:max-w-none" title={event.location}>
                          {event.location}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-burgundy font-medium transition-colors ${
                    expandedId === event.id
                      ? "bg-burgundy/10"
                      : "bg-[#C6A75E]/10"
                  }`}
                  aria-hidden
                >
                  {expandedId === event.id ? "−" : "+"}
                </span>
              </div>
            </button>

            <AnimatePresence>
              {expandedId === event.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-[#C6A75E]/15 overflow-hidden"
                >
                  <div className="p-5 sm:p-6 pt-4 bg-[#FAF7F2]/60">
                    {event.description ? (
                      <p className="text-[#2B2B2B]/85 text-sm leading-relaxed mb-4">
                        {event.description}
                      </p>
                    ) : !event.location && !isHost ? (
                      <p className="text-[#2B2B2B]/50 text-sm italic">No additional details.</p>
                    ) : null}
                    {event.location && (
                      <p className="text-sm text-[#2B2B2B]/80 flex items-start gap-2">
                        <span aria-hidden className="shrink-0">📍</span>
                        <span>
                          <span className="font-medium text-[#2B2B2B]">Venue</span>
                          <span className="ml-1">{event.location}</span>
                        </span>
                      </p>
                    )}
                    {isHost && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                        className="mt-4 text-red-600/90 text-sm font-medium hover:text-red-600 hover:underline"
                      >
                        Delete event
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {showAddModal && (
        <AddEventModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          addError={addError}
          addLoading={addLoading}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEvent}
        />
      )}
    </>
  );
}

function AddEventModal({
  newEvent,
  setNewEvent,
  addError,
  addLoading,
  onClose,
  onSubmit,
}: {
  newEvent: {
    name: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
  };
  setNewEvent: React.Dispatch<
    React.SetStateAction<{
      name: string;
      eventDate: string;
      startTime: string;
      endTime: string;
      location: string;
      description: string;
    }>
  >;
  addError: string;
  addLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2B2B]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="rounded-2xl bg-white border border-[#C6A75E]/25 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 border-b border-[#C6A75E]/15">
          <h3 className="font-serif text-xl font-semibold text-[#2B2B2B]">
            Add event
          </h3>
          <p className="text-[#2B2B2B]/60 text-sm mt-1">
            Haldi, Sangeet, ceremony, reception — add dates and times.
          </p>
        </div>
        <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              Event name
            </label>
            <input
              type="text"
              value={newEvent.name}
              onChange={(e) =>
                setNewEvent((p) => ({ ...p, name: e.target.value }))
              }
              required
              className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none transition-shadow"
              placeholder="e.g. Haldi, Sangeet, Ceremony"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={newEvent.eventDate}
              onChange={(e) =>
                setNewEvent((p) => ({ ...p, eventDate: e.target.value }))
              }
              required
              className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
                Start time
              </label>
              <input
                type="time"
                value={newEvent.startTime}
                onChange={(e) =>
                  setNewEvent((p) => ({ ...p, startTime: e.target.value }))
                }
                className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none"
              />
              <p className="text-xs text-[#2B2B2B]/50 mt-1">
                Shown as e.g. 10:00 AM
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
                End time <span className="text-[#2B2B2B]/50">(optional)</span>
              </label>
              <input
                type="time"
                value={newEvent.endTime}
                onChange={(e) =>
                  setNewEvent((p) => ({ ...p, endTime: e.target.value }))
                }
                className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              Location / venue
            </label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent((p) => ({ ...p, location: e.target.value }))
              }
              className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none"
              placeholder="Venue name or address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5">
              Description <span className="text-[#2B2B2B]/50">(optional)</span>
            </label>
            <textarea
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 resize-none focus:ring-2 focus:ring-[#C6A75E]/30 focus:border-[#C6A75E] outline-none"
              placeholder="Any notes for guests"
            />
          </div>
          {addError && (
            <p className="text-red-600 text-sm bg-red-50/80 rounded-lg px-3 py-2">
              {addError}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#C6A75E]/40 text-[#2B2B2B] font-medium hover:bg-[#FAF7F2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="flex-1 py-2.5 rounded-xl bg-burgundy text-[#FAF7F2] font-semibold hover:bg-burgundy-dark disabled:opacity-70 transition-colors"
            >
              {addLoading ? "Adding…" : "Add event"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
