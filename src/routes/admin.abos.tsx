import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Check, Search } from "lucide-react";
import { AccountChip, Chip, PageHeader, PaymentChip, Section, inputCls, selectCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { dayKey, fmtDate, fmtEur, fullName } from "@/lib/admin/format";
import { PLAN_INFO, type AdminCustomer, type PlanId } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/abos")({
  head: () => ({ meta: [{ title: "Abos — SOLEUS Admin" }] }),
  component: Plans,
});

const PLAN_ORDER: PlanId[] = ["standard", "plus", "premium", "unlimited"];
const FAMILY_PRICE = 15;
const dash = <span className="text-muted-foreground">—</span>;
const short = (id: string | null) => (id ? id.slice(-6) : null);

function Plans() {
  const { customers, setNextDebit } = useAdminStore();
  const [q, setQ] = useState("");
  const [pay, setPay] = useState<"" | "paid" | "pending" | "failed" | "none">("");
  const [move, setMove] = useState<AdminCustomer | null>(null);
  const [date, setDate] = useState("");

  const subs = customers.filter(
    (c) => (!pay || c.gc.payment === pay) && (!q || `${fullName(c)} ${c.email}`.toLowerCase().includes(q.toLowerCase())),
  );
  const price = (c: AdminCustomer) => PLAN_INFO[c.plan].price + (c.family ? FAMILY_PRICE : 0);

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

      <Section title={`Abos (${subs.length})`}>
        <div className="mb-6 grid gap-3 md:grid-cols-[2fr_1fr]">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <input className={cn(inputCls, "pl-11")} placeholder="Kunde suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kunde suchen" />
          </label>
          <select className={selectCls} value={pay} onChange={(e) => setPay(e.target.value as typeof pay)} aria-label="Zahlungsstatus">
            <option value="">Alle Zahlungsstatus</option>
            <option value="paid">Bezahlt</option>
            <option value="pending">Ausstehend</option>
            <option value="failed">Fehlgeschlagen</option>
            <option value="none">Kein Mandat</option>
          </select>
        </div>

        {subs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Abos gefunden.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card xl:block">
              <table className="w-full min-w-[1150px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {["Kunde", "Abo-Typ", "Status", "Coaching-Block", "Zahlungen", "Aktiv seit", "Preis/Monat", "SEPA Mandat", "Subscription", "Aktion"].map((h) => (
                      <th key={h} className="px-4 py-4 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((c) => (
                    <tr key={c.id} className="border-b border-border/70 align-middle last:border-0 hover:bg-secondary/50">
                      <td className="px-4 py-4">
                        <Link to="/admin/kunden/$id" params={{ id: c.id }} className="font-medium underline-offset-4 hover:underline">{fullName(c)}</Link>
                        <p className="mt-1 text-xs text-muted-foreground">{c.email}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap"><Chip t="line">{PLAN_INFO[c.plan].name}</Chip>{c.family && <Chip t="soft" className="ml-2">Family</Chip>}</td>
                      <td className="px-4 py-4"><AccountChip status={c.status} /></td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {c.block && c.hoursTotal > 0 ? (<><p>{c.block.label}</p><p className="mt-1 text-xs tabular-nums text-muted-foreground">{c.hours}/{c.hoursTotal} übrig</p></>) : dash}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {c.blockPayment ? (<span className="tabular-nums">{fmtEur(c.blockPayment.amount)} <Chip t={c.blockPayment.status === "Ausgezahlt" ? "soft" : "muted"} className="ml-1">{c.blockPayment.status}</Chip></span>) : dash}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap tabular-nums">{fmtDate(c.startDate)}</td>
                      <td className="px-4 py-4 whitespace-nowrap tabular-nums">{fmtEur(price(c))}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{c.gc.mandateId ? <span className="inline-flex items-center gap-1.5 font-mono text-xs"><Check className="h-3.5 w-3.5" />{short(c.gc.mandateId)}</span> : dash}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{c.gc.subscriptionId ? <span className="inline-flex items-center gap-1.5 font-mono text-xs"><Check className="h-3.5 w-3.5" />{short(c.gc.subscriptionId)}</span> : dash}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={!c.gc.subscriptionId || c.status === "cancelled"}
                          onClick={() => { setMove(c); setDate(c.nextDebit ?? ""); }}
                          className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-foreground/15 px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] transition-colors enabled:hover:bg-secondary disabled:opacity-40"
                        >
                          <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.5} /> Abbuchung verschieben
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 xl:hidden">
              {subs.map((c) => (
                <li key={c.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to="/admin/kunden/$id" params={{ id: c.id }} className="font-medium underline-offset-4 hover:underline">{fullName(c)}</Link>
                      <p className="mt-1 text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <AccountChip status={c.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="eyebrow text-[0.5625rem]">Abo</dt><dd className="mt-1">{PLAN_INFO[c.plan].name}{c.family && " + Family"}</dd></div>
                    <div><dt className="eyebrow text-[0.5625rem]">Preis/Monat</dt><dd className="mt-1 tabular-nums">{fmtEur(price(c))}</dd></div>
                    <div><dt className="eyebrow text-[0.5625rem]">Coaching-Block</dt><dd className="mt-1">{c.block && c.hoursTotal > 0 ? `${c.block.label} · ${c.hours}/${c.hoursTotal}` : "—"}</dd></div>
                    <div><dt className="eyebrow text-[0.5625rem]">Zahlung</dt><dd className="mt-1"><PaymentChip status={c.gc.payment} /></dd></div>
                  </dl>
                  <button type="button" disabled={!c.gc.subscriptionId || c.status === "cancelled"} onClick={() => { setMove(c); setDate(c.nextDebit ?? ""); }} className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-foreground/15 px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] disabled:opacity-40">
                    <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.5} /> Abbuchung verschieben
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-6 max-w-xl text-xs leading-relaxed text-muted-foreground">
          Upgrade, Downgrade, Pausieren und Kündigen folgen mit der Backend-Anbindung. GoCardless-Mandate werden dabei nie ungeprüft gelöscht oder neu erstellt.
        </p>
      </Section>

      <Dialog open={!!move} onOpenChange={(o) => !o && setMove(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Abbuchung verschieben</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {move && `${fullName(move)} · aktuell ${move.nextDebit ? fmtDate(move.nextDebit) : "kein Termin hinterlegt"}.`}
          </DialogDescription>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (move && date) setNextDebit(move.id, date);
              setMove(null);
            }}
          >
            <label className="block"><span className="eyebrow">Neues Abbuchungsdatum</span>
              <input type="date" required min={dayKey(new Date())} className={cn(inputCls, "mt-2")} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setMove(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
              <button type="submit" className="h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Verschieben</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
