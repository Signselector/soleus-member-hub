import { useSyncExternalStore } from "react";

/** The signed-in member's own bookings. Mock: kept in localStorage until a backend exists. */
export type MemberBooking = { id: string; start: string; durationMin: number; createdAt: number };

const KEY = "soleus-member-bookings";
const EMPTY: MemberBooking[] = [];
let cache: MemberBooking[] | null = null;
const listeners = new Set<() => void>();

function read(): MemberBooking[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as MemberBooking[];
  } catch {
    cache = [];
  }
  return cache;
}
function write(next: MemberBooking[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function addMemberBooking(start: string) {
  const b: MemberBooking = { id: `mb${Date.now()}`, start, durationMin: 60, createdAt: Date.now() };
  write([...read(), b].sort((a, c) => a.start.localeCompare(c.start)));
  return b;
}

export function cancelMemberBooking(id: string) {
  write(read().filter((b) => b.id !== id));
}

export function useMemberBookings() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
