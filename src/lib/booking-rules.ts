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
