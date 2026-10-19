import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check, Lock } from "lucide-react";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button, Eyebrow } from "@/components/ui-soleus/primitives";
import { mockMember, mockPlans } from "@/lib/mock-data";

export const Route = createFileRoute("/mitgliedschaft")({
  head: () => ({
    meta: [
      { title: "Mitgliedschaft — SOLEUS" },
      { name: "description", content: "Dein Paket und Upgrade-Möglichkeiten." },
      { property: "og:title", content: "Mitgliedschaft — SOLEUS" },
      { property: "og:description", content: "Dein Paket und Upgrade-Möglichkeiten." },
    ],
  }),
  component: Page,
});

const TIER_ORDER = ["standard", "plus", "premium", "unlimited"];

function Page() {
  const currentId = mockPlans.find((p) => p.name === mockMember.membership.name)?.id ?? "standard";
  const currentTier = TIER_ORDER.indexOf(currentId);
  const [requested, setRequested] = useState<string | null>(null);

  return (
    <MemberShell>
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="animate-rise">
          <Eyebrow>Abo</Eyebrow>
          <h1 className="mt-5 text-4xl leading-[1.1] font-light tracking-tight md:text-5xl">Mitgliedschaft.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed font-light text-muted-foreground">
            Dein aktuelles Paket: <span className="font-semibold text-foreground">{mockMember.membership.name}</span> ·{" "}
            {mockMember.membership.price} / {mockMember.membership.interval} · verlängert sich am {mockMember.membership.renewsOn}.
            Du kannst jederzeit auf ein höheres Paket wechseln. Ein Downgrade ist nicht möglich.
          </p>
        </div>

        {requested && (
          <div className="mt-8 rounded-2xl bg-[#211d1b] p-5 text-sm font-light text-[#f7f5f1]">
            Upgrade auf <span className="font-semibold">{mockPlans.find((p) => p.id === requested)?.name}</span> vorgemerkt. Die
            Umstellung und Abrechnung folgen, sobald die Zahlungsanbindung aktiv ist.
          </div>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          {mockPlans.map((p) => {
            const tier = TIER_ORDER.indexOf(p.id);
            const isCurrent = tier === currentTier;
            const locked = tier < currentTier;
            const dark = p.highlight && !locked;
            return (
              <div
                key={p.id}
                aria-disabled={locked}
                className={`relative flex flex-col rounded-2xl p-8 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] ${
                  locked
                    ? "bg-[#f7f5f1]/50 text-foreground opacity-50 grayscale"
                    : dark
                      ? "bg-[#211d1b] text-[#f7f5f1]"
                      : "bg-[#f7f5f1] text-foreground"
                } ${isCurrent ? "ring-2 ring-[#211d1b]" : ""}`}
              >
                {(isCurrent || p.badge) && (
                  <span
                    className={`absolute top-5 right-5 rounded-full px-4 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.28em] ${
                      dark ? "bg-[#e8dfcd] text-[#3b2a20]" : "bg-[#211d1b] text-[#f7f5f1]"
                    }`}
                  >
                    {isCurrent ? "Dein Paket" : p.badge}
                  </span>
                )}
                <p className={`mt-6 text-xs uppercase tracking-[0.2em] ${dark ? "text-[#f7f5f1]/75" : "text-muted-foreground"}`}>
                  <span className="font-bold">{p.perWeek}</span> Pro Woche
                </p>
                <h2 className="mt-8 text-4xl font-semibold tracking-tight">{p.name}</h2>
                <p className={`mt-3 text-base font-light ${dark ? "text-[#f7f5f1]/80" : "text-muted-foreground"}`}>{p.tagline}</p>
                <p className="mt-8 flex flex-nowrap items-baseline gap-2">
                  <span className="text-5xl font-light tracking-tight tabular-nums lg:text-4xl 2xl:text-5xl">{p.price}</span>
                  <span className={`whitespace-nowrap text-sm font-light ${dark ? "text-[#f7f5f1]/80" : "text-muted-foreground"}`}>
                    € / Monat
                  </span>
                </p>
                <hr className={`mt-8 border-0 border-t ${dark ? "border-white/20" : "border-border"}`} />
                <ul className="mt-8 flex-1 space-y-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-base leading-snug font-light">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                      <span className={dark ? "text-[#f7f5f1]/90" : "text-foreground/80"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button disabled variant="outline" className="mt-10 w-full font-bold">
                    Aktuelles Paket
                  </Button>
                ) : locked ? (
                  <Button disabled variant="outline" className="mt-10 w-full font-bold">
                    <Lock className="h-4 w-4" strokeWidth={1.75} /> Nicht verfügbar
                  </Button>
                ) : (
                  <Button
                    variant={dark ? "sand" : "primary"}
                    onClick={() => setRequested(p.id)}
                    className={`mt-10 w-full font-bold ${dark ? "bg-[#e8dfcd] text-[#3b2a20] hover:bg-[#e8dfcd]/90" : ""}`}
                  >
                    Upgrade <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MemberShell>
  );
}
