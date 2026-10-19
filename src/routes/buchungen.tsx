import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MemberShell } from "@/components/layout/MemberShell";
import { ButtonLink, Eyebrow } from "@/components/ui-soleus/primitives";
import { MIN_HOURS_BEFORE } from "@/lib/booking-rules";
import { cancelMemberBooking, useMemberBookings } from "@/lib/member-bookings";

export const Route = createFileRoute("/buchungen")({
  head: () => ({
    meta: [
      { title: "Meine Buchungen — SOLEUS" },
      { name: "description", content: "Alle kommenden und vergangenen Sessions." },
      { property: "og:title", content: "Meine Buchungen — SOLEUS" },
      { property: "og:description", content: "Alle kommenden und vergangenen Sessions." },
    ],
  }),
  component: Page,
});

const pad = (n: number) => String(n).padStart(2, "0");
const parse = (iso: string) => new Date(iso);
const label = (iso: string) => parse(iso).toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "long" });
const range = (iso: string) => { const h = parse(iso).getHours(); return `${pad(h)}:00 — ${pad(h + 1)}:00`; };

function Page() {
  const mine = useMemberBookings();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const upcoming = now ? mine.filter((b) => parse(b.start) > now) : [];
  const past = now ? mine.filter((b) => parse(b.start) <= now).reverse() : [];

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const canCancel = (iso: string) => !!now && (parse(iso).getTime() - now.getTime()) / 3_600_000 >= MIN_HOURS_BEFORE;

  const List = ({ items, cancellable }: { items: typeof mine; cancellable?: boolean }) => (
    <ul className="mt-6 border-t border-border">
      {items.map((b) => (
        <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5">
          <div>
            <p className="text-sm">{label(b.start)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">Private Gym</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-sm tabular-nums">{range(b.start)}</p>
            {cancellable &&
              (confirmId === b.id ? (
                <span className="flex items-center gap-4 text-[0.6875rem] font-bold uppercase tracking-[0.18em]">
                  <button type="button" onClick={() => { cancelMemberBooking(b.id); setConfirmId(null); }} className="underline underline-offset-4">Ja, stornieren</button>
                  <button type="button" onClick={() => setConfirmId(null)} className="text-muted-foreground">Abbrechen</button>
                </span>
              ) : canCancel(b.start) ? (
                <button type="button" onClick={() => setConfirmId(b.id)} className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] underline underline-offset-4 hover:text-muted-foreground">Stornieren</button>
              ) : (
                <span className="text-xs text-muted-foreground">Stornierung nicht mehr möglich</span>
              ))}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <MemberShell>
      <div className="max-w-3xl animate-rise">
        <Eyebrow>Buchungen</Eyebrow>
        <h1 className="mt-4 text-4xl leading-[1.05] font-light tracking-tight md:text-6xl">Meine Buchungen.</h1>
      </div>
      <section className="mt-14">
        <Eyebrow>Kommend</Eyebrow>
        <p className="mt-2 text-xs text-muted-foreground">Stornieren ist bis {MIN_HOURS_BEFORE} Stunden vor Beginn möglich.</p>
        {upcoming.length === 0 ? (
          <div className="mt-6 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">Keine kommenden Buchungen.</p>
            <ButtonLink to="/buchen" className="mt-6">Training buchen</ButtonLink>
          </div>
        ) : <List items={upcoming} cancellable />}
      </section>
      {past.length > 0 && (
        <section className="mt-16">
          <Eyebrow>Vergangen</Eyebrow>
          <List items={past} />
        </section>
      )}
      <p className="mt-12 text-xs text-muted-foreground"><Link to="/buchen" className="underline underline-offset-4">Neue Session buchen</Link></p>
    </MemberShell>
  );
}
