import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { dayKey, fmtDate } from "@/lib/admin/format";
import { ACTION_LABEL, type Activity } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/aktivitaetsprotokoll")({
  head: () => ({ meta: [{ title: "Aktivitätsprotokoll — SOLEUS Admin" }] }),
  component: ActivityLog,
});

const PAGE = 40;
const toneCls = { dark: "bg-[#211d1b] text-[#f7f5f1]", red: "bg-destructive text-destructive-foreground", line: "border border-foreground/30 text-foreground" } as const;
const labelOf = (code: string) => ACTION_LABEL[code]?.label ?? code;

function ActivityLog() {
  const { activity, customers } = useAdminStore();
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [shown, setShown] = useState(PAGE);

  const cutoff = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return dayKey(d);
  }, []);
  const inRange = activity.filter((a) => a.at.slice(0, 10) >= cutoff);
  const actions = [...new Set(inRange.map((a) => a.action))].sort((a, b) => labelOf(a).localeCompare(labelOf(b)));

  const who = (a: Activity) => {
    const c = a.subjectId ? customers.find((x) => x.id === a.subjectId) : undefined;
    return c ? { name: `${c.firstName} ${c.lastName}`, email: c.email } : { name: a.actor === "System" ? "System" : a.actor, email: a.actor === "System" ? "" : "" };
  };
  const rows = inRange.filter((a) => {
    if (action && a.action !== action) return false;
    if (from && a.at.slice(0, 10) < from) return false;
    if (!q) return true;
    const w = who(a);
    return `${w.name} ${w.email} ${a.actor} ${labelOf(a.action)} ${a.action} ${a.meta}`.toLowerCase().includes(q.toLowerCase());
  });
  const reset = () => setShown(PAGE);

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="System" title="Aktivitätsprotokoll" intro="Letzte 3 Monate aller Benutzeraktivitäten." />
      <div className="grid gap-3 md:grid-cols-[3fr_1.4fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Suche nach Name, E-Mail oder Aktion" value={q} onChange={(e) => { setQ(e.target.value); reset(); }} aria-label="Suchen" />
        </label>
        <select className={selectCls} value={action} onChange={(e) => { setAction(e.target.value); reset(); }} aria-label="Aktion">
          <option value="">Alle Aktionen</option>
          {actions.map((a) => <option key={a} value={a}>{labelOf(a)}</option>)}
        </select>
        <input type="date" min={cutoff} className={inputCls} value={from} onChange={(e) => { setFrom(e.target.value); reset(); }} aria-label="Ab Datum" />
      </div>
      <p className="text-xs tabular-nums text-muted-foreground">{rows.length} Einträge</p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Einträge.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {["Zeitpunkt", "Benutzer", "Aktion", "Details"].map((h) => <th key={h} className="px-5 py-4 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, shown).map((a) => {
                  const w = who(a);
                  const tone = ACTION_LABEL[a.action]?.tone ?? "line";
                  const delta = a.pg ? a.pg.to - a.pg.from : 0;
                  return (
                    <tr key={a.id} className="border-b border-border/70 align-middle last:border-0">
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs tabular-nums">{fmtDate(a.at)} {a.at.slice(11, 19)}</td>
                      <td className="px-5 py-3.5"><p className="font-medium">{w.name}</p>{w.email && <p className="mt-0.5 text-xs text-muted-foreground">{w.email}</p>}</td>
                      <td className="px-5 py-3.5"><span className={cn("inline-block whitespace-nowrap rounded-full px-3 py-1 text-[0.625rem] font-medium tracking-wide", toneCls[tone])}>{labelOf(a.action)}</span></td>
                      <td className="px-5 py-3.5">
                        <p>{a.meta}</p>
                        {a.pg && <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{a.pg.from} PG <span className={delta < 0 ? "text-destructive" : "text-foreground"}>{delta > 0 ? "+" : ""}{delta}</span> → {a.pg.to} PG</p>}
                        {a.actor !== "System" && <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">durch {a.actor}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {shown < rows.length && <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-11 rounded-full border border-foreground/15 px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Mehr laden</button>}
        </>
      )}
    </div>
  );
}
