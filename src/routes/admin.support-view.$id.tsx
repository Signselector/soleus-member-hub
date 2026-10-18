import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, KeyRound, TriangleAlert } from "lucide-react";
import { AccountChip, BookingChip, Chip, PageHeader, Section, inputCls } from "@/components/admin/ui";
import { fmtDate, fmtDayShort, fmtEur, fmtRange, fullName, parseLocal } from "@/lib/admin/format";
import { PLAN_INFO, TYPE_LABEL } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";
import { issuesOf } from "./admin.support-view.index";

export const Route = createFileRoute("/admin/support-view/$id")({
  head: () => ({ meta: [{ title: "Kunden-Dashboard — SOLEUS Admin" }] }),
  component: SupportCustomer,
});

function SupportCustomer() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { customers, bookings, impersonating, startImpersonation, endImpersonation, adjustHours, setNextDebit, setStatus } = useAdminStore();
  const c = customers.find((x) => x.id === id);
  const [now, setNow] = useState<Date | null>(null);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [debit, setDebit] = useState("");
  useEffect(() => setNow(new Date()), []);

  if (!c) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Support View" title="Kunde nicht gefunden." />
        <Link to="/admin/support-view" className="eyebrow hover:text-foreground">Zurück</Link>
      </div>
    );
  }
  if (impersonating !== id) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Support View" title={fullName(c)} intro="Die Kundenansicht ist noch nicht gestartet." />
        <button type="button" onClick={() => startImpersonation(id)} className="h-12 rounded-full bg-[#211d1b] px-8 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Kunden-Dashboard ansehen</button>
      </div>
    );
  }

  const mine = bookings.filter((b) => b.customerId === c.id && b.status !== "cancelled");
  const upcoming = now ? mine.filter((b) => parseLocal(b.start) > now).sort((a, b) => a.start.localeCompare(b.start)) : [];
  const next = upcoming[0];
  const plan = PLAN_INFO[c.plan];
  const issues = issuesOf(c);
  const done = () => {
    endImpersonation();
    navigate({ to: "/admin/support-view" });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/admin/support-view" onClick={endImpersonation} className="eyebrow inline-flex items-center gap-2 hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Support View</Link>
        <Link to="/admin/kunden/$id" params={{ id: c.id }} className="eyebrow inline-flex items-center gap-2 hover:text-foreground">Kundendetail öffnen <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} /></Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#211d1b] px-6 py-5 text-[#f7f5f1]">
        <div>
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.3em] text-[#f7f5f1]/70">Impersonation aktiv</p>
          <p className="mt-2 text-lg font-light">Du siehst das Dashboard von <span className="font-medium">{fullName(c)}</span></p>
        </div>
        <button type="button" onClick={done} className="h-10 rounded-full bg-[#e8dfcd] px-6 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[#3b2a20]">Beenden</button>
      </div>

      {/* Mirror of the member home screen */}
      <section aria-label="Kunden-Dashboard" className="rounded-2xl border border-border bg-background p-6 md:p-10">
        <p className="eyebrow">Hallo, {c.firstName}</p>
        {next ? (
          <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow">Nächste Session</p>
              <h2 className="mt-3 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">{fmtDayShort(next.start)}<br /><span className="text-muted-foreground">{fmtRange(next.start, next.durationMin)}</span></h2>
              <p className="mt-4 text-sm uppercase tracking-[0.2em]">{TYPE_LABEL[next.type]}</p>
            </div>
            <div className="rounded-2xl bg-primary p-6 text-primary-foreground">
              <p className="eyebrow text-primary-foreground/75">Zutritt</p>
              <KeyRound className="mt-4 h-4 w-4 text-primary-foreground/75" strokeWidth={1.25} />
              <p className="mt-6 text-sm text-primary-foreground/80">Der Zutrittscode wird dem Kunden vor der Session angezeigt.</p>
            </div>
          </div>
        ) : (
          <h2 className="mt-6 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">Dein nächstes Training wartet.</h2>
        )}
        <div className="mt-10 grid border-t border-border sm:grid-cols-2">
          <div className="border-b border-border py-6 sm:border-r sm:pr-8">
            <p className="eyebrow">Mitgliedschaft</p>
            <p className="mt-3 text-2xl font-light">{plan.name} <span className="text-muted-foreground">· {fmtEur(plan.price)}/Monat</span></p>
            <p className="mt-1 text-sm text-muted-foreground">{c.nextDebit ? `Nächste Abbuchung am ${fmtDate(c.nextDebit)}` : "Keine Abbuchung geplant"}</p>
          </div>
          <div className="border-b border-border py-6 sm:pl-8">
            <p className="eyebrow">Verfügbare Einheiten</p>
            <p className="mt-3 text-2xl font-light">{c.hours} Stunden <span className="text-muted-foreground">verfügbar</span></p>
            <div className="mt-3 h-px w-full bg-border"><div className="h-px bg-foreground" style={{ width: `${c.hoursTotal ? Math.min(100, (c.hours / c.hoursTotal) * 100) : 0}%` }} /></div>
          </div>
        </div>
        <div className="mt-8">
          <p className="eyebrow">Nächste Buchungen</p>
          {upcoming.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Keine kommenden Buchungen.</p> : (
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {upcoming.slice(0, 4).map((b) => (
                <li key={b.id} className="flex items-center justify-between py-4 text-sm"><span>{fmtDayShort(b.start)} <span className="ml-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">{TYPE_LABEL[b.type]}</span></span><span className="tabular-nums">{fmtRange(b.start, b.durationMin)}</span></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Section title="Zustand">
        <div className="flex flex-wrap items-center gap-2"><AccountChip status={c.status} /><Chip t="soft">{plan.name}</Chip><Chip t={c.gc.mandate === "failed" ? "alert" : "muted"}>{{ active: "Mandat aktiv", pending: "Mandat offen", failed: "Zahlung fehlgeschlagen", none: "Kein Mandat" }[c.gc.mandate]}</Chip></div>
        {issues.length > 0 ? (
          <ul className="mt-5 space-y-2">{issues.map((i) => <li key={i} className="flex items-center gap-2 text-sm"><TriangleAlert className="h-4 w-4 text-destructive" strokeWidth={1.5} />{i}</li>)}</ul>
        ) : <p className="mt-5 text-sm text-muted-foreground">Keine Auffälligkeiten.</p>}
      </Section>

      <Section title="Probleme beheben">
        <div className="grid gap-10 lg:grid-cols-2">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(delta.replace(",", "."));
              if (!n || !reason.trim()) return;
              adjustHours(c.id, n, reason.trim());
              setDelta("");
              setReason("");
            }}
          >
            <p className="text-sm font-medium">Stunden gutschreiben / abziehen</p>
            <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
              <input className={inputCls} inputMode="decimal" placeholder="z. B. 1" value={delta} onChange={(e) => setDelta(e.target.value)} aria-label="Änderung in Stunden" required />
              <input className={inputCls} placeholder="Grund (Pflicht)" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Grund" required />
            </div>
            <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Buchen</button>
          </form>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (debit) setNextDebit(c.id, debit);
              setDebit("");
            }}
          >
            <p className="text-sm font-medium">Abbuchung verschieben</p>
            <input type="date" className={inputCls} value={debit} onChange={(e) => setDebit(e.target.value)} aria-label="Neues Abbuchungsdatum" required disabled={!c.gc.subscriptionId} />
            <button type="submit" disabled={!c.gc.subscriptionId} className="h-11 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1] disabled:opacity-40">Verschieben</button>
            {!c.gc.subscriptionId && <p className="text-xs text-muted-foreground">Kein GoCardless-Abo vorhanden.</p>}
          </form>
        </div>

        <div className="mt-10">
          <p className="text-sm font-medium">Kommende Buchungen verwalten</p>
          {upcoming.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Keine kommenden Buchungen.</p> : (
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {upcoming.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-sm">
                  <span className="tabular-nums">{fmtDayShort(b.start)} · {fmtRange(b.start, b.durationMin)}</span>
                  <span className="flex items-center gap-4"><BookingChip status={b.status} /><button type="button" onClick={() => setStatus(b.id, "cancelled")} className={cn("eyebrow text-destructive hover:opacity-70")}>Stornieren</button></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </div>
  );
}
