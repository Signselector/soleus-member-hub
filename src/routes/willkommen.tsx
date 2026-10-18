import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Eyebrow } from "@/components/ui-soleus/primitives";

export const Route = createFileRoute("/willkommen")({
  head: () => ({
    meta: [
      { title: "Willkommen — SOLEUS" },
      { name: "description", content: "Wähle, wie du SOLEUS kennenlernen möchtest." },
      { property: "og:title", content: "Willkommen — SOLEUS" },
      { property: "og:description", content: "Wähle, wie du SOLEUS kennenlernen möchtest." },
    ],
  }),
  component: Welcome,
});

const options = [
  {
    to: "/probetraining",
    label: "Probetraining",
    title: "Kostenloses Probetraining",
    text: "Lerne das Private Gym in Ruhe kennen — eine Session, unverbindlich und ohne Kosten.",
    cta: "Probetraining starten",
    dark: true,
  },
  {
    to: "/mitglied-werden",
    label: "Mitgliedschaft",
    title: "Mitglied werden",
    text: "Wähle deine Mitgliedschaft und buche ab sofort deine Trainingszeiten.",
    cta: "Mitglied werden",
    dark: false,
  },
] as const;

function Welcome() {
  return (
    <div className="min-h-screen bg-secondary">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-6 pb-12 md:px-10 md:pb-16">
        <div className="mt-12 grid animate-rise gap-8 md:mt-20 md:grid-cols-2 md:items-start md:gap-16">
          <div>
            <Eyebrow>Willkommen bei SOLEUS</Eyebrow>
            <h1 className="mt-5 text-4xl leading-[1.1] font-light tracking-tight md:text-6xl">
              Wie möchtest du SOLEUS kennenlernen?
            </h1>
          </div>
          <p className="max-w-md text-base leading-relaxed font-light text-muted-foreground md:mt-10">
            Starte mit einer kostenlosen Session oder wähle direkt deine Mitgliedschaft — du entscheidest, wie du SOLEUS erleben möchtest.
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-5 md:mt-20">
          {options.map((o) => (
            <Link
              key={o.to}
              to={o.to}
              className={`group flex flex-col gap-6 rounded-2xl p-6 shadow-[0_18px_40px_-18px_rgba(33,29,27,0.35)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-18px_rgba(33,29,27,0.45)] md:flex-row md:items-center md:gap-10 md:px-10 md:py-9 ${
                o.dark ? "bg-[#211d1b] text-[#f7f5f1]" : "bg-[#f7f5f1] text-foreground"
              }`}
            >
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] md:w-44 md:shrink-0">{o.label}</span>
              <span className={`hidden h-14 w-px md:block ${o.dark ? "bg-white/20" : "bg-foreground/15"}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{o.title}</h2>
                <p className={`mt-2 max-w-md text-sm font-light leading-relaxed ${o.dark ? "text-[#f7f5f1]/75" : "text-muted-foreground"}`}>
                  {o.text}
                </p>
              </div>
              <span className="flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.2em]">
                {o.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" strokeWidth={1.5} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
