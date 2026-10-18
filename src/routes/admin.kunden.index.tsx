import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, FileText, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { BlockDialog, CreateCustomerDialog, DeleteCustomerDialog, FormDialog, PGDialog } from "@/components/admin/CustomerDialogs";
import { Chip, PageHeader, inputCls } from "@/components/admin/ui";
import { fmtDate, fullName, parseLocal } from "@/lib/admin/format";
import { PLAN_INFO, type AdminBooking, type AdminCustomer } from "@/lib/admin/mock";
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

type Dlg = { kind: "block" | "pg" | "form" | "delete"; c: AdminCustomer } | { kind: "create" } | null;

const dash = <span className="text-muted-foreground">—</span>;
const actionBtn = "inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/15 px-3 text-[0.625rem] font-medium uppercase tracking-[0.15em] transition-colors hover:bg-secondary";

function Customers() {
  const { customers, bookings } = useAdminStore();
  const [q, setQ] = useState("");
  const [dlg, setDlg] = useState<Dlg>(null);

  const rows = useMemo(
    () => customers.filter((c) => !q || `${fullName(c)} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())),
    [customers, q],
  );
  const total = (id: string) => bookings.filter((b) => b.customerId === id && b.status !== "cancelled").length;

  const Actions = ({ c }: { c: AdminCustomer }) => (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => setDlg({ kind: "block", c })} className={actionBtn}><Plus className="h-3 w-3" /> Block</button>
      <button type="button" onClick={() => setDlg({ kind: "pg", c })} className={actionBtn}><Plus className="h-3 w-3" /> PG</button>
      <Link to="/admin/kunden/$id" params={{ id: c.id }} aria-label="Kunde ansehen" className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 transition-colors hover:bg-secondary"><Eye className="h-4 w-4" strokeWidth={1.5} /></Link>
      <button type="button" onClick={() => setDlg({ kind: "delete", c })} aria-label="Kunde löschen" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
    </div>
  );

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Management"
        title="Kunden"
        intro="Alle registrierten Kunden und ihre Buchungshistorie anzeigen."
        actions={
          <button type="button" onClick={() => setDlg({ kind: "create" })} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">
            <UserPlus className="h-4 w-4" strokeWidth={1.5} /> Kunde erstellen
          </button>
        }
      />
      <label className="relative block max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <input className={cn(inputCls, "pl-11")} placeholder="Nach Name suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kunden suchen" />
      </label>
      <p className="text-xs tabular-nums text-muted-foreground">{rows.length} Kunden</p>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Kunden gefunden.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card xl:block">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
                  {["Name", "Coaching", "Einheiten", "Private Gym", "Abo", "Buchungen", "Formular", "V2", "Aktion"].map((h) => (
                    <th key={h} className="px-2.5 py-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-border/70 align-middle transition-colors last:border-0 hover:bg-secondary/50">
                    <td className="px-2.5 py-4 whitespace-nowrap">
                      <Link to="/admin/kunden/$id" params={{ id: c.id }} className="font-medium underline-offset-4 hover:underline">{fullName(c)}</Link>
                      <p className="mt-1 text-xs text-muted-foreground tabular-nums">seit {fmtDate(c.since)}</p>
                    </td>
                    <td className="px-2.5 py-4 whitespace-nowrap">{c.block ? (<><Chip t="soft">{c.block.label}</Chip><p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{c.block.validUntil ? `gültig bis ${fmtDate(c.block.validUntil)}` : "unbefristet"}</p></>) : dash}</td>
                    <td className="px-2.5 py-4"><Chip t={c.hours === 0 ? "alert" : "soft"} className="tabular-nums">{c.hours} / {c.hoursTotal}</Chip></td>
                    <td className="px-2.5 py-4 whitespace-nowrap tabular-nums">{c.pg ? (<><p>{c.pg.units} / {c.pg.total}</p>{c.pg.validUntil && <p className="mt-1 text-xs text-muted-foreground">bis {fmtDate(c.pg.validUntil)}</p>}</>) : dash}</td>
                    <td className="px-2.5 py-4 whitespace-nowrap">
                      <p>{PLAN_INFO[c.plan].name}{c.family && <span className="ml-2 text-xs text-muted-foreground">+ Family</span>}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.planMonths} Mon.</p>
                    </td>
                    <td className="px-2.5 py-4 tabular-nums">{total(c.id)}</td>
                    <td className="px-2.5 py-4"><button type="button" onClick={() => setDlg({ kind: "form", c })} aria-label="Formular ansehen" className="text-muted-foreground transition-colors hover:text-foreground"><FileText className="h-4 w-4" strokeWidth={1.5} /></button></td>
                    <td className="px-2.5 py-4">{c.v2 ? <Chip t="line">V2</Chip> : dash}</td>
                    <td className="px-2.5 py-4"><Actions c={c} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 xl:hidden">
            {rows.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to="/admin/kunden/$id" params={{ id: c.id }} className="font-medium underline-offset-4 hover:underline">{fullName(c)}</Link>
                    <p className="mt-1 text-xs text-muted-foreground tabular-nums">seit {fmtDate(c.since)}</p>
                  </div>
                  <Chip t={c.hours === 0 ? "alert" : "soft"} className="tabular-nums">{c.hours} / {c.hoursTotal}</Chip>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="eyebrow text-[0.5625rem]">Abo</dt><dd className="mt-1">{PLAN_INFO[c.plan].name} · {c.planMonths} Mon.{c.family && " · Family"}</dd></div>
                  <div><dt className="eyebrow text-[0.5625rem]">Buchungen</dt><dd className="mt-1 tabular-nums">{total(c.id)}</dd></div>
                  <div><dt className="eyebrow text-[0.5625rem]">Coaching</dt><dd className="mt-1">{c.block ? `${c.block.label}${c.block.validUntil ? ` · bis ${fmtDate(c.block.validUntil)}` : ""}` : "—"}</dd></div>
                  <div><dt className="eyebrow text-[0.5625rem]">Private Gym</dt><dd className="mt-1 tabular-nums">{c.pg ? `${c.pg.units} / ${c.pg.total}` : "—"}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Actions c={c} />
                  <button type="button" onClick={() => setDlg({ kind: "form", c })} aria-label="Formular ansehen" className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15"><FileText className="h-4 w-4" strokeWidth={1.5} /></button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {dlg?.kind === "block" && <BlockDialog customer={dlg.c} onClose={() => setDlg(null)} />}
      {dlg?.kind === "pg" && <PGDialog customer={dlg.c} onClose={() => setDlg(null)} />}
      {dlg?.kind === "form" && <FormDialog customer={dlg.c} onClose={() => setDlg(null)} />}
      {dlg?.kind === "delete" && <DeleteCustomerDialog customer={dlg.c} onClose={() => setDlg(null)} />}
      {dlg?.kind === "create" && <CreateCustomerDialog onClose={() => setDlg(null)} />}
    </div>
  );
}
