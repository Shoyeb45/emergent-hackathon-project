"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { eventsApi, type Event } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { weddingsApi } from "@/lib/api";

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
      weddingsApi.get(weddingId).then((w) => ({ hostId: (w.host as { id?: number })?.id })),
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
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
      </div>
    );
  }

  if (events.length === 0 && !isHost) {
    return (
      <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-12 text-center">
        <p className="text-[#2B2B2B]/70">Event details will be updated soon.</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <>
        <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-12 text-center">
          <p className="text-[#2B2B2B]/70 mb-6">No events yet. Add your first event.</p>
          {isHost && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold"
            >
              Add Event
            </button>
          )}
        </div>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2B2B]/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-white border border-[#C6A75E]/30 p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-serif text-xl font-semibold text-[#2B2B2B] mb-6">
                Add Event
              </h3>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                    placeholder="e.g. Haldi, Sangeet"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.eventDate}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, eventDate: e.target.value }))
                      }
                      required
                      className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, startTime: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent((p) => ({ ...p, location: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                    placeholder="Venue or area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 resize-none"
                  />
                </div>
                {addError && <p className="text-red-600 text-sm">{addError}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-full border border-[#C6A75E] text-[#C6A75E] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold disabled:opacity-70"
                  >
                    {addLoading ? "Adding…" : "Add Event"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        {isHost && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold"
          >
            Add Event
          </button>
        )}
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <motion.div
            key={event.id}
            layout
            className="rounded-2xl bg-white border border-[#C6A75E]/20 overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FAF7F2]/50 transition-colors"
              onClick={() =>
                setExpandedId((id) => (id === event.id ? null : event.id))
              }
            >
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#2B2B2B]">
                  {event.name}
                </h3>
                <p className="text-[#2B2B2B]/60 text-sm mt-0.5">
                  {new Date(event.eventDate).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}{" "}
                  · {event.startTime}
                  {event.endTime ? ` – ${event.endTime}` : ""}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </div>
              <span className="text-[#C6A75E] text-lg">
                {expandedId === event.id ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence>
              {expandedId === event.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-[#C6A75E]/20"
                >
                  <div className="p-6 pt-4 text-[#2B2B2B]/80 text-sm">
                    {event.description && <p className="mb-2">{event.description}</p>}
                    {event.location && (
                      <p>
                        <span className="font-medium text-[#2B2B2B]">Location:</span>{" "}
                        {event.location}
                      </p>
                    )}
                    {isHost && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                        className="mt-4 text-red-600 text-sm hover:underline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2B2B]/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-white border border-[#C6A75E]/30 p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif text-xl font-semibold text-[#2B2B2B] mb-6">
              Add Event
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                  placeholder="e.g. Haldi, Sangeet"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.eventDate}
                    onChange={(e) =>
                      setNewEvent((p) => ({ ...p, eventDate: e.target.value }))
                    }
                    required
                    className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent((p) => ({ ...p, startTime: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5"
                  placeholder="Venue or area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B2B2B] mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full rounded-xl border border-[#C6A75E]/30 px-4 py-2.5 resize-none"
                />
              </div>
              {addError && <p className="text-red-600 text-sm">{addError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#C6A75E] text-[#C6A75E] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold disabled:opacity-70"
                >
                  {addLoading ? "Adding…" : "Add Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
