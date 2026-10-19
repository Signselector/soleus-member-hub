import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui-soleus/primitives";
import { MAX_DAYS_AHEAD, MIN_HOURS_BEFORE, slotState, weeklyUnitsLeft } from "@/lib/booking-rules";
import { addMemberBooking, useMemberBookings } from "@/lib/member-bookings";
import { mockMember } from "@/lib/mock-data";
import { seedBookings } from "@/lib/admin/mock";
import { SEED_AVAILABILITY } from "@/lib/admin/mock2";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const at = (d: Date, h: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h);
const iso = (d: Date, h: number) => `${dayKey(d)}T${pad(h)}:00`;
const hh = (h: number) => `${pad(h)}:00`;
const longDate = (d: Date) => d.toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" });

/** Opening hours per weekday: same schedule the admins maintain in "Zeitplan". */
function hoursOf(d: Date): number[] {
  const a = SEED_AVAILABILITY[(d.getDay() + 6) % 7];
  if (!a?.enabled) return [];
  const from = Number(a.from.slice(0, 2));
  const to = Number(a.to.slice(0, 2));
  return Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
}

export function PrivateGymBooking() {
  const mine = useMemberBookings();
  const [now, setNow] = useState<Date | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [done, setDone] = useState<{ start: Date } | null>(null);

  useEffect(() => {
    const n = new Date();
    setNow(n);
    setView({ y: n.getFullYear(), m: n.getMonth() });
  }, []);

  const taken = useMemo(() => {
    if (!now) return new Set<string>();
    const s = new Set<string>();
    seedBookings(now).filter((b) => b.status !== "cancelled").forEach((b) => s.add(b.start));
    mine.forEach((b) => s.add(b.start));
    return s;
  }, [now, mine]);

  if (!now || !view) return <div className="mt-10 h-[520px]" aria-hidden />;

  const hoursLeft = weeklyUnitsLeft(mockMember.membership.name, mine, day ?? now ?? new Date());
  const stateOf = (d: Date, h: number) => {
    const s = slotState(at(d, h), now);
    if (s !== "ok") return s;
    if (taken.has(iso(d, h))) return "taken" as const;
    if (mine.some((b) => sameDay(new Date(b.start), d))) return "day_limit" as const;
    if (weeklyUnitsLeft(mockMember.membership.name, mine, d) < 1) return "week_limit" as const;
    return "free" as const;
  };
  const dayFree = (d: Date) => hoursOf(d).some((h) => stateOf(d, h) === "free");

  const today = startOfDay(now);
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.y, view.m, i + 1))];
  const lastDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + MAX_DAYS_AHEAD);
  const canPrev = view.y > today.getFullYear() || (view.y === today.getFullYear() && view.m > today.getMonth());
  const canNext = new Date(view.y, view.m + 1, 1) <= lastDay;
  const shift = (n: number) => setView(() => { const d = new Date(view.y, view.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const monthLabel = first.toLocaleDateString("de-AT", { month: "long", year: "numeric" });

  if (done) {
    return (
      <div className="mt-12 max-w-xl animate-rise rounded-2xl bg-card p-8 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-12">
        <CheckCircle2 className="h-9 w-9" strokeWidth={1.25} />
        <h2 className="mt-6 text-3xl font-light tracking-tight">Dein Private Gym ist gebucht.</h2>
        <p className="mt-4 text-lg font-light">{longDate(done.start)} · {hh(done.start.getHours())} – {hh(done.start.getHours() + 1)} Uhr</p>
        <p className="mt-3 text-sm text-muted-foreground">Deinen Zutrittscode findest du ab 30 Minuten vor Beginn auf der Startseite.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/buchungen" className="bg-[#211d1b] hover:bg-[#211d1b]/90">Meine Buchungen</ButtonLink>
          <button type="button" onClick={() => { setDone(null); setDay(null); setHour(null); }} className="inline-flex min-h-12 items-center justify-center rounded-full border border-foreground/15 px-8 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-secondary">Weitere Session buchen</button>
        </div>
      </div>
    );
  }

  const confirm = () => {
    if (!day || hour === null || stateOf(day, hour) !== "free" || hoursLeft < 1) return;
    addMemberBooking(iso(day, hour));
    setDone({ start: at(day, hour) });
  };

  return (
    <div className="mt-12 grid animate-rise gap-10 md:mt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <div>
        <p className="flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.3em] text-muted-foreground"><CalendarDays className="h-4 w-4" strokeWidth={1.5} /> Datum</p>
        <div className="mt-5 rounded-2xl bg-card p-5 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] sm:p-8">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Vorheriger Monat" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60 transition-colors hover:bg-secondary disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-sm font-light capitalize tracking-wide">{monthLabel}</span>
            <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Nächster Monat" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60 transition-colors hover:bg-secondary disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mt-5 grid grid-cols-7 text-center text-[0.6875rem] uppercase tracking-[0.2em] text-muted-foreground">
            {WEEKDAYS.map((w) => <span key={w} className="py-2">{w}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const past = d < today;
              const ok = !past && d <= lastDay && dayFree(d);
              const sel = day && dayKey(d) === dayKey(day);
              return (
                <button
                  key={dayKey(d)}
                  type="button"
                  disabled={!ok}
                  aria-pressed={!!sel}
                  aria-label={longDate(d)}
                  onClick={() => { setDay(d); setHour(null); }}
                  className={cn(
                    "mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm transition-colors sm:h-12 sm:w-12",
                    sel && "bg-[#211d1b] text-[#f7f5f1]",
                    !sel && ok && "hover:bg-secondary",
                    !ok && past && "text-foreground/40 line-through decoration-foreground/40",
                    !ok && !past && "text-foreground/35",
                    dayKey(d) === dayKey(today) && !sel && "border border-foreground/25",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-5 max-w-md text-xs leading-relaxed text-muted-foreground">
          Buchbar bis {MAX_DAYS_AHEAD / 7} Wochen im Voraus ({longDate(lastDay)}) und spätestens {MIN_HOURS_BEFORE} Stunden vor Beginn.
        </p>
      </div>

      <div>
        <p className="flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.3em] text-muted-foreground"><Clock className="h-4 w-4" strokeWidth={1.5} /> Uhrzeit</p>
        {day ? (
          <>
            <p className="mt-5 text-sm font-light text-muted-foreground">{longDate(day)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {hoursOf(day).map((h) => {
                const s = stateOf(day, h);
                const ok = s === "free";
                return (
                  <button
                    key={h}
                    type="button"
                    disabled={!ok}
                    aria-pressed={hour === h}
                    onClick={() => setHour(h)}
                    className={cn(
                      "flex h-14 flex-col items-center justify-center rounded-full border text-sm transition-colors",
                      hour === h ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-foreground/15 bg-card hover:bg-secondary",
                      !ok && "cursor-not-allowed bg-transparent opacity-45 hover:bg-transparent",
                    )}
                  >
                    <span className={cn(!ok && "line-through")}>{hh(h)}</span>
                    {!ok && <span className="text-[0.5625rem] uppercase tracking-[0.15em]">{s === "taken" ? "Belegt" : s === "too_soon" ? "Zu kurzfristig" : s === "day_limit" ? "1 pro Tag" : s === "week_limit" ? "Wochenlimit" : ""}</span>}
                  </button>
                );
              })}
            </div>
            {hoursOf(day).length === 0 && <p className="mt-4 text-sm text-muted-foreground">An diesem Tag ist das Gym nicht buchbar.</p>}
          </>
        ) : (
          <p className="mt-5 text-sm font-light text-muted-foreground">Bitte wähle zuerst ein Datum.</p>
        )}

        <div className="mt-8 rounded-2xl bg-[#211d1b] p-6 text-[#f7f5f1]">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.3em] text-[#f7f5f1]/70">Deine Auswahl</p>
          {day && hour !== null ? (
            <p className="mt-3 text-xl font-light">{longDate(day)}<br /><span className="text-[#f7f5f1]/75">{hh(hour)} – {hh(hour + 1)} Uhr · Private Gym</span></p>
          ) : (
            <p className="mt-3 text-sm font-light text-[#f7f5f1]/70">Noch kein Termin gewählt.</p>
          )}
          <p className="mt-4 text-xs text-[#f7f5f1]/70">Verfügbare Wocheneinheiten: <span className="tabular-nums">{hoursLeft === Infinity ? "∞" : hoursLeft}</span>{hoursLeft < 1 && " · keine Einheit in dieser Woche übrig"}</p>
          <p className="mt-1 text-xs text-[#f7f5f1]/70">Maximal 1 Buchung pro Tag.</p>
          <button type="button" disabled={!day || hour === null || hoursLeft < 1} onClick={confirm} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#e8dfcd] px-8 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[#3b2a20] transition-opacity hover:opacity-90 disabled:opacity-40">
            Verbindlich buchen
          </button>
        </div>
      </div>
    </div>
  );
}
