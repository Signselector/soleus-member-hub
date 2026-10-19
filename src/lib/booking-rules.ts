/** Rules for booking a Private Gym session. */
export const MAX_DAYS_AHEAD = 21; // bookable up to 3 weeks in advance
export const MIN_HOURS_BEFORE = 12; // at the latest 12 hours before the start

export type SlotState = "ok" | "too_soon" | "too_far" | "past";

export function slotState(start: Date, now: Date): SlotState {
  const diffH = (start.getTime() - now.getTime()) / 3_600_000;
  if (diffH <= 0) return "past";
  if (diffH < MIN_HOURS_BEFORE) return "too_soon";
  const last = new Date(now.getFullYear(), now.getMonth(), now.getDate() + MAX_DAYS_AHEAD, 23, 59, 59);
  if (start > last) return "too_far";
  return "ok";
}

/** Latest day (inclusive) that can still be booked. */
export const lastBookableDay = (now: Date) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + MAX_DAYS_AHEAD);

/** Weekly training units per plan (Unlimited = no limit). */
export const WEEKLY_LIMIT: Record<string, number> = { Standard: 1, Plus: 2, Premium: 3, Unlimited: Infinity };

const weekKey = (d: Date) => {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `${m.getFullYear()}-${m.getMonth()}-${m.getDate()}`;
};

/** Units still free in the calendar week (Mon–Sun) of `day`, given the member's bookings. */
export function weeklyUnitsLeft(plan: string, bookings: { start: string }[], day: Date): number {
  const limit = WEEKLY_LIMIT[plan] ?? 1;
  const used = bookings.filter((b) => weekKey(new Date(b.start)) === weekKey(day)).length;
  return Math.max(0, limit - used);
}
