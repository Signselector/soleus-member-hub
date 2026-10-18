import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, Dumbbell, FileText, Search, Trash2 } from "lucide-react";
import { Chip, PageHeader, inputCls } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fmtDate, fmtTime, fullName } from "@/lib/admin/format";
import type { HourRequest } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/stunden-anfragen")({
  head: () => ({ meta: [{ title: "Stunden Anfragen — SOLEUS Admin" }] }),
  component: Requests,
});

const PAGE = 10;

function Requests() {
  const { requests, customers, decideRequest } = useAdminStore();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [proof, setProof] = useState<HourRequest | null>(null);
  const [reject, setReject] = useState<HourRequest | null>(null);

  const who = (id: string) => customers.find((x) => x.id === id);
  const match = (r: HourRequest) => {
    if (!q) return true;
    const c = who(r.customerId);
    return `${c ? fullName(c) : ""} ${c?.email ?? ""}`.toLowerCase().includes(q.toLowerCase());
  };
  const openCoaching = requests.filter((r) => r.status === "pending" && r.kind === "coaching");
  const openPG = requests.filter((r) => r.status === "pending" && r.kind === "private_gym");
  const done = useMemo(() => requests.filter((r) => r.status === "approved").sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? "")), [requests]);
  const doneShown = done.filter(match);
  const pages = Math.max(1, Math.ceil(doneShown.length / PAGE));
  const cur = Math.min(page, pages);

  const kpis = [
    { icon: Clock, n: openCoaching.length, label: "Coaching Anfragen" },
    { icon: Dumbbell, n: openPG.length, label: "Private Gym" },
    { icon: Check, n: done.filter((r) => r.kind === "coaching").length, label: "Coaching freigegeben" },
    { icon: Check, n: done.filter((r) => r.kind === "private_gym").length, label: "Private Gym freigegeben" },
  ];

  const Name = ({ r }: { r: HourRequest }) => {
    const c = who(r.customerId);
    return <div><p className="font-medium">{c ? fullName(c) : "Unbekannt"}</p>{c && <p className="mt-0.5 text-xs text-muted-foreground">{c.email}</p>}</div>;
  };
  const Proof = ({ r }: { r: HourRequest }) =>
    r.hasProof ? (
      <button type="button" onClick={() => setProof(r)} className="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/15 px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] hover:bg-secondary"><FileText className="h-3.5 w-3.5" strokeWidth={1.5} /> Ansehen</button>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  const OpenTable = ({ rows, empty }: { rows: HourRequest[]; empty: string }) => {
    const list = rows.filter(match);
    if (list.length === 0) return <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">{empty}</p>;
    return (
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
              {["Kunde", "Paket", "Einheiten", "Gültigkeit", "Zahlungsnachweis", "Angefragt am", ""].map((h) => <th key={h} className="px-4 py-4 font-medium whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-border/70 align-middle last:border-0">
                <td className="px-4 py-4"><Name r={r} /></td>
                <td className="px-4 py-4"><Chip t="soft">{r.pkg}</Chip></td>
                <td className="px-4 py-4 tabular-nums">{r.hours}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.validity}</td>
                <td className="px-4 py-4"><Proof r={r} /></td>
                <td className="px-4 py-4 whitespace-nowrap tabular-nums text-muted-foreground">{fmtDate(r.at)} · {fmtTime(r.at)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => decideRequest(r.id, "approved")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#211d1b] px-4 text-[0.625rem] font-medium uppercase tracking-[0.15em] text-[#f7f5f1]"><Check className="h-3.5 w-3.5" /> Freigeben</button>
                    <button type="button" onClick={() => setReject(r)} aria-label="Anfrage ablehnen" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-destructive"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Planung" title="Stundenblock Anfragen" intro="Kunden-Anfragen für neue Stundenpakete verwalten und freigeben." />

      <dl className="grid grid-cols-2 gap-y-8 border-y border-border py-8 md:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={cn("flex items-center gap-4", i > 0 && "md:border-l md:border-border md:pl-7")}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary"><k.icon className="h-4 w-4" strokeWidth={1.5} /></span>
            <div><dd className="text-3xl font-light tabular-nums">{k.n}</dd><dt className="eyebrow mt-1 text-[0.5625rem]">{k.label}</dt></div>
          </div>
        ))}
      </dl>

      <label className="relative block max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <input className={cn(inputCls, "pl-11")} placeholder="Nach Name oder E-Mail suchen" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Suchen" />
      </label>

      <section className="space-y-4">
        <h2 className="eyebrow text-foreground">Offene Anfragen</h2>
        <OpenTable rows={openCoaching} empty="Keine offenen Anfragen." />
      </section>

      <section className="space-y-4">
        <h2 className="eyebrow text-foreground">Private Gym Anfragen</h2>
        <OpenTable rows={openPG} empty="Keine offenen Private Gym Anfragen" />
      </section>

      <section className="space-y-4">
        <h2 className="eyebrow text-foreground">Kürzlich freigegeben ({doneShown.length})</h2>
        {doneShown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine freigegebenen Anfragen.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {["Kunde", "Typ", "Paket", "Einheiten", "Zahlungsnachweis", "Freigegeben am"].map((h) => <th key={h} className="px-4 py-4 font-medium whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {doneShown.slice((cur - 1) * PAGE, cur * PAGE).map((r) => (
                    <tr key={r.id} className="border-b border-border/70 align-middle last:border-0">
                      <td className="px-4 py-3.5"><Name r={r} /></td>
                      <td className="px-4 py-3.5"><Chip t={r.kind === "coaching" ? "soft" : "line"}>{r.kind === "coaching" ? "Coaching" : "Private Gym"}</Chip></td>
                      <td className="px-4 py-3.5"><Chip t="muted">{r.pkg}</Chip></td>
                      <td className="px-4 py-3.5 tabular-nums">{r.hours}</td>
                      <td className="px-4 py-3.5"><Proof r={r} /></td>
                      <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-muted-foreground">{r.decidedAt ? `${fmtDate(r.decidedAt)} · ${fmtTime(r.decidedAt)}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Seiten">
                <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Vorherige Seite" className="flex h-9 w-9 items-center justify-center rounded-md border border-border disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" onClick={() => setPage(n)} aria-current={n === cur} className={cn("h-9 w-9 rounded-md border text-sm tabular-nums", n === cur ? "border-[#211d1b] bg-[#211d1b] text-[#f7f5f1]" : "border-border hover:bg-secondary")}>{n}</button>
                ))}
                <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Nächste Seite" className="flex h-9 w-9 items-center justify-center rounded-md border border-border disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </nav>
            )}
          </>
        )}
      </section>

      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">Bei Freigabe wird das Kontingent erhöht (Coaching in der Stundenblock History als Verlängerung, Private Gym als Einheiten beim Kunden).</p>

      <Dialog open={!!proof} onOpenChange={(o) => !o && setProof(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Zahlungsnachweis</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">{proof && `${who(proof.customerId) ? fullName(who(proof.customerId)!) : "Unbekannt"} · ${proof.pkg} · ${proof.hours} Einheiten`}</DialogDescription>
          <p className="mt-6 rounded-2xl bg-secondary px-5 py-8 text-center text-sm text-muted-foreground">Der Nachweis (Datei) wird mit der Backend-Anbindung angezeigt.</p>
          <div className="mt-6 flex justify-end"><button type="button" onClick={() => setProof(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Schließen</button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reject} onOpenChange={(o) => !o && setReject(null)}>
        <DialogContent className="max-w-md gap-0 rounded-2xl border-0 bg-[#f7f5f1] p-6 md:p-8">
          <DialogTitle className="text-2xl font-light tracking-tight">Anfrage ablehnen?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">{reject && `${who(reject.customerId) ? fullName(who(reject.customerId)!) : "Unbekannt"} · ${reject.pkg}. Der Kunde erhält keine Stunden.`}</DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setReject(null)} className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Abbrechen</button>
            <button type="button" onClick={() => { if (reject) decideRequest(reject.id, "rejected"); setReject(null); }} className="h-11 rounded-full bg-destructive px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-destructive-foreground">Ablehnen</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
