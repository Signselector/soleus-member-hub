import { useEffect, useState } from "react";

/** The access code works from 30 minutes before the session until it ends. */
export const CODE_LEAD_MIN = 30;

export type SessionPhase = "before" | "live" | "over";

export function sessionTimes(start: Date, end: Date, now: Date) {
  const codeFrom = new Date(start.getTime() - CODE_LEAD_MIN * 60_000);
  const phase: SessionPhase = now < start ? "before" : now < end ? "live" : "over";
  const total = end.getTime() - start.getTime();
  return {
    phase,
    toStart: Math.max(0, start.getTime() - now.getTime()),
    toEnd: Math.max(0, end.getTime() - now.getTime()),
    /** 0–1 progress of the booked window. */
    progress: phase === "before" ? 0 : phase === "over" ? 1 : (now.getTime() - start.getTime()) / total,
    codeFrom,
    codeActive: now >= codeFrom && now < end,
    codeExpired: now >= end,
    toCodeFrom: Math.max(0, codeFrom.getTime() - now.getTime()),
    /** 0–1 how much of the code's validity window has passed. */
    codeProgress: now < codeFrom ? 0 : now >= end ? 1 : (now.getTime() - codeFrom.getTime()) / (end.getTime() - codeFrom.getTime()),
  };
}

/** hh:mm:ss, with days when longer than 24h. */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d > 0 ? `${d} Tg ` : ""}${p(h)}:${p(m)}:${p(sec)}`;
}

/** Re-renders every second. Returns null on the server so markup matches on hydration. */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
