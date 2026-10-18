import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, PageHeader } from "@/components/admin/ui";
import { fmtDate, fullName } from "@/lib/admin/format";
import type { RequestStatus } from "@/lib/admin/mock2";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/stunden-anfragen")({
  head: () => ({ meta: [{ title: "Stunden Anfragen — SOLEUS Admin" }] }),
  component: Requests,
});

const LABEL: Record<RequestStatus, string> = { pending: "Offen", approved: "Freigegeben", rejected: "Abgelehnt" };

function Requests() {
  const { requests, customers, decideRequest } = useAdminStore();
  const [filter, setFilter] = useState<RequestStatus | "all">("pending");
  const name = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? fullName(c) : "Unbekannt";
  };
  const rows = requests.filter((r) => filter === "all" || r.status === filter).sort((a, b) => b.at.localeCompare(a.at));
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Planung" title="Stunden Anfragen" intro="Kunden-Anfragen für neue Stundenpakete verwalten und freigeben." />
      <div className="flex flex-wrap gap-2" role="tablist">
        {(["pending", "approved", "rejected", "all"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={cn("rounded-full px-5 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-colors", filter === k ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary")}
          >
            {k === "all" ? "Alle" : LABEL[k]}{k === "pending" && pending > 0 ? ` · ${pending}` : ""}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">Keine Anfragen.</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {rows.map((r) => (
            <li key={r.id} className="grid gap-4 py-6 md:grid-cols-[1.2fr_1fr_1.6fr_auto] md:items-center">
              <div>
                <p className="text-lg font-light">{name(r.customerId)}</p>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">{fmtDate(r.at)}</p>
              </div>
              <p className="text-sm tabular-nums">{r.hours} Stunden</p>
              <p className="text-sm text-muted-foreground">{r.note || "—"}</p>
              {r.status === "pending" ? (
                <div className="flex gap-3 md:justify-end">
                  <button type="button" onClick={() => decideRequest(r.id, "rejected")} className="h-10 rounded-full border border-foreground/15 px-5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Ablehnen</button>
                  <button type="button" onClick={() => decideRequest(r.id, "approved")} className="h-10 rounded-full bg-[#211d1b] px-5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]">Freigeben</button>
                </div>
              ) : (
                <div className="md:text-right"><Chip t={r.status === "approved" ? "strong" : "line"}>{LABEL[r.status]}</Chip></div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">Bei Freigabe wird das Stundenkontingent erhöht und in der Stundenblock History als Verlängerung protokolliert.</p>
    </div>
  );
}
