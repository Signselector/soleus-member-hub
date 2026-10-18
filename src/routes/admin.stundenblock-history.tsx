import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarPlus, History as HistoryIcon, Package, Search, TriangleAlert, Trash2 } from "lucide-react";
import { Chip, PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { dayKey, fmtDate, fmtTime, fullName } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/stundenblock-history")({
  head: () => ({ meta: [{ title: "Stundenblock History — SOLEUS Admin" }] }),
  component: History,
});

const quarter = (iso: string) => `${iso.slice(0, 4)}-Q${Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1}`;

function History() {
  const { hourChanges, customers, extensions, removeExtension, extendBlock } = useAdminStore();
  const [tab, setTab] = useState<"ext" | "log">("ext");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [now, setNow] = useState<string | null>(null);
  const [dlg, setDlg] = useState(false);
  const [extCustomer, setExtCustomer] = useState("");
  const [weeks, setWeeks] = useState("1");
  useEffect(() => setNow(dayKey(new Date())), []);

  const cust = (id: string) => customers.find((x) => x.id === id);
  const nm = (id: string) => (cust(id) ? fullName(cust(id)!) : "Unbekannt");
  const match = (id: string) => !q || `${nm(id)} ${cust(id)?.email ?? ""}`.toLowerCase().includes(q.toLowerCase());

  const expired = now ? customers.filter((c) => c.block?.validUntil && c.block.validUntil < now && c.hours > 0) : [];
  const lost = expired.reduce((n, c) => n + c.hours, 0);
  const exts = [...extensions].filter((e) => match(e.customerId)).sort((a, b) => b.at.localeCompare(a.at));
  const log = [...hourChanges].filter((h) => match(h.customerId) && (!kind || h.kind === kind)).sort((a, b) => b.at.localeCompare(a.at));
  const withBlock = customers.filter((c) => c.block);

  const kpis = [
    { icon: TriangleAlert, n: expired.length, label: "Abgelaufene Blöcke", tone: "bg-destructive/10 text-destructive" },
    { icon: Package, n: lost, label: "Verfallene Stunden gesamt", tone: "bg-secondary" },
    { icon: CalendarPlus, n: extensions.length, label: "Verlängerungen", tone: "bg-secondary" },
    { icon: HistoryIcon, n: hourChanges.length, label: "Einträge gesamt", tone: "bg-secondary" },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Planung"
        title="Stundenblock History"
        intro="Verlauf aller Stundenblock-Änderungen und Verlängerungen."
        actions={
          <button type="button" onClick={() => { setExtCustomer(withBlock[0]?.id ?? ""); setWeeks("1"); setDlg(true); }} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">
            <CalendarPlus className="h-4 w-4" strokeWidth={1.5} /> Laufzeit verlängern
          </button>
        }
      />

      <dl className="grid grid-cols-2 gap-y-8 border-y border-border py-8 md:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={cn("flex items-center gap-4", i > 0 && "md:border-l md:border-border md:pl-7")}>
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", k.tone)}><k.icon className="h-4 w-4" strokeWidth={1.5} /></span>
            <div><dd className="text-3xl font-light tabular-nums">{k.n}</dd><dt className="eyebrow mt-1 text-[0.5625rem]">{k.label}</dt></div>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Nach Kundenname suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Suchen" />
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {([["ext", `Verlängerungen (${exts.length})`], ["log", `Verlauf (${log.length})`]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("rounded-full px-5 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors", tab === k ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary")}>{l}</button>
        ))}
      </div>

      {tab === "ext" && (
        <section className="space-y-4">
          <h2 className="eyebrow text-foreground">Laufzeit-Verlängerungen</h2>
          {exts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Verlängerungen.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {["Datum", "Kunde", "Quartal", "Verlängerung", ""].map((h) => <th key={h} className="px-5 py-4 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {exts.map((e) => (
                    <tr key={e.id} className="border-b border-border/70 align-middle last:border-0">
                      <td className="px-5 py-4 whitespace-nowrap tabular-nums">{fmtDate(e.at)} · {fmtTime(e.at)}</td>
                      <td className="px-5 py-4"><p className="font-medium">{nm(e.customerId)}</p><p className="mt-0.5 text-xs text-muted-foreground">{cust(e.customerId)?.email}</p></td>
                      <td className="px-5 py-4"><Chip t="line">{quarter(e.at)}</Chip></td>
                      <td className="px-5 py-4"><Chip t="soft">+{e.weeks} {e.weeks === 1 ? "Woche" : "Wochen"}</Chip></td>
                      <td className="px-5 py-4 text-right">
                        <button type="button" onClick={() => removeExtension(e.id)} className="inline-flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-destructive transition-opacity hover:opacity-70"><Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Entfernen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "log" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="eyebrow text-foreground">Verlauf</h2>
            <select className={cn(selectCls, "h-10 w-48")} value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Art">
              <option value="">Alle Arten</option>
              {["Buchung", "Anpassung", "Verlängerung", "Gutschrift"].map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          {log.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Einträge.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {log.map((h) => {
                const diff = h.to - h.from;
                return (
                  <li key={h.id} className="grid gap-3 py-6 md:grid-cols-[1.2fr_1fr_1.4fr_1fr] md:items-center">
                    <p className="text-lg font-light">{nm(h.customerId)}</p>
                    <p className="tabular-nums">{h.from} h → {h.to} h <span className={cn("ml-2 text-sm", diff < 0 ? "text-muted-foreground" : "text-foreground")}>{diff > 0 ? "+" : ""}{diff} h</span></p>
                    <p className="text-sm text-muted-foreground"><Chip t={h.kind === "Verlängerung" ? "strong" : "soft"} className="mr-3">{h.kind}</Chip>{h.reason}</p>
                    <p className="text-xs text-muted-foreground tabular-nums md:text-right">{fmtDate(h.at)} · {h.at.slice(11)}<br />{h.actor}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <Dialog open={dlg} onOpenChange={setDlg}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Laufzeit verlängern</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">Verschiebt das Ablaufdatum des Coaching-Blocks.</DialogDescription>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (extCustomer) extendBlock(extCustomer, Number(weeks));
              setDlg(false);
            }}
          >
            <label className="block"><span className="eyebrow">Kunde</span>
              <select className={cn(selectCls, "mt-2")} value={extCustomer} onChange={(e) => setExtCustomer(e.target.value)}>
                {withBlock.map((c) => <option key={c.id} value={c.id}>{fullName(c)}</option>)}
              </select>
            </label>
            <label className="block"><span className="eyebrow">Wochen</span><input type="number" min={1} max={52} required className={cn(inputCls, "mt-2")} value={weeks} onChange={(e) => setWeeks(e.target.value)} /></label>
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setDlg(false)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
              <button type="submit" disabled={!extCustomer} className="h-11 rounded-full bg-[#211d1b] px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1] disabled:opacity-50">Verlängern</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
