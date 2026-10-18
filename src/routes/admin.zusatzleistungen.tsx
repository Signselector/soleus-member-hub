import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Chip, PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { fmtDate, fmtEur, fmtTime, fullName } from "@/lib/admin/format";
import type { AddonStatus } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/zusatzleistungen")({
  head: () => ({ meta: [{ title: "Zusatzleistungen — SOLEUS Admin" }] }),
  component: Addons,
});

const LABEL: Record<AddonStatus, string> = { pending: "Ausstehend", approved: "Genehmigt", done: "Erledigt", rejected: "Abgelehnt" };
const TONE: Record<AddonStatus, "muted" | "soft" | "strong" | "alert"> = { pending: "muted", approved: "soft", done: "strong", rejected: "alert" };

function Addons() {
  const { addons, customers, setAddonStatus } = useAdminStore();
  const years = useMemo(() => [...new Set(addons.map((a) => a.at.slice(0, 4)))].sort().reverse(), [addons]);
  const [year, setYear] = useState<string>(years[0] ?? "all");
  const [q, setQ] = useState("");
  const who = (id: string) => customers.find((x) => x.id === id);

  const rows = addons
    .filter((a) => year === "all" || a.at.startsWith(year))
    .filter((a) => {
      if (!q) return true;
      const c = who(a.customerId);
      return `${c ? fullName(c) : ""} ${c?.email ?? ""} ${a.label}`.toLowerCase().includes(q.toLowerCase());
    })
    .sort((a, b) => b.at.localeCompare(a.at));

  const count = (s: AddonStatus) => rows.filter((a) => a.status === s).length;
  const revenueRows = rows.filter((a) => a.status === "approved" || a.status === "done");
  const revenue = revenueRows.reduce((n, a) => n + a.price, 0);
  const byLabel = [...new Set(revenueRows.map((a) => a.label))].map((l) => {
    const m = revenueRows.filter((a) => a.label === l);
    return { label: l, n: m.length, sum: m.reduce((n, a) => n + a.price, 0) };
  });
  const yl = year === "all" ? "gesamt" : year;

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Management" title="Zusatzleistungen" intro="Übersicht aller gebuchten Zusatzleistungen mit Jahresfilter." />

      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Kunde oder Leistung suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Suchen" />
        </label>
        <select className={selectCls} value={year} onChange={(e) => setYear(e.target.value)} aria-label="Jahr">
          <option value="all">Alle Jahre</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <dl className="grid grid-cols-2 gap-y-8 border-y border-border py-8 md:grid-cols-5">
        {[
          [`Gesamt ${yl}`, rows.length],
          ["Genehmigt", count("approved")],
          ["Erledigt", count("done")],
          ["Ausstehend", count("pending")],
          [`Umsatz ${yl}`, fmtEur(revenue)],
        ].map(([k, v], i) => (
          <div key={String(k)} className={i > 0 ? "md:border-l md:border-border md:pl-7" : ""}>
            <dt className="eyebrow text-[0.625rem]">{k}</dt>
            <dd className="mt-3 text-4xl font-light tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="eyebrow text-foreground">Aufschlüsselung nach Leistung</h2>
        {byLabel.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Noch keine genehmigten Leistungen.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {byLabel.map((l) => (
              <li key={l.label} className="flex items-center justify-between gap-4 py-4 text-sm">
                <span>{l.label} <span className="text-muted-foreground">· {l.n}× gebucht</span></span>
                <span className="tabular-nums">{fmtEur(l.sum)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="eyebrow text-foreground">Zusatzleistungen {yl} ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Zusatzleistungen in diesem Zeitraum.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {["Kunde", "Leistung", "Quelle", "Status", "Preis", "Datum", "Beleg", "Aktionen"].map((h) => (
                    <th key={h} className="px-4 py-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const c = who(a.customerId);
                  return (
                    <tr key={a.id} className="border-b border-border/70 align-middle last:border-0">
                      <td className="px-4 py-4"><p className="font-medium">{c ? fullName(c) : "Unbekannt"}</p>{c && <p className="mt-1 text-xs text-muted-foreground">{c.email}</p>}</td>
                      <td className="px-4 py-4">{a.label}</td>
                      <td className="px-4 py-4 text-muted-foreground">{a.source}</td>
                      <td className="px-4 py-4"><Chip t={TONE[a.status]}>{LABEL[a.status]}</Chip></td>
                      <td className="px-4 py-4 whitespace-nowrap tabular-nums">{fmtEur(a.price)}</td>
                      <td className="px-4 py-4 whitespace-nowrap tabular-nums text-muted-foreground">{fmtDate(a.at)} · {fmtTime(a.at)}</td>
                      <td className="px-4 py-4 text-muted-foreground">—</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {a.status === "pending" && (
                            <>
                              <button type="button" onClick={() => setAddonStatus(a.id, "approved")} className="h-9 rounded-full bg-[#211d1b] px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] text-[#f7f5f1]">Genehmigen</button>
                              <button type="button" onClick={() => setAddonStatus(a.id, "rejected")} className="h-9 rounded-full border border-foreground/15 px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] hover:bg-secondary">Ablehnen</button>
                            </>
                          )}
                          {a.status === "approved" && (
                            <button type="button" onClick={() => setAddonStatus(a.id, "done")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/15 px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] hover:bg-secondary"><Check className="h-3.5 w-3.5" /> Erledigt</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
