import { createFileRoute } from "@tanstack/react-router";

import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/mitglied-werden")({
  head: () => ({
    meta: [
      { title: "Mitglied werden — SOLEUS" },
      { name: "description", content: "Die Auswahl der Mitgliedschaften folgt in Phase 2." },
      { property: "og:title", content: "Mitglied werden — SOLEUS" },
      { property: "og:description", content: "Die Auswahl der Mitgliedschaften folgt in Phase 2." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Mitgliedschaft" title="Mitglied werden" text="Die Auswahl der Mitgliedschaften folgt in Phase 2." back="/willkommen" />;
  return <div className="min-h-screen bg-background px-6 py-20 md:px-10 md:py-32"><div className="mx-auto max-w-6xl">{content}</div></div>;
}
