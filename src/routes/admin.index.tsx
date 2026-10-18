import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { BookingChip, PageHeader, Section } from "@/components/admin/ui";
import { fmtDateLong, fmtRange, fullName, parseLocal } from "@/lib/admin/format";
import { SEED_KPIS, TYPE_LABEL } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — SOLEUS Admin" }] }),
  component: Dashboard,
});

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function Dashboard() {
  const { bookings, customers } = useAdminStore();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;

  const who = (id: string) => customers.find((c) => c.id === id);
  const live = bookings.filter((b) => b.status !== "cancelled");
  const todays = live.filter((b) => sameDay(parseLocal(b.start), now)).sort((a, b) => a.start.localeCompare(b.start));
  const end = (b: { start: string; durationMin: number }) => new Date(parseLocal(b.start).getTime() + b.durationMin * 60000);
  const current = todays.find((b) => parseLocal(b.start) <= now && end(b) > now);
  const next = live.filter((b) => parseLocal(b.start) > now).sort((a, b) => a.start.localeCompare(b.start))[0];

  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
  const inWeek = live.filter((b) => parseLocal(b.start) >= weekStart && parseLocal(b.start) < weekEnd).length;
  const inMonth = live.filter((b) => {
    const d = parseLocal(b.start);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const problems = [
    ...customers.filter((c) => c.gc.mandate === "failed").map((c) => ({ key: `m${c.id}`, text: `${fullName(c)} · GoCardless-Zahlung fehlgeschlagen`, to: `/admin/kunden/${c.id}` })),
    ...bookings.filter((b) => b.status === "overrun" || b.status === "no_show").slice(0, 3).map((b) => ({ key: b.id, text: `${who(b.customerId) ? fullName(who(b.customerId)!) : "Unbekannt"} · ${b.status === "overrun" ? "Überziehung" : "No Show"}`, to: "/admin/buchungen" })),
  ];

  const kpis = [
    { label: "Gesamte Buchungen", value: SEED_KPIS.totalBookings, hint: "Buchungen insgesamt" },
    { label: "Private Gym", value: SEED_KPIS.privateGym, hint: "Eigentraining Sessions" },
    { label: "Premium Training", value: SEED_KPIS.premium, hint: "Einzeltrainings" },
    { label: "Standard Training", value: SEED_KPIS.standard, hint: "Gruppentrainings" },
    { label: "Mitglieder", value: SEED_KPIS.customers, hint: "Registrierte Benutzer" },
  ];

  return (
    <div className="space-y-14">
      <PageHeader eyebrow="Admin Overview" title="Heute" intro={fmtDateLong(now)} />

      <section className="grid gap-px overflow-hidden rounded-2xl bg-white/10 text-[#f7f5f1] shadow-[0_18px_40px_-18px_rgba(33,29,27,0.4)] md:grid-cols-3">
        {[
          { eyebrow: "Aktuelle Session", b: current },
          { eyebrow: "Nächste Session", b: next },
        ].map(({ eyebrow, b }) => (
          <div key={eyebrow} className="bg-[#211d1b] p-7 md:p-9">
            <p className="eyebrow text-[#f7f5f1]/65">{eyebrow}</p>
            {b ? (
              <>
                <p className="mt-6 text-3xl font-light tracking-tight md:text-4xl">{fmtRange(b.start, b.durationMin)}</p>
                <p className="mt-3 text-sm text-[#f7f5f1]/80">{who(b.customerId) ? fullName(who(b.customerId)!) : "—"}</p>
                <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.2em] text-[#f7f5f1]/60">{TYPE_LABEL[b.type]}</p>
              </>
            ) : (
              <p className="mt-6 text-2xl font-light text-[#f7f5f1]/60">{eyebrow === "Aktuelle Session" ? "Gerade keine Session." : "Keine kommende Session."}</p>
            )}
          </div>
        ))}
        <div className="bg-[#211d1b] p-7 md:p-9">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="eyebrow text-[#f7f5f1]/65">Heute</p>
              <p className="mt-6 text-5xl font-light tabular-nums">{todays.length}</p>
              <p className="mt-2 text-xs text-[#f7f5f1]/65">Buchungen</p>
            </div>
            <div>
              <p className="eyebrow text-[#f7f5f1]/65">Offen</p>
              <p className="mt-6 text-5xl font-light tabular-nums">{problems.length}</p>
              <p className="mt-2 text-xs text-[#f7f5f1]/65">Probleme</p>
            </div>
          </div>
        </div>
      </section>

      <Section title="Performance">
        <dl className="grid grid-cols-2 gap-y-10 md:grid-cols-5">
          {kpis.map((k, i) => (
            <div key={k.label} className={i > 0 ? "md:border-l md:border-border md:pl-7" : ""}>
              <dt className="eyebrow text-[0.625rem]">{k.label}</dt>
              <dd className="mt-4 text-5xl font-light tracking-tight tabular-nums">{k.value}</dd>
              <p className="mt-2 text-xs text-muted-foreground">{k.hint}</p>
            </div>
          ))}
        </dl>
        <div className="mt-12 grid gap-10 border-t border-border pt-8 sm:grid-cols-2">
          <div>
            <p className="eyebrow text-[0.625rem]">Diese Woche</p>
            <p className="mt-3 text-4xl font-light tabular-nums">{inWeek}</p>
            <p className="mt-1 text-xs text-muted-foreground">Buchungen diese Woche</p>
          </div>
          <div>
            <p className="eyebrow text-[0.625rem]">Dieser Monat</p>
            <p className="mt-3 text-4xl font-light tabular-nums">{inMonth}</p>
            <p className="mt-1 text-xs text-muted-foreground">Buchungen diesen Monat</p>
          </div>
        </div>
        <div className="mt-10 rounded-2xl border border-dashed border-border px-6 py-8 text-sm font-light text-muted-foreground">
          Trends und Charts werden hier später ergänzt.
        </div>
      </Section>

      <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Heutige Buchungen" aside={<Link to="/admin/buchungen" className="eyebrow inline-flex items-center gap-1 hover:text-foreground">Alle <ArrowUpRight className="h-3 w-3" /></Link>}>
          {todays.length === 0 ? (
            <p className="text-sm text-muted-foreground">Heute keine Buchungen.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {todays.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium">{who(b.customerId) ? fullName(who(b.customerId)!) : "—"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{TYPE_LABEL[b.type]}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm tabular-nums">{fmtRange(b.start, b.durationMin)}</span>
                    <BookingChip status={b.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Offene Probleme">
          {problems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine offenen Probleme.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {problems.map((p) => (
                <li key={p.key}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link to={p.to as any} className="flex items-center justify-between gap-4 py-4 text-sm transition-colors hover:text-muted-foreground">
                    {p.text} <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
