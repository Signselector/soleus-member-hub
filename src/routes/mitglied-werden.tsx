import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ButtonLink, Eyebrow } from "@/components/ui-soleus/primitives";
import { mockPlans } from "@/lib/mock-data";

export const Route = createFileRoute("/mitglied-werden")({
  head: () => ({
    meta: [
      { title: "Mitglied werden — SOLEUS" },
      { name: "description", content: "Wähle deine Mitgliedschaft: Standard, Plus, Premium oder Unlimited." },
      { property: "og:title", content: "Mitglied werden — SOLEUS" },
      { property: "og:description", content: "Wähle deine Mitgliedschaft: Standard, Plus, Premium oder Unlimited." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-secondary">
      <PublicHeader back="/willkommen" wide />
      <div className="mx-auto max-w-7xl px-6 pb-12 md:px-10 md:pb-16">
        <div className="mt-12 grid animate-rise gap-8 md:mt-20 md:grid-cols-2 md:items-start md:gap-16">
          <div>
            <Eyebrow>Mitgliedschaft</Eyebrow>
            <h1 className="mt-5 text-4xl leading-[1.1] font-light tracking-tight md:text-6xl">Mitglied werden.</h1>
          </div>
          <p className="max-w-md text-base leading-relaxed font-light text-muted-foreground md:mt-10">
            Wähle das Paket, das zu deinem Rhythmus passt. Du buchst deine Trainingszeiten flexibel, 24/7.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch md:mt-20">
          {mockPlans.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl p-8 shadow-[0_18px_40px_-18px_rgba(33,29,27,0.35)] ${
                p.highlight ? "bg-[#211d1b] text-[#f7f5f1] lg:-mt-3 lg:mb-3" : "bg-[#f7f5f1] text-foreground"
              }`}
            >
              {p.badge && (
                <span
                  className={`absolute top-5 right-5 rounded-full px-4 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.28em] ${
                    p.highlight ? "bg-[#e8dfcd] text-[#3b2a20]" : "bg-[#211d1b] text-[#f7f5f1]"
                  }`}
                >
                  {p.badge}
                </span>
              )}
              <p className={`mt-6 text-xs uppercase tracking-[0.2em] ${p.highlight ? "text-[#f7f5f1]/75" : "text-muted-foreground"}`}>
                <span className="font-bold">{p.perWeek}</span> Pro Woche
              </p>
              <h2 className="mt-8 text-4xl font-semibold tracking-tight">{p.name}</h2>
              <p className={`mt-3 text-base font-light ${p.highlight ? "text-[#f7f5f1]/80" : "text-muted-foreground"}`}>{p.tagline}</p>

              <p className={`mt-8 h-5 text-sm line-through ${p.highlight ? "text-[#f7f5f1]/60" : "text-muted-foreground"}`}>
                {p.oldPrice ?? <span className="no-underline">–</span>}
              </p>
              <p className="flex flex-nowrap items-baseline gap-2">
                <span className="text-5xl font-light tracking-tight tabular-nums lg:text-4xl 2xl:text-6xl">{p.price}</span>
                <span className={`whitespace-nowrap text-sm font-light ${p.highlight ? "text-[#f7f5f1]/80" : "text-muted-foreground"}`}>€ / Monat</span>
              </p>

              <hr className={`mt-8 border-0 border-t ${p.highlight ? "border-white/20" : "border-border"}`} />
              <ul className="mt-8 flex-1 space-y-4">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-base leading-snug font-light">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span className={p.highlight ? "text-[#f7f5f1]/90" : "text-foreground/80"}>{f}</span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                to="/mitgliedschaft"
                variant={p.highlight ? "sand" : "primary"}
                className={`mt-10 w-full font-bold ${p.highlight ? "bg-[#e8dfcd] text-[#3b2a20] hover:bg-[#e8dfcd]/90" : ""}`}
              >
                Mitglied werden <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
              </ButtonLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
