import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AccountChip, MandateChip, PageHeader, inputCls, selectCls } from "@/components/admin/ui";
import { fmtDayShort, fmtTime, fullName, parseLocal } from "@/lib/admin/format";
import { PLAN_INFO, type AccountStatus, type AdminBooking, type AdminCustomer, type PlanId } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/kunden/")({
  head: () => ({ meta: [{ title: "Kunden — SOLEUS Admin" }] }),
  component: Customers,
});

export function nextBookingOf(bookings: AdminBooking[], customerId: string, now: Date) {
  return bookings
    .filter((b) => b.customerId === customerId && b.status !== "cancelled" && parseLocal(b.start) > now)
    .sort((a, b) => a.start.localeCompare(b.start))[0];
}

function Customers() {
  const { customers, bookings } = useAdminStore();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState<PlanId | "">("");
  const [status, setStatus] = useState<AccountStatus | "">("");

  const rows = useMemo(
    () =>
      customers.filter(
        (c) =>
          (!plan || c.plan === plan) &&
          (!status || c.status === status) &&
          (!q || `${fullName(c)} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [customers, q, plan, status],
  );

  const next = (c: AdminCustomer) => {
    const b = now ? nextBookingOf(bookings, c.id, now) : undefined;
    return b ? `${fmtDayShort(b.start)} · ${fmtTime(b.start)}` : "—";
  };

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Management" title="Kunden" intro={`${customers.length} Kunden in dieser Ansicht.`} />

      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Name, E-Mail oder Telefon" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kunden suchen" />
        </label>
        <select className={selectCls} value={plan} onChange={(e) => setPlan(e.target.value as PlanId | "")} aria-label="Abo">
          <option value="">Alle Abos</option>
          {(Object.keys(PLAN_INFO) as PlanId[]).map((p) => (
            <option key={p} value={p}>{PLAN_INFO[p].name}</option>
          ))}
        </select>
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as AccountStatus | "")} aria-label="Account Status">
          <option value="">Alle Status</option>
          <option value="active">Aktiv</option>
          <option value="paused">Pausiert</option>
          <option value="pending">Offen</option>
          <option value="cancelled">Gekündigt</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Kunden gefunden.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {["Name", "E-Mail", "Telefon", "Abo", "Status", "Einheiten", "Nächste Buchung", "GoCardless"].map((h) => (
                    <th key={h} className="px-5 py-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/50">
                    <td className="px-5 py-4 font-medium whitespace-nowrap">
                      <Link to="/admin/kunden/$id" params={{ id: c.id }} className="underline-offset-4 hover:underline">{fullName(c)}</Link>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">{c.phone}</td>
                    <td className="px-5 py-4">{PLAN_INFO[c.plan].name}</td>
                    <td className="px-5 py-4"><AccountChip status={c.status} /></td>
                    <td className="px-5 py-4 tabular-nums whitespace-nowrap">{c.hours} / {c.hoursTotal} h</td>
                    <td className="px-5 py-4 whitespace-nowrap tabular-nums">{next(c)}</td>
                    <td className="px-5 py-4"><MandateChip status={c.gc.mandate} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 lg:hidden">
            {rows.map((c) => (
              <li key={c.id}>
                <Link to="/admin/kunden/$id" params={{ id: c.id }} className="block rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{fullName(c)}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <AccountChip status={c.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="eyebrow text-[0.5625rem]">Abo</dt><dd className="mt-1 text-sm">{PLAN_INFO[c.plan].name}</dd></div>
                    <div><dt className="eyebrow text-[0.5625rem]">Einheiten</dt><dd className="mt-1 text-sm tabular-nums">{c.hours} / {c.hoursTotal} h</dd></div>
                    <div><dt className="eyebrow text-[0.5625rem]">Nächste Buchung</dt><dd className="mt-1 text-sm">{next(c)}</dd></div>
                    <div><dt className="eyebrow text-[0.5625rem]">GoCardless</dt><dd className="mt-1"><MandateChip status={c.gc.mandate} /></dd></div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
