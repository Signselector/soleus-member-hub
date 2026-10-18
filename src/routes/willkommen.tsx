import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Eyebrow, Wordmark } from "@/components/ui-soleus/primitives";

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
    no: "01",
    title: "Kostenloses Probetraining",
    text: "Lerne das Private Gym in Ruhe kennen — eine Session, unverbindlich und ohne Kosten.",
  },
  {
    to: "/mitglied-werden",
    no: "02",
    title: "Mitglied werden",
    text: "Wähle deine Mitgliedschaft und buche ab sofort deine Trainingszeiten.",
  },
] as const;

function Welcome() {
  return (
    <div className="min-h-screen bg-background px-6 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <Wordmark />
        <div className="mt-20 max-w-2xl animate-rise md:mt-32">
          <Eyebrow>Willkommen bei SOLEUS</Eyebrow>
          <h1 className="mt-5 text-4xl leading-[1.1] font-light tracking-tight md:text-6xl">
            Wie möchtest du SOLEUS kennenlernen?
          </h1>
        </div>
        <div className="mt-16 grid border-t border-border md:mt-24 md:grid-cols-2">
          {options.map((o, i) => (
            <Link
              key={o.to}
              to={o.to}
              className={`group flex flex-col justify-between gap-12 border-b border-border py-10 transition-colors hover:bg-sand md:min-h-80 md:p-10 ${i === 0 ? "md:border-r" : ""}`}
            >
              <span className="eyebrow">{o.no}</span>
              <div>
                <h2 className="text-sm font-medium uppercase tracking-[0.2em]">{o.title}</h2>
                <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">{o.text}</p>
                <ArrowRight className="mt-8 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" strokeWidth={1.25} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
