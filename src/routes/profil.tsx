import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/layout/MemberShell";
import { Placeholder } from "@/components/member/Placeholder";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — SOLEUS" },
      { name: "description", content: "Persönliche Daten, Passwort und Einstellungen folgen in Phase 2." },
      { property: "og:title", content: "Profil — SOLEUS" },
      { property: "og:description", content: "Persönliche Daten, Passwort und Einstellungen folgen in Phase 2." },
    ],
  }),
  component: Page,
});

function Page() {
  const content = <Placeholder eyebrow="Account" title="Profil" text="Persönliche Daten, Passwort und Einstellungen folgen in Phase 2." back="/home" />;
  return <MemberShell>{content}</MemberShell>;
}
