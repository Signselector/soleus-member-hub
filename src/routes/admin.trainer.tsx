import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, History, Info, Search } from "lucide-react";
import { Chip, PageHeader, inputCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AdminBooking } from "@/lib/admin/mock";
import type { AdminUser } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/trainer")({
  head: () => ({ meta: [{ title: "Trainer — SOLEUS Admin" }] }),
  component: Trainers,
});

const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (key: string) => new Date(`${key}-01T00:00:00`).toLocaleDateString("de-AT", { month: "long", year: "numeric" });

/** Hours and sessions of a trainer; every non-cancelled booking counts by its duration. */
function stats(bookings: AdminBooking[], trainerId: string, month?: string) {
  const mine = bookings.filter((b) => b.trainerId === trainerId && b.status !== "cancelled" && (!month || monthKey(b.start) === month));
  return { sessions: mine.length, hours: mine.reduce((n, b) => n + b.durationMin / 60, 0), list: mine };
}

function Trainers() {
  const { trainers, bookings, toggleUserActive } = useAdminStore();
  const [q, setQ] = useState("");
  const [month, setMonth] = useState<string | null>(null);
  const [hist, setHist] = useState<AdminUser | null>(null);
  const cur = month ?? new Date().toISOString().slice(0, 7);

  const shift = (n: number) => {
    const d = new Date(`${cur}-01T00:00:00`);
    d.setMonth(d.getMonth() + n);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const rows = useMemo(() => trainers.filter((t) => !q || `${t.name} ${t.email}`.toLowerCase().includes(q.toLowerCase())), [trainers, q]);
  const active = rows.filter((t) => t.active);
  const inactive = rows.filter((t) => !t.active);

  const report = () => {
    const lines = [["Trainer", "E-Mail", "Monat", "Stunden", "Termine"].join(";")];
    for (const t of trainers) {
      const s = stats(bookings, t.id, cur);
      lines.push([t.name, t.email, cur, s.hours.toFixed(1).replace(".", ","), s.sessions].join(";"));
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `trainer-report-${cur}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const Row = ({ t }: { t: AdminUser }) => {
    const s = stats(bookings, t.id, cur);
    return (
      <tr className={cn("border-b border-border/70 last:border-0", !t.active && "text-muted-foreground")}>
        <td className="px-5 py-4 font-medium">{t.name}</td>
        <td className="px-5 py-4">{t.email}</td>
        <td className="px-5 py-4 whitespace-nowrap">{t.phone || "—"}</td>
        <td className="px-5 py-4 whitespace-nowrap tabular-nums">{s.hours.toFixed(1).replace(".0", "")} Std <span className="text-xs text-muted-foreground">({s.sessions} Termine)</span></td>
        <td className="px-5 py-4"><Chip t={t.active ? "strong" : "line"}>{t.active ? "Aktiv" : "Inaktiv"}</Chip></td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={() => toggleUserActive(t.id)} className="eyebrow hover:text-foreground">{t.active ? "Deaktivieren" : "Aktivieren"}</button>
            <button type="button" onClick={() => setHist(t)} aria-label="Verlauf ansehen" className="text-muted-foreground transition-colors hover:text-foreground"><History className="h-4 w-4" strokeWidth={1.5} /></button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Management"
        title="Trainer verwalten"
        intro="Alle Trainer anzeigen und verwalten."
        actions={
          <button type="button" onClick={report} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Report erstellen
          </button>
        }
      />

      <div className="flex items-start gap-4 rounded-2xl bg-secondary px-6 py-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
        <div className="text-sm">
          <p className="font-medium">Trainer werden über die Benutzerverwaltung erstellt</p>
          <p className="mt-1 text-muted-foreground">
            Lade neue Benutzer in der <Link to="/admin/admin-verwaltung" className="text-foreground underline underline-offset-4">Admin Verwaltung</Link> ein und vergib ihnen die Trainer-Rolle.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Nach Name suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Trainer suchen" />
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => shift(-1)} aria-label="Vorheriger Monat" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
          <span className="w-40 text-center text-sm capitalize">{monthLabel(cur)}</span>
          <button type="button" onClick={() => shift(1)} aria-label="Nächster Monat" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
              {["Name", "E-Mail", "Telefon", monthLabel(cur), "Status", ""].map((h, i) => (
                <th key={i} className="px-5 py-4 font-medium whitespace-nowrap capitalize">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Keine Trainer gefunden.</td></tr>
            )}
            {active.map((t) => <Row key={t.id} t={t} />)}
            {inactive.length > 0 && (
              <>
                <tr className="bg-muted/60"><td colSpan={6} className="px-5 py-3 text-xs font-medium">Inaktive Trainer</td></tr>
                {inactive.map((t) => <Row key={t.id} t={t} />)}
              </>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!hist} onOpenChange={(o) => !o && setHist(null)}>
        <DialogContent className="max-w-lg gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Verlauf</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">{hist?.name} · Stunden und Termine pro Monat.</DialogDescription>
          {hist && <History_ trainerId={hist.id} bookings={bookings} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function History_({ trainerId, bookings }: { trainerId: string; bookings: AdminBooking[] }) {
  const all = stats(bookings, trainerId).list;
  const months = [...new Set(all.map((b) => monthKey(b.start)))].sort().reverse();
  if (months.length === 0) return <p className="mt-6 text-sm text-muted-foreground">Noch keine Termine.</p>;
  return (
    <ul className="mt-6 divide-y divide-border border-y border-border">
      {months.map((m) => {
        const s = stats(bookings, trainerId, m);
        return (
          <li key={m} className="flex items-center justify-between py-3.5 text-sm">
            <span className="capitalize">{monthLabel(m)}</span>
            <span className="tabular-nums">{s.hours.toFixed(1).replace(".0", "")} Std <span className="text-xs text-muted-foreground">({s.sessions} Termine)</span></span>
          </li>
        );
      })}
    </ul>
  );
}
