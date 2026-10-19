import { createFileRoute } from "@tanstack/react-router";
import { MemberShell } from "@/components/layout/MemberShell";
import { PrivateGymBooking } from "@/components/booking/PrivateGymBooking";
import { Eyebrow } from "@/components/ui-soleus/primitives";

export const Route = createFileRoute("/buchen")({
  head: () => ({
    meta: [
      { title: "Private Gym buchen — SOLEUS" },
      { name: "description", content: "Wähle Datum und Uhrzeit für dein Private Gym. Buchbar bis 3 Wochen im Voraus, spätestens 12 Stunden vorher." },
      { property: "og:title", content: "Private Gym buchen — SOLEUS" },
      { property: "og:description", content: "Wähle Datum und Uhrzeit für dein Private Gym." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MemberShell>
      <div className="max-w-3xl animate-rise">
        <Eyebrow>Buchen</Eyebrow>
        <h1 className="mt-4 text-4xl leading-[1.05] font-light tracking-tight md:text-6xl">Private Gym buchen.</h1>
        <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-muted-foreground">Such dir Datum und Uhrzeit aus. Dein Training gehört dir allein.</p>
      </div>
      <PrivateGymBooking />
    </MemberShell>
  );
}
