import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PageHeader, selectCls } from "@/components/admin/ui";
import { fmtDate, fmtEur, fullName } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/zusatzleistungen")({
  head: () => ({ meta: [{ title: "Zusatzleistungen — SOLEUS Admin" }] }),
  component: Addons,
});

function Addons() {
  const { addons, customers } = useAdminStore();
  const years = useMemo(() => [...new Set(addons.map((a) => a.date.slice(0, 4)))].sort().reverse(), [addons]);
  const [year, setYear] = useState<string>("all");
  const name = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? fullName(c) : "Unbekannt";
  };
  const rows = addons.filter((a) => year === "all" || a.date.startsWith(year)).sort((a, b) => b.date.localeCompare(a.date));
  const total = rows.reduce((n, a) => n + a.price, 0);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Management"
        title="Zusatzleistungen"
        intro="Übersicht aller gebuchten Zusatzleistungen mit Jahresfilter."
        actions={
          <select className={cn(selectCls, "w-44")} value={year} onChange={(e) => setYear(e.target.value)} aria-label="Jahr">
            <option value="all">Alle Jahre</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        }
      />
      <dl className="grid gap-10 border-y border-border py-8 sm:grid-cols-2">
        <div>
          <dt className="eyebrow text-[0.625rem]">Gebuchte Leistungen</dt>
          <dd className="mt-3 text-5xl font-light tabular-nums">{rows.length}</dd>
        </div>
        <div>
          <dt className="eyebrow text-[0.625rem]">Umsatz</dt>
          <dd className="mt-3 text-5xl font-light tabular-nums">{fmtEur(total)}</dd>
        </div>
      </dl>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Zusatzleistungen in diesem Zeitraum.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((a) => (
            <li key={a.id} className="grid gap-2 py-5 md:grid-cols-[1fr_2fr_auto] md:items-center">
              <p className="text-sm tabular-nums text-muted-foreground">{fmtDate(a.date)}</p>
              <div>
                <p className="text-sm font-medium">{a.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{name(a.customerId)}</p>
              </div>
              <p className="text-base tabular-nums md:text-right">{fmtEur(a.price)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
