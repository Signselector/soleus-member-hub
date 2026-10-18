import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Search, TriangleAlert } from "lucide-react";
import { Chip, PageHeader, Section, inputCls } from "@/components/admin/ui";
import { fullName } from "@/lib/admin/format";
import type { AdminCustomer } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/support-view/")({
  head: () => ({ meta: [{ title: "Support View — SOLEUS Admin" }] }),
  component: SupportList,
});

/** Problems that can be detected from the customer record. */
export function issuesOf(c: AdminCustomer) {
  const out: string[] = [];
  if (c.gc.mandate === "failed" || c.gc.payment === "failed") out.push("GoCardless-Zahlung fehlgeschlagen");
  if (c.gc.mandate === "pending") out.push("SEPA-Mandat offen");
  if (c.status === "active" && c.hoursTotal > 0 && c.hours === 0) out.push("Keine Einheiten übrig");
  if (c.status === "pending") out.push("Registrierung nicht abgeschlossen");
  return out;
}

function SupportList() {
  const { customers, startImpersonation } = useAdminStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const rows = customers.filter((c) => !q || `${fullName(c)} ${c.email}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => fullName(a).localeCompare(fullName(b), "de"));
  const flagged = customers.filter((c) => issuesOf(c).length > 0);

  const open = (c: AdminCustomer) => {
    startImpersonation(c.id);
    navigate({ to: "/admin/support-view/$id", params: { id: c.id } });
  };

  return (
    <div className="space-y-12">
      <PageHeader eyebrow="System" title="Support View" intro="Kunden-Dashboard ansehen, Kundenprobleme erkennen und beheben." />

      {flagged.length > 0 && (
        <Section title={`Auffällige Kunden (${flagged.length})`}>
          <ul className="divide-y divide-border border-y border-border">
            {flagged.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium">{fullName(c)}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><TriangleAlert className="h-3.5 w-3.5" strokeWidth={1.5} />{issuesOf(c).join(" · ")}</p>
                </div>
                <button type="button" onClick={() => open(c)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#211d1b] px-5 text-[0.625rem] font-medium uppercase tracking-[0.15em] text-[#f7f5f1]"><Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> Ansehen</button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Kunden-Dashboard ansehen">
        <label className="relative block max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input className={cn(inputCls, "pl-11")} placeholder="Name oder E-Mail suchen" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kunden suchen" />
        </label>
        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Keine Kunden gefunden.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {rows.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => open(c)} className="flex w-full items-center justify-between gap-4 px-1 py-4 text-left transition-colors hover:bg-secondary/50">
                  <span>
                    <span className="block text-sm font-medium">{fullName(c)}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{c.email}</span>
                  </span>
                  {issuesOf(c).length > 0 && <Chip t="alert">{issuesOf(c).length} Problem(e)</Chip>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">Das Öffnen und Beenden einer Kundenansicht wird im Aktivitätsprotokoll festgehalten (IMPERSONATION_START / IMPERSONATION_END).</p>
    </div>
  );
}
