import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Download, RefreshCw, Database } from "lucide-react";
import { Chip, PageHeader } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fmtDate } from "@/lib/admin/format";
import type { Backup } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/backups")({
  head: () => ({ meta: [{ title: "Backups — SOLEUS Admin" }] }),
  component: Backups,
});

const fileName = (b: Backup) => `${b.at.slice(0, 10)}_${b.at.slice(11, 13)}-${b.at.slice(14, 16)}.json`;
const PAGE = 12;

function Backups() {
  const { backups, runBackup, restoreBackup } = useAdminStore();
  const [confirm, setConfirm] = useState(false);
  const [details, setDetails] = useState<Backup | null>(null);
  const [restore, setRestore] = useState<Backup | null>(null);
  const [typed, setTyped] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [refreshed, setRefreshed] = useState<string | null>(null);
  const last = backups.find((b) => b.status === "ok");

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="System"
        title="Backup-Verwaltung"
        intro="Tägliche Snapshots aller Tabellen mit Schema und Daten. 35 Tage Aufbewahrung."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setRefreshed(new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }))} className="inline-flex h-12 items-center gap-2.5 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">
              <RefreshCw className="h-4 w-4" strokeWidth={1.5} /> Aktualisieren
            </button>
            {confirm ? (
              <span className="flex items-center gap-3 text-sm">
                Backup jetzt erstellen?
                <button type="button" onClick={() => { runBackup(); setConfirm(false); }} className="h-10 rounded-full bg-[#211d1b] px-5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Ja</button>
                <button type="button" onClick={() => setConfirm(false)} className="eyebrow hover:text-foreground">Abbrechen</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirm(true)} className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">
                <Database className="h-4 w-4" strokeWidth={1.5} /> Backup jetzt erstellen
              </button>
            )}
          </div>
        }
      />
      <dl className="grid gap-10 border-y border-border py-8 sm:grid-cols-3">
        <div><dt className="eyebrow text-[0.625rem]">Letztes erfolgreiches Backup</dt><dd className="mt-3 text-2xl font-light tabular-nums">{last ? `${fmtDate(last.at)} · ${last.at.slice(11, 16)}` : "—"}</dd></div>
        <div><dt className="eyebrow text-[0.625rem]">Aufbewahrung</dt><dd className="mt-3 text-2xl font-light">35 Tage</dd></div>
        <div><dt className="eyebrow text-[0.625rem]">Gespeicherte Snapshots</dt><dd className="mt-3 text-2xl font-light tabular-nums">{backups.length}</dd></div>
      </dl>
      {refreshed && <p className="text-xs text-muted-foreground">Liste aktualisiert um {refreshed} Uhr.</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
              {["Datum", "Dateiname", "Status", "Aktionen"].map((h, i) => <th key={h} className={cn("px-6 py-4 font-medium", i === 3 && "text-right")}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {backups.slice(0, shown).map((b) => (
              <tr key={b.id} className="border-b border-border/70 align-middle last:border-0">
                <td className="px-6 py-3.5 whitespace-nowrap tabular-nums"><span className="inline-flex items-center gap-2.5"><CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />{b.at.slice(0, 10)} {b.at.slice(11, 16)} Uhr</span></td>
                <td className="px-6 py-3.5"><span className="rounded-full border border-border px-3 py-1 font-mono text-xs">{fileName(b)}</span></td>
                <td className="px-6 py-3.5"><Chip t={b.status === "ok" ? "soft" : "alert"}>{b.status === "ok" ? "Erfolgreich" : "Fehlgeschlagen"}</Chip>{b.kind === "manual" && <Chip t="line" className="ml-2">Manuell</Chip>}</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setDetails(b)} className="h-9 rounded-full border border-foreground/15 px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] hover:bg-secondary">Details</button>
                    <button type="button" disabled={b.status !== "ok"} onClick={() => { setRestore(b); setTyped(""); }} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-destructive px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] text-destructive-foreground disabled:opacity-40"><Download className="h-3.5 w-3.5" /> Restore</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown < backups.length && (
        <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-11 rounded-full border border-foreground/15 px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Mehr anzeigen</button>
      )}

      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Backup-Details</DialogTitle>
          <DialogDescription className="mt-2 font-mono text-xs text-muted-foreground">{details && fileName(details)}</DialogDescription>
          {details && (
            <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
              {[["Erstellt", `${fmtDate(details.at)} · ${details.at.slice(11, 16)} Uhr`], ["Typ", details.kind === "daily" ? "Täglich (automatisch)" : "Manuell"], ["Status", details.status === "ok" ? "Erfolgreich" : "Fehlgeschlagen"], ["Tabellen", `${details.tables} (Schema und Daten)`], ["Größe", `${details.sizeMb.toFixed(1)} MB`]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3.5"><dt className="text-muted-foreground">{k}</dt><dd className="tabular-nums">{v}</dd></div>
              ))}
            </dl>
          )}
          <div className="mt-6 flex justify-end"><button type="button" onClick={() => setDetails(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Schließen</button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restore} onOpenChange={(o) => !o && setRestore(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Backup wiederherstellen?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {restore && `Der Stand vom ${fmtDate(restore.at)} (${restore.at.slice(11, 16)} Uhr) ersetzt die aktuellen Daten. Änderungen seitdem gehen verloren.`}
          </DialogDescription>
          <label className="mt-6 block"><span className="eyebrow">Zur Bestätigung „RESTORE" eingeben</span>
            <input className="mt-2 h-11 w-full rounded-full border border-border bg-card px-5 text-sm focus:border-foreground focus:outline-none" value={typed} onChange={(e) => setTyped(e.target.value)} />
          </label>
          <p className="mt-3 text-xs text-muted-foreground">In dieser Vorschau werden keine Daten verändert. Die Wiederherstellung wird nur protokolliert.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setRestore(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
            <button type="button" disabled={typed !== "RESTORE"} onClick={() => { if (restore) restoreBackup(restore.id); setRestore(null); }} className="h-11 rounded-full bg-destructive px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-destructive-foreground disabled:opacity-40">Wiederherstellen</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
