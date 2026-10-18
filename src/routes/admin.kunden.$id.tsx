import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AccountChip, BookingChip, MandateChip, PageHeader, Section, inputCls } from "@/components/admin/ui";
import { fmtDate, fmtDayShort, fmtEur, fmtRange, fullName, parseLocal } from "@/lib/admin/format";
import { PLAN_INFO, TYPE_LABEL } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/kunden/$id")({
  head: () => ({ meta: [{ title: "Kundendetail — SOLEUS Admin" }] }),
  component: CustomerDetail,
});

const TABS = ["Übersicht", "Mitgliedschaft", "GoCardless", "Buchungen", "Stunden", "Zutritt", "Probleme"] as const;
type Tab = (typeof TABS)[number];

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-border py-4">
      <dt className="eyebrow text-[0.625rem]">{label}</dt>
      <dd className="mt-2 text-sm break-all">{value || "—"}</dd>
    </div>
  );
}

function CustomerDetail() {
  const { id } = Route.useParams();
  const { customers, bookings, hourChanges, adjustHours } = useAdminStore();
  const c = customers.find((x) => x.id === id);
  const [tab, setTab] = useState<Tab>("Übersicht");
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");

  if (!c) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Kunden" title="Nicht gefunden." />
        <Link to="/admin/kunden" className="eyebrow hover:text-foreground">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const plan = PLAN_INFO[c.plan];
  const mine = bookings.filter((b) => b.customerId === c.id).sort((a, b) => b.start.localeCompare(a.start));
  const upcoming = now ? mine.filter((b) => b.status !== "cancelled" && parseLocal(b.start) > now).reverse() : [];
  const past = now ? mine.filter((b) => b.status !== "cancelled" && parseLocal(b.start) <= now) : [];
  const cancelled = mine.filter((b) => b.status === "cancelled");
  const history = hourChanges.filter((h) => h.customerId === c.id).sort((a, b) => b.at.localeCompare(a.at));

  const list = (items: typeof mine, empty: string) =>
    items.length === 0 ? (
      <p className="text-sm text-muted-foreground">{empty}</p>
    ) : (
      <ul className="divide-y divide-border border-y border-border">
        {items.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
            <span className="tabular-nums">{fmtDayShort(b.start)} · {fmtRange(b.start, b.durationMin)}</span>
            <span className="text-muted-foreground">{TYPE_LABEL[b.type]}</span>
            <BookingChip status={b.status} />
          </li>
        ))}
      </ul>
    );

  const submitAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(delta.replace(",", "."));
    if (!n || !reason.trim()) return;
    adjustHours(c.id, n, reason.trim(), "office@soleus.at");
    setDelta("");
    setReason("");
  };

  return (
    <div className="space-y-10">
      <Link to="/admin/kunden" className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Kunden
      </Link>
      <PageHeader
        eyebrow={`Kunde · seit ${fmtDate(c.since)}`}
        title={fullName(c)}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AccountChip status={c.status} />
            <MandateChip status={c.gc.mandate} />
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors",
              tab === t ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Übersicht" && (
        <dl className="grid gap-x-12 md:grid-cols-2">
          <Field label="Name" value={fullName(c)} />
          <Field label="E-Mail" value={c.email} />
          <Field label="Telefon" value={c.phone} />
          <Field label="Mitglied seit" value={fmtDate(c.since)} />
          <Field label="Account Status" value={<AccountChip status={c.status} />} />
          <Field label="Abo" value={`${plan.name} · ${fmtEur(plan.price)} / Monat`} />
        </dl>
      )}

      {tab === "Mitgliedschaft" && (
        <dl className="grid gap-x-12 md:grid-cols-2">
          <Field label="Aktuelles Abo" value={plan.name} />
          <Field label="Preis" value={`${fmtEur(plan.price)} / Monat`} />
          <Field label="Trainingskontingent" value={`${plan.perWeek} pro Woche · ${plan.hoursPerMonth} h / Monat`} />
          <Field label="Startdatum" value={fmtDate(c.startDate)} />
          <Field label="Status" value={<AccountChip status={c.status} />} />
          <div className="py-4 text-xs text-muted-foreground md:col-span-2">Upgrade, Downgrade, Pausieren und Kündigen folgen mit der Backend-Anbindung.</div>
        </dl>
      )}

      {tab === "GoCardless" && (
        <div className="space-y-6">
          <dl className="grid gap-x-12 md:grid-cols-2">
            <Field label="Customer ID" value={c.gc.customerId} />
            <Field label="Mandate ID" value={c.gc.mandateId} />
            <Field label="Subscription ID" value={c.gc.subscriptionId} />
            <Field label="Mandate Status" value={<MandateChip status={c.gc.mandate} />} />
            <Field label="Payment Status" value={{ paid: "Bezahlt", pending: "Ausstehend", failed: "Fehlgeschlagen", none: "—" }[c.gc.payment]} />
          </dl>
          <p className="rounded-2xl bg-secondary px-6 py-4 text-sm text-muted-foreground">
            Nur Ansicht. Bestehende Mandate werden nie ungeprüft gelöscht oder neu erstellt, sie müssen bei der Migration weiter verwendbar bleiben.
          </p>
        </div>
      )}

      {tab === "Buchungen" && (
        <div className="space-y-10">
          <Section title="Kommend">{list(upcoming, "Keine kommenden Buchungen.")}</Section>
          <Section title="Vergangen">{list(past, "Keine vergangenen Buchungen.")}</Section>
          <Section title="Storniert">{list(cancelled, "Keine stornierten Buchungen.")}</Section>
        </div>
      )}

      {tab === "Stunden" && (
        <div className="space-y-10">
          <div>
            <p className="eyebrow text-[0.625rem]">Aktueller Bestand</p>
            <p className="mt-3 text-6xl font-light tabular-nums">{c.hours}<span className="ml-2 text-2xl text-muted-foreground">/ {c.hoursTotal} h</span></p>
          </div>
          <Section title="Manuelle Anpassung">
            <form onSubmit={submitAdjust} className="grid gap-3 md:grid-cols-[8rem_1fr_auto]">
              <input className={inputCls} inputMode="decimal" placeholder="z. B. -1 oder 2" value={delta} onChange={(e) => setDelta(e.target.value)} aria-label="Änderung in Stunden" required />
              <input className={inputCls} placeholder="Grund (Pflicht)" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Grund" required />
              <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Buchen</button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">Jede Anpassung erzeugt einen eigenen History-Eintrag. Es wird nichts überschrieben.</p>
          </Section>
          <Section title="History">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Änderungen.</p>
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {history.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                    <div>
                      <p className="tabular-nums">{h.from} h → {h.to} h <span className="text-muted-foreground">({h.to - h.from > 0 ? "+" : ""}{h.to - h.from} h)</span></p>
                      <p className="mt-1 text-xs text-muted-foreground">{h.reason}</p>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums">{fmtDate(h.at)} · {h.at.slice(11)} · {h.actor}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}

      {tab === "Zutritt" && <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Zutrittsereignisse folgen mit der Lock-API-Anbindung.</p>}
      {tab === "Probleme" && <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Schadensmeldungen, Wartezeiten und Supportfälle folgen.</p>}
    </div>
  );
}
