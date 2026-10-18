import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { dayKey, fmtDate } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/aktivitaetsprotokoll")({
  head: () => ({ meta: [{ title: "Aktivitätsprotokoll — SOLEUS Admin" }] }),
  component: ActivityLog,
});

const PAGE = 40;

function ActivityLog() {
  const { activity } = useAdminStore();
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("");
  const [entity, setEntity] = useState("");
  const [from, setFrom] = useState("");
  const [shown, setShown] = useState(PAGE);

  const cutoff = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return dayKey(d);
  }, []);
  const inRange = activity.filter((a) => a.at.slice(0, 10) >= cutoff);
  const actors = [...new Set(inRange.map((a) => a.actor))];
  const entities = [...new Set(inRange.map((a) => a.entity))];
  const rows = inRange.filter(
    (a) => (!actor || a.actor === actor) && (!entity || a.entity === entity) && (!from || a.at.slice(0, 10) >= from) && (!q || `${a.action} ${a.meta} ${a.entityId}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="System" title="Aktivitätsprotokoll" intro="Letzte 3 Monate aller Benutzeraktivitäten." />
      <div className="grid gap-3 md:grid-cols-[2fr_1.4fr_1fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Aktion, ID oder Details suchen" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} aria-label="Suchen" />
        </label>
        <select className={selectCls} value={actor} onChange={(e) => { setActor(e.target.value); setShown(PAGE); }} aria-label="Akteur">
          <option value="">Alle Akteure</option>
          {actors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select className={selectCls} value={entity} onChange={(e) => { setEntity(e.target.value); setShown(PAGE); }} aria-label="Bereich">
          <option value="">Alle Bereiche</option>
          {entities.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input type="date" min={cutoff} className={inputCls} value={from} onChange={(e) => { setFrom(e.target.value); setShown(PAGE); }} aria-label="Ab Datum" />
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">{rows.length} Einträge</p>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Einträge.</p>
      ) : (
        <>
          <ul className="divide-y divide-border border-y border-border">
            {rows.slice(0, shown).map((a) => (
              <li key={a.id} className="grid gap-1 py-4 md:grid-cols-[11rem_1.4fr_1.2fr_1.6fr] md:items-center md:gap-4">
                <p className="text-xs tabular-nums text-muted-foreground">{fmtDate(a.at)} · {a.at.slice(11)}</p>
                <p className="truncate text-sm">{a.actor}</p>
                <p className="text-sm"><span className="font-medium">{a.entity}</span> <span className="text-muted-foreground">· {a.action}</span></p>
                <p className="text-sm text-muted-foreground">{a.meta} <span className="text-xs">({a.entityId})</span></p>
              </li>
            ))}
          </ul>
          {shown < rows.length && (
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-11 rounded-full border border-foreground/15 px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Mehr laden</button>
          )}
        </>
      )}
    </div>
  );
}
