import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, PageHeader } from "@/components/admin/ui";
import { fmtDate } from "@/lib/admin/format";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/backups")({
  head: () => ({ meta: [{ title: "Backups — SOLEUS Admin" }] }),
  component: Backups,
});

function Backups() {
  const { backups, runBackup } = useAdminStore();
  const [confirm, setConfirm] = useState(false);
  const last = backups.find((b) => b.status === "ok");
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="System"
        title="Backups"
        intro="Tägliche Snapshots aller Tabellen mit Schema und Daten. 35 Tage Aufbewahrung."
        actions={
          confirm ? (
            <div className="flex items-center gap-3 text-sm">
              Backup jetzt auslösen?
              <button type="button" onClick={() => { runBackup(); setConfirm(false); }} className="h-10 rounded-full bg-[#211d1b] px-5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Ja, auslösen</button>
              <button type="button" onClick={() => setConfirm(false)} className="eyebrow hover:text-foreground">Abbrechen</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="h-12 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Backup auslösen</button>
          )
        }
      />
      <dl className="grid gap-10 border-y border-border py-8 sm:grid-cols-3">
        <div><dt className="eyebrow text-[0.625rem]">Letztes erfolgreiches Backup</dt><dd className="mt-3 text-2xl font-light tabular-nums">{last ? `${fmtDate(last.at)} · ${last.at.slice(11)}` : "—"}</dd></div>
        <div><dt className="eyebrow text-[0.625rem]">Aufbewahrung</dt><dd className="mt-3 text-2xl font-light">35 Tage</dd></div>
        <div><dt className="eyebrow text-[0.625rem]">Gespeicherte Snapshots</dt><dd className="mt-3 text-2xl font-light tabular-nums">{backups.length}</dd></div>
      </dl>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
              {["Datum", "Typ", "Tabellen", "Größe", "Status"].map((h) => (
                <th key={h} className="px-6 py-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.id} className="border-b border-border/70 last:border-0">
                <td className="px-6 py-3.5 tabular-nums">{fmtDate(b.at)} · {b.at.slice(11)}</td>
                <td className="px-6 py-3.5 text-muted-foreground">{b.kind === "daily" ? "Täglich" : "Manuell"}</td>
                <td className="px-6 py-3.5 tabular-nums text-muted-foreground">{b.tables}</td>
                <td className="px-6 py-3.5 tabular-nums text-muted-foreground">{b.sizeMb.toFixed(1)} MB</td>
                <td className="px-6 py-3.5"><Chip t={b.status === "ok" ? "soft" : "alert"}>{b.status === "ok" ? "Erfolgreich" : "Fehlgeschlagen"}</Chip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
