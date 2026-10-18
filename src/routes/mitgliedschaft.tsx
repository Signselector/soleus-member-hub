import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/layout/MemberShell";
import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/mitgliedschaft")({
  head: () => ({
    meta: [
      { title: "Mitgliedschaft — SOLEUS" },
      { name: "description", content: "Details, Verlängerung und Rechnungen deiner Mitgliedschaft folgen in Phase 2." },
      { property: "og:title", content: "Mitgliedschaft — SOLEUS" },
      { property: "og:description", content: "Details, Verlängerung und Rechnungen deiner Mitgliedschaft folgen in Phase 2." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Abo" title="Mitgliedschaft" text="Details, Verlängerung und Rechnungen deiner Mitgliedschaft folgen in Phase 2." back="/home" />;
  return <MemberShell>{content}</MemberShell>;
}
