import z from 'zod';

/**
 * Time-only string in 24h format: "hh:mm" (e.g. "09:30", "14:00").
 * Hours 0-23, minutes 0-59. Single-digit hour allowed ("9:30").
 */
export const zodTimeOnly = z
    .string()
    .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Time must be in hh:mm format (24h, e.g. 09:30 or 14:00)',
    );

export type TimeString = z.infer<typeof zodTimeOnly>;

/**
 * Convert "hh:mm" to minutes since midnight (0–1439).
 */
export function timeStringToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Convert minutes since midnight to "hh:mm" (zero-padded).
 */
export function minutesToTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Map event(s) from DB (startTime/endTime as minutes) to API shape (startTime/endTime as "hh:mm").
 */
export function eventWithTimeStrings<
    T extends { startTime: number; endTime?: number | null },
>(event: T) {
    return {
        ...event,
        startTime: minutesToTimeString(event.startTime),
        endTime:
            event.endTime != null ? minutesToTimeString(event.endTime) : null,
    };
}

export function eventsWithTimeStrings<
    T extends { startTime: number; endTime?: number | null },
>(events: T[]) {
    return events.map(eventWithTimeStrings);
}
