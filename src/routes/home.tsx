import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, KeyRound } from "lucide-react";
import { MemberShell } from "@/components/layout/MemberShell";
import { ButtonLink, Eyebrow } from "@/components/ui-soleus/primitives";
import { KEY_VALID_MS, generateAccessKey, useAccessKey } from "@/lib/access-key";
import { weeklyUnitsLeft, WEEKLY_LIMIT } from "@/lib/booking-rules";
import { useMemberBookings } from "@/lib/member-bookings";
import { formatDuration, sessionTimes, useNow } from "@/lib/session-timers";
import { mockMember, mockNextSession as mockNextSessionBase } from "@/lib/mock-data";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — SOLEUS Member" },
      { name: "description", content: "Deine nächste Session, Mitgliedschaft und Buchungen auf einen Blick." },
      { property: "og:title", content: "Home — SOLEUS Member" },
      { property: "og:description", content: "Deine nächste Session, Mitgliedschaft und Buchungen auf einen Blick." },
    ],
  }),
  component: Home,
});

const quick = [
  { to: "/buchen", label: "Training buchen" },
  { to: "/buchungen", label: "Meine Buchungen" },
  { to: "/mitgliedschaft", label: "Mitgliedschaft" },
  { to: "/family", label: "Family & Friends" },
  { to: "/problem-melden", label: "Problem melden" },
] as const;

