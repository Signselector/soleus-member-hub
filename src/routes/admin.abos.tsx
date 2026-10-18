import { Link, createFileRoute } from "@tanstack/react-router";
import { MandateChip, PageHeader, Section, Chip } from "@/components/admin/ui";
import { fmtEur, fullName } from "@/lib/admin/format";
import { PLAN_INFO, type PlanId } from "@/lib/admin/mock";
import { useAdminStore } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/abos")({
  head: () => ({ meta: [{ title: "Abos — SOLEUS Admin" }] }),
  component: Plans,
});

const PLAN_ORDER: PlanId[] = ["standard", "plus", "premium", "unlimited"];

function Plans() {
  const { customers } = useAdminStore();
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Management" title="Abos" intro="Standard, Plus, Premium und Unlimited mit Preis, Kontingent und Kunden." />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const p = PLAN_INFO[id];
          const list = customers.filter((c) => c.plan === id && c.status !== "cancelled");
          const issues = list.filter((c) => c.gc.mandate === "failed" || c.gc.mandate === "pending").length;
          const dark = id === "plus";
          return (
            <div key={id} className={dark ? "rounded-2xl bg-[#211d1b] p-7 text-[#f7f5f1] shadow-[0_18px_40px_-18px_rgba(33,29,27,0.45)]" : "rounded-2xl bg-card p-7 shadow-[0_18px_40px_-22px_rgba(33,29,27,0.3)]"}>
              <p className={dark ? "eyebrow text-[#f7f5f1]/70" : "eyebrow"}>{p.perWeek} pro Woche</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight">{p.name}</h2>
              <p className="mt-5 whitespace-nowrap text-3xl font-light tabular-nums 2xl:text-4xl">{fmtEur(p.price)}<span className={dark ? "ml-2 text-sm text-[#f7f5f1]/70" : "ml-2 text-sm text-muted-foreground"}>/ Monat</span></p>
              <dl className={dark ? "mt-7 divide-y divide-white/15 border-y border-white/15 text-sm" : "mt-7 divide-y divide-border border-y border-border text-sm"}>
                <div className="flex justify-between py-3"><dt className="opacity-70">Kontingent</dt><dd className="tabular-nums">{p.hoursPerMonth} h / Monat</dd></div>
                <div className="flex justify-between py-3"><dt className="opacity-70">Aktive Kunden</dt><dd className="tabular-nums">{list.length}</dd></div>
                <div className="flex justify-between py-3"><dt className="opacity-70">GoCardless offen</dt><dd className="tabular-nums">{issues}</dd></div>
              </dl>
            </div>
          );
        })}
      </div>

      <Section title="Kunden pro Abo">
        <div className="space-y-10">
          {PLAN_ORDER.map((id) => {
            const list = customers.filter((c) => c.plan === id);
            return (
              <div key={id}>
                <p className="text-sm font-medium">{PLAN_INFO[id].name} <span className="font-normal text-muted-foreground">· {list.length}</span></p>
                {list.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Keine Kunden.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-border border-y border-border">
                    {list.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-sm">
                        <Link to="/admin/kunden/$id" params={{ id: c.id }} className="underline-offset-4 hover:underline">{fullName(c)}</Link>
                        <div className="flex items-center gap-3">
                          {c.status !== "active" && <Chip t="muted">{c.status === "paused" ? "Pausiert" : c.status === "pending" ? "Offen" : "Gekündigt"}</Chip>}
                          <MandateChip status={c.gc.mandate} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Aktionen">
        <div className="flex flex-wrap gap-3">
          {["Upgrade", "Downgrade", "Pausieren", "Kündigen"].map((a) => (
            <button key={a} type="button" disabled title="Folgt mit der Backend-Anbindung" className="h-11 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] opacity-50">
              {a}
            </button>
          ))}
        </div>
        <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">
          Abo-Änderungen werden erst mit der Backend-Anbindung freigeschaltet. GoCardless-Mandate werden dabei nie ungeprüft gelöscht oder neu erstellt.
        </p>
      </Section>
    </div>
  );
}
