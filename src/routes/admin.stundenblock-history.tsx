import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { fmtDate, fullName } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/stundenblock-history")({
  head: () => ({ meta: [{ title: "Stundenblock History — SOLEUS Admin" }] }),
  component: History,
});

function History() {
  const { hourChanges, customers } = useAdminStore();
  const [cid, setCid] = useState("");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const name = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? fullName(c) : "Unbekannt";
  };
  const rows = [...hourChanges]
    .filter((h) => (!cid || h.customerId === cid) && (!kind || h.kind === kind) && (!q || `${h.reason} ${h.actor}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Planung" title="Stundenblock History" intro="Verlauf aller Stundenblock-Änderungen und Verlängerungen." />
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr]">
        <select className={selectCls} value={cid} onChange={(e) => setCid(e.target.value)} aria-label="Kunde">
          <option value="">Alle Kunden</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{fullName(c)}</option>
          ))}
        </select>
        <select className={selectCls} value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Art">
          <option value="">Alle Arten</option>
          {["Buchung", "Anpassung", "Verlängerung", "Gutschrift"].map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <input className={inputCls} placeholder="Grund oder Auslöser suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Suchen" />
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Einträge.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((h) => {
            const diff = h.to - h.from;
            return (
              <li key={h.id} className="grid gap-3 py-6 md:grid-cols-[1.2fr_1fr_1.4fr_1fr] md:items-center">
                <p className="text-lg font-light">{name(h.customerId)}</p>
                <p className="tabular-nums">
                  {h.from} h → {h.to} h <span className={cn("ml-2 text-sm", diff < 0 ? "text-muted-foreground" : "text-foreground")}>{diff > 0 ? "+" : ""}{diff} h</span>
                </p>
                <p className="text-sm text-muted-foreground"><Chip t={h.kind === "Verlängerung" ? "strong" : "soft"} className="mr-3">{h.kind}</Chip>{h.reason}</p>
                <p className="text-xs text-muted-foreground tabular-nums md:text-right">{fmtDate(h.at)} · {h.at.slice(11)}<br />{h.actor}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
