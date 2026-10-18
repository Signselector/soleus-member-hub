import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/layout/MemberShell";
import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/buchen")({
  head: () => ({
    meta: [
      { title: "Training buchen — SOLEUS" },
      { name: "description", content: "Die Buchung deiner Trainingszeiten folgt in Phase 2." },
      { property: "og:title", content: "Training buchen — SOLEUS" },
      { property: "og:description", content: "Die Buchung deiner Trainingszeiten folgt in Phase 2." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Buchen" title="Training buchen" text="Die Buchung deiner Trainingszeiten folgt in Phase 2." back="/home" />;
  return <MemberShell>{content}</MemberShell>;
}
