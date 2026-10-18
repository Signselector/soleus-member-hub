import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ButtonLink, Eyebrow } from "@/components/ui-soleus/primitives";

export const Route = createFileRoute("/zahlung")({
  head: () => ({
    meta: [
      { title: "Zahlung — SOLEUS" },
      { name: "description", content: "Weiterleitung zur sicheren Zahlung." },
    ],
  }),
  component: Page,
});

/** Placeholder: this is where the redirect to GoCardless happens once the API connection exists. */
function Page() {
  return (
    <div className="min-h-screen bg-secondary">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-28">
        <div className="max-w-xl animate-rise">
          <Eyebrow>Zahlung</Eyebrow>
          <h1 className="mt-5 text-4xl leading-tight font-light tracking-tight md:text-5xl">Weiterleitung zu GoCardless.</h1>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Hier wirst du künftig zur sicheren Zahlungsabwicklung bei GoCardless weitergeleitet. Die Anbindung folgt.
          </p>
          <ButtonLink to="/willkommen" variant="outline" className="mt-12">Zurück</ButtonLink>
        </div>
      </div>
    </div>
  );
}
