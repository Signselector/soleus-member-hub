import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Field } from "@/components/ui-soleus/primitives";
import { useAuthState } from "@/lib/auth-state";
import { cn } from "@/lib/utils";

const SLOT_HOURS = [17, 18, 19, 20, 21];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WAIT_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const slotDate = (day: Date, h: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, 0, 0, 0);
const longDate = (d: Date) => d.toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" });
const hhmm = (h: number) => `${String(h).padStart(2, "0")}:00`;

/**
 * Trial-session booking: date → time → contact → done.
 * A first booking is possible at the earliest 24h after registration. Mock: nothing is sent yet.
 */
export function TrialBooking() {
  const { registeredAt } = useAuthState();
  const [now, setNow] = useState<Date | null>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  useEffect(() => {
    const n = new Date();
    setNow(n);
    setView({ y: n.getFullYear(), m: n.getMonth() });
  }, []);

  const earliest = useMemo(() => (now ? new Date((registeredAt ?? now.getTime()) + WAIT_MS) : null), [now, registeredAt]);

  if (!now || !earliest || !view) return <div className="mx-auto mt-14 h-[560px] max-w-5xl" aria-hidden />;

  const today = startOfDay(now);
  const slotOk = (d: Date, h: number) => slotDate(d, h) >= earliest;
  const dayOk = (d: Date) => SLOT_HOURS.some((h) => slotOk(d, h));

  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.y, view.m, i + 1))];
  const atCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();
  const monthLabel = first.toLocaleDateString("de-AT", { month: "long", year: "numeric" });
  const shift = (n: number) => setView((v) => (v ? (() => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; })() : v));

  const stepLabels = ["01 — Termin", "02 — Kontakt", "03 — Fertig"];

  return (
    <div className="mx-auto mt-14 max-w-5xl">
      <ol className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.6875rem] uppercase tracking-[0.3em]">
        {stepLabels.map((l, i) => (
          <li key={l} className="flex items-center gap-5">
            <span className={i === step ? "font-medium text-primary-foreground" : "text-primary-foreground/60"}>{l}</span>
            {i < 2 && <span className="hidden h-px w-10 bg-primary-foreground/30 sm:block" aria-hidden />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="mt-12 grid animate-rise gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <p className="flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.3em] text-primary-foreground/80">
              <CalendarDays className="h-4 w-4" strokeWidth={1.5} /> Datum
            </p>
            <div className="mt-5 rounded-md bg-secondary p-5 text-foreground sm:p-7">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => shift(-1)}
                  disabled={atCurrentMonth}
                  aria-label="Vorheriger Monat"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/8 transition-colors hover:bg-foreground/15 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-light capitalize tracking-wide">{monthLabel}</span>
                <button
                  type="button"
                  onClick={() => shift(1)}
                  aria-label="Nächster Monat"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/8 transition-colors hover:bg-foreground/15"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 grid grid-cols-7 text-center text-[0.6875rem] uppercase tracking-[0.2em] text-foreground/60">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="py-2">{w}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
                {cells.map((d, i) => {
                  if (!d) return <span key={`e${i}`} />;
                  const past = d < today;
                  const ok = dayOk(d);
                  const sel = day && sameDay(d, day);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      disabled={!ok}
                      aria-pressed={!!sel}
                      aria-label={longDate(d)}
                      onClick={() => {
                        setDay(d);
                        setHour((h) => (h !== null && slotOk(d, h) ? h : null));
                      }}
                      className={cn(
                        "mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm transition-colors sm:h-12 sm:w-12",
                        sel && "bg-[#3b2a20] text-[#f7f5f1] ring-2 ring-[#a8693a] ring-offset-2 ring-offset-secondary",
                        !sel && ok && "hover:bg-foreground/10",
                        !ok && past && "text-foreground/45 line-through decoration-foreground/45",
                        !ok && !past && "text-foreground/45",
                        sameDay(d, today) && !sel && "border border-foreground/25",
                      )}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <p className="flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.3em] text-primary-foreground/80">
              <Clock className="h-4 w-4" strokeWidth={1.5} /> Uhrzeit
            </p>
            {day ? (
              <>
                <p className="mt-5 text-sm font-light text-primary-foreground/80">{longDate(day)}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SLOT_HOURS.map((h) => {
                    const ok = slotOk(day, h);
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={!ok}
                        aria-pressed={hour === h}
                        onClick={() => setHour(h)}
                        className={cn(
                          "h-14 rounded-full border text-sm transition-colors",
                          hour === h ? "border-secondary bg-secondary text-foreground" : "border-primary-foreground/25 bg-primary-foreground/10 hover:bg-primary-foreground/20",
                          !ok && "cursor-not-allowed opacity-35 hover:bg-primary-foreground/10",
                        )}
                      >
                        {hhmm(h)}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm font-light text-primary-foreground/70">Bitte wähle zuerst ein Datum.</p>
            )}
            <p className="mt-6 text-xs leading-relaxed text-primary-foreground/60">
              Ein Probetraining ist frühestens 24 Stunden nach deiner Registrierung buchbar.
            </p>
            <button
              type="button"
              disabled={!day || hour === null}
              onClick={() => setStep(1)}
              className="mt-8 h-12 w-full rounded-full border border-primary-foreground/25 bg-primary-foreground/10 text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors enabled:hover:bg-primary-foreground/20 disabled:opacity-50"
            >
              Weiter zu Kontaktdaten
            </button>
          </div>
        </div>
      )}

      {step === 1 && day && hour !== null && (
        <form
          className="mx-auto mt-12 max-w-xl animate-rise space-y-8 rounded-2xl bg-secondary p-6 text-foreground sm:p-10"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <p className="text-sm font-light text-muted-foreground">
            {longDate(day)} · {hhmm(hour)} Uhr
          </p>
          <div className="grid gap-8 sm:grid-cols-2">
            <Field id="t-fn" label="Vorname *" required autoComplete="given-name" value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} />
            <Field id="t-ln" label="Nachname *" required autoComplete="family-name" value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} />
          </div>
          <Field id="t-em" label="E-Mail *" type="email" required autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <Field id="t-ph" label="Telefon *" type="tel" required autoComplete="tel" placeholder="+43" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => setStep(0)} className="h-12 rounded-full border border-foreground/15 px-8 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors hover:bg-foreground/5">
              Zurück
            </button>
            <button type="submit" className="h-12 rounded-full bg-[#211d1b] px-8 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1] transition-colors hover:bg-[#211d1b]/90">
              Probetraining buchen
            </button>
          </div>
        </form>
      )}

      {step === 2 && day && hour !== null && (
        <div className="mx-auto mt-12 max-w-xl animate-rise rounded-2xl bg-secondary p-8 text-center text-foreground sm:p-12">
          <CheckCircle2 className="mx-auto h-9 w-9" strokeWidth={1.25} />
          <h2 className="mt-6 text-3xl font-light tracking-tight">Dein Probetraining ist gebucht.</h2>
          <p className="mt-4 text-base font-light text-muted-foreground">
            {longDate(day)} · {hhmm(hour)} Uhr
          </p>
          <p className="mt-2 text-sm font-light text-muted-foreground">Wir freuen uns auf dich, {contact.firstName}.</p>
        </div>
      )}
    </div>
  );
}
