import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AccountChip, MandateChip, PageHeader, PaymentChip, Section, selectCls } from "@/components/admin/ui";
import { fmtEur, fullName } from "@/lib/admin/format";
import { PLAN_INFO, type PlanId } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/abos")({
  head: () => ({ meta: [{ title: "Abos — SOLEUS Admin" }] }),
  component: Plans,
});

const PLAN_ORDER: PlanId[] = ["standard", "plus", "premium", "unlimited"];

function Plans() {
  const { customers } = useAdminStore();
  const [pay, setPay] = useState<"" | "paid" | "pending" | "failed" | "none">("");
  const subs = customers.filter((c) => !pay || c.gc.payment === pay);
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Management" title="Abos" intro="Übersicht aller Abonnements mit Coaching-Blöcken und Zahlungsstatus." />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const p = PLAN_INFO[id];
          const list = customers.filter((c) => c.plan === id && c.status !== "cancelled");
          const issues = list.filter((c) => c.gc.mandate === "failed" || c.gc.mandate === "pending").length;
          const dark = id === "plus";
          return (
            <div key={id} className={dark ? "rounded-2xl bg-[#211d1b] p-7 text-[#f7f5f1] shadow-[0_18px_40px_-18px_rgba(33,29,27,0.45)]" : "rounded-2xl bg-card p-7 shadow-[0_18px_40px_-22px_rgba(33,29,27,0.3)]"}>
              <p className={dark ? "eyebrow text-[#f7f5f1]/70" : "eyebrow"}>{p.perWeek} pro Woche</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight">{p.name}</h2>
              <p className="mt-5 whitespace-nowrap text-3xl font-light tabular-nums 2xl:text-4xl">{fmtEur(p.price)}<span className={dark ? "ml-2 text-sm text-[#f7f5f1]/70" : "ml-2 text-sm text-muted-foreground"}>/ Monat</span></p>
              <dl className={dark ? "mt-7 divide-y divide-white/15 border-y border-white/15 text-sm" : "mt-7 divide-y divide-border border-y border-border text-sm"}>
                <div className="flex justify-between py-3"><dt className="opacity-70">Kontingent</dt><dd className="tabular-nums">{p.hoursPerMonth} h / Monat</dd></div>
                <div className="flex justify-between py-3"><dt className="opacity-70">Aktive Kunden</dt><dd className="tabular-nums">{list.length}</dd></div>
                <div className="flex justify-between py-3"><dt className="opacity-70">GoCardless offen</dt><dd className="tabular-nums">{issues}</dd></div>
              </dl>
            </div>
          );
        })}
      </div>

      <Section
        title="Abonnements"
        aside={
          <select className={cn(selectCls, "h-9 w-48")} value={pay} onChange={(e) => setPay(e.target.value as typeof pay)} aria-label="Zahlungsstatus">
            <option value="">Alle Zahlungsstatus</option>
            <option value="paid">Bezahlt</option>
            <option value="pending">Ausstehend</option>
            <option value="failed">Fehlgeschlagen</option>
            <option value="none">Kein Mandat</option>
          </select>
        }
      >
        {subs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Abonnements für diese Auswahl.</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {subs.map((c) => (
              <li key={c.id} className="grid gap-3 py-5 md:grid-cols-[1.4fr_1fr_1.6fr_1fr_1fr] md:items-center">
                <Link to="/admin/kunden/$id" params={{ id: c.id }} className="text-sm font-medium underline-offset-4 hover:underline">{fullName(c)}</Link>
                <p className="text-sm">{PLAN_INFO[c.plan].name}</p>
                <div>
                  <p className="text-xs tabular-nums text-muted-foreground">Coaching-Block · {c.hours} / {c.hoursTotal} h</p>
                  <div className="mt-2 h-px w-full bg-border"><div className="h-px bg-foreground" style={{ width: `${c.hoursTotal ? Math.min(100, (c.hours / c.hoursTotal) * 100) : 0}%` }} /></div>
                </div>
                <div><PaymentChip status={c.gc.payment} /></div>
                <div className="flex flex-wrap gap-2"><AccountChip status={c.status} /><MandateChip status={c.gc.mandate} /></div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Aktionen">
        <div className="flex flex-wrap gap-3">
          {["Upgrade", "Downgrade", "Pausieren", "Kündigen"].map((a) => (
            <button key={a} type="button" disabled title="Folgt mit der Backend-Anbindung" className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] opacity-50">
              {a}
            </button>
          ))}
        </div>
        <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">
          Abo-Änderungen werden erst mit der Backend-Anbindung freigeschaltet. GoCardless-Mandate werden dabei nie ungeprüft gelöscht oder neu erstellt.
        </p>
      </Section>
    </div>
  );
}