function Home() {
    const m = mockMember;
  const mine = useMemberBookings();
  const now = useNow();
  /** A session stays "next" until it has ended. */
  const own = now ? mine.filter((b) => new Date(b.start).getTime() + 3_600_000 > now.getTime()) : [];
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return { dateLabel: now && d.toDateString() === now.toDateString() ? "Heute" : d.toLocaleDateString("de-AT", { weekday: "short", day: "numeric", month: "short" }), time: `${pad(d.getHours())}:00 — ${pad(d.getHours() + 1)}:00` };
  };
  /** A booking made in /buchen replaces the demo data. */
  const booking = own.length > 0 ? "upcoming" : "none";
  const mockNextSession = own[0] ? { ...mockNextSessionBase, ...fmt(own[0].start), location: "Private Gym" } : mockNextSessionBase;
  const upcomingList = own.map((b) => ({ id: b.id, location: "Private Gym", ...fmt(b.start) }));
  const weeklyLimit = WEEKLY_LIMIT[m.membership.name] ?? 1;
  const unitsLeft = weeklyUnitsLeft(m.membership.name, mine, now ?? new Date());

  const sStart = own[0] ? new Date(own[0].start) : null;
  const sEnd = sStart ? new Date(sStart.getTime() + 3_600_000) : null;
  const t = now && sStart && sEnd ? sessionTimes(sStart, sEnd, now) : null;
  const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const showSession = mockNextSession;

  /** Key: can be generated from 30 min before the session until it ends; then valid for 1 h from generation. */
  const sessionId = own[0]?.id ?? "none";
  const key = useAccessKey();
  const myKey = key && key.sessionId === sessionId ? key : null;
  const keyLeft = myKey && now ? Math.max(0, myKey.generatedAt + KEY_VALID_MS - now.getTime()) : 0;
  const keyValid = !!myKey && keyLeft > 0;
  const canGenerate = !!t && t.codeActive;

  return (
    <MemberShell>
      <p className="eyebrow animate-rise">Hallo, {m.firstName}</p>

      {booking === "upcoming" ? (
        <section className="mt-6 grid gap-10 animate-rise md:grid-cols-[1.4fr_1fr] md:gap-16">
          <div>
            <Eyebrow>Nächste Session</Eyebrow>
            <h1 className="mt-4 text-5xl leading-[1.05] font-light tracking-tight md:text-7xl">
              {showSession.dateLabel}
              <br />
              <span className="text-muted-foreground">{showSession.time}</span>
            </h1>
            <p className="mt-6 text-sm uppercase tracking-[0.2em]">{showSession.location}</p>

            <div className="mt-8 max-w-sm" role="timer" aria-label="Session-Timer">
              <Eyebrow>Session-Timer</Eyebrow>
              <p className={`mt-3 text-3xl font-light tabular-nums tracking-tight ${t?.phase === "live" ? "" : "text-muted-foreground"}`}>
                {formatDuration(t?.phase === "live" ? t.toEnd : 0)}
              </p>
              <div className="mt-3 h-px w-full bg-border" aria-hidden>
                <div className="h-px bg-foreground transition-[width] duration-1000" style={{ width: `${t?.phase === "live" ? (1 - t.progress) * 100 : 0}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t?.phase === "live" ? "Verbleibende Trainingszeit" : t?.phase === "over" ? "Session beendet" : "Startet mit Beginn deiner Session"}
              </p>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl bg-primary p-8 text-primary-foreground md:p-10">
            <div className="flex items-center justify-between">
              <Eyebrow className="text-primary-foreground/75">Zutritt</Eyebrow>
              <KeyRound className="h-4 w-4 text-primary-foreground/75" strokeWidth={1.25} />
            </div>
            {keyValid && myKey ? (
              <div className="mt-10">
                <p className="text-4xl font-light tracking-[0.15em] tabular-nums md:text-5xl">{myKey.code.split("").join(" ")}</p>
                <p className="mt-4 text-sm text-primary-foreground/80">Dein Zutrittscode ist aktiv. Bitte am Eingang eingeben.</p>
              </div>
            ) : canGenerate ? (
              <div className="mt-8">
                <p className="text-4xl font-light tracking-[0.15em] text-primary-foreground/40">— — — —</p>
                <p className="mt-4 text-sm text-primary-foreground/80">
                  {myKey ? "Dein Code ist abgelaufen. Du kannst einen neuen erzeugen." : "Erzeuge deinen Zutrittscode. Er ist ab dem Erzeugen 1 Stunde gültig."}
                </p>
                <button type="button" onClick={() => generateAccessKey(sessionId)} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#e8dfcd] px-8 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[#3b2a20] transition-opacity hover:opacity-90">
                  {myKey ? "Neuen Code erzeugen" : "Zutrittscode erzeugen"}
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-4xl font-light tracking-[0.15em] text-primary-foreground/40">— — — —</p>
                <p className="mt-4 text-sm text-primary-foreground/80">
                  {t && t.codeExpired ? "Die Session ist beendet." : `Dein Zutrittscode steht ab ${t ? hm(t.codeFrom) : mockNextSession.accessAvailableFrom} Uhr zur Verfügung.`}
                </p>
              </div>
            )}
            <div className="mt-8 border-t border-primary-foreground/20 pt-5" role="timer" aria-label="Gültigkeit des Zutrittscodes">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-foreground/70">Code-Gültigkeit</p>
              <p className={`mt-2 text-2xl font-light tabular-nums ${keyValid ? "" : "text-primary-foreground/50"}`}>{formatDuration(keyValid ? keyLeft : 0)}</p>
              <div className="mt-3 h-px w-full bg-primary-foreground/20" aria-hidden>
                <div className="h-px bg-primary-foreground transition-[width] duration-1000" style={{ width: `${keyValid ? (keyLeft / KEY_VALID_MS) * 100 : 0}%` }} />
              </div>
              <p className="mt-2 text-xs text-primary-foreground/70">
                {keyValid && myKey ? `Erzeugt um ${hm(new Date(myKey.generatedAt))} Uhr · 1 Stunde gültig` : "Die Gültigkeit beginnt mit dem Erzeugen des Codes."}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 animate-rise">
          <h1 className="max-w-3xl text-5xl leading-[1.05] font-light tracking-tight md:text-7xl">
            Dein nächstes Training wartet.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Du hast aktuell keine kommende Buchung. Wähle einen Zeitraum, der zu dir passt.
          </p>
          <ButtonLink to="/buchen" className="mt-10 w-full sm:w-auto">Training buchen</ButtonLink>
        </section>
      )}

      <section className="mt-16 grid gap-6 sm:grid-cols-2 md:mt-20">
        <Link to="/mitgliedschaft" className="group rounded-2xl bg-secondary p-8 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] transition-colors hover:bg-secondary/80 md:p-10">
          <Eyebrow>Mitgliedschaft</Eyebrow>
          <p className="mt-4 text-2xl font-light md:text-3xl">
            {m.membership.name} <span className="text-muted-foreground">· {m.membership.price}/{m.membership.interval}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Verlängert sich am {m.membership.renewsOn}</p>
        </Link>
        <div className="rounded-2xl bg-card p-8 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-10">
          <Eyebrow>Verfügbare Wocheneinheiten</Eyebrow>
          <p className="mt-4 text-2xl font-light md:text-3xl">
            {unitsLeft === Infinity ? "Unbegrenzt" : `${unitsLeft} von ${weeklyLimit}`} <span className="text-muted-foreground">diese Woche · {m.membership.name}</span>
          </p>
          {weeklyLimit !== Infinity && (
            <div className="mt-4 h-px w-full bg-border">
              <div className="h-px bg-foreground" style={{ width: `${(unitsLeft / weeklyLimit) * 100}%` }} />
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl bg-card p-8 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-10">
          <div className="flex items-baseline justify-between">
            <Eyebrow>Nächste Buchungen</Eyebrow>
          </div>
          <ul className="mt-6 border-t border-border">
            {(booking === "upcoming" ? upcomingList : []).map((b) => (
              <li key={b.id} className="flex items-center justify-between border-b border-border py-5">
                <div>
                  <p className="text-sm">{b.dateLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">{b.location}</p>
                </div>
                <p className="text-sm tabular-nums">{b.time}</p>
              </li>
            ))}
            {booking === "none" && (
              <li className="border-b border-border py-5 text-sm text-muted-foreground">Keine kommenden Buchungen.</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl bg-secondary p-8 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-10">
          <Eyebrow>Schnellaktionen</Eyebrow>
          <ul className="mt-6 border-t border-border">
            {quick.map((q) => (
              <li key={q.to}>
                <Link
                  to={q.to}
                  className="group flex min-h-14 items-center justify-between border-b border-[#3b2a20]/15 text-[0.6875rem] uppercase tracking-[0.2em] transition-colors hover:text-muted-foreground"
                >
                  {q.label}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.25} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MemberShell>
  );
}
