import { createFileRoute } from "@tanstack/react-router";

import { PublicHeader } from "@/components/layout/PublicHeader";
import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/probetraining")({
  head: () => ({
    meta: [
      { title: "Kostenloses Probetraining — SOLEUS" },
      { name: "description", content: "Die Terminauswahl für dein Probetraining folgt in Phase 2." },
      { property: "og:title", content: "Kostenloses Probetraining — SOLEUS" },
      { property: "og:description", content: "Die Terminauswahl für dein Probetraining folgt in Phase 2." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Probetraining" title="Kostenloses Probetraining" text="Die Terminauswahl für dein Probetraining folgt in Phase 2." back="/willkommen" />;
  return (
    <div className="min-h-screen bg-secondary">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-28">{content}</div>
    </div>
  );
}
