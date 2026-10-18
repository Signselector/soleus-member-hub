import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { TrialBooking } from "@/components/booking/TrialBooking";

export const Route = createFileRoute("/probetraining")({
  head: () => ({
    meta: [
      { title: "Kostenloses Probetraining buchen — SOLEUS" },
      { name: "description", content: "Such dir dein Wunschdatum samt Uhrzeit aus." },
      { property: "og:title", content: "Kostenloses Probetraining buchen — SOLEUS" },
      { property: "og:description", content: "Such dir dein Wunschdatum samt Uhrzeit aus." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary text-primary-foreground">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        src="/video/atmosphere.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-primary/75" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(231,224,206,0.14) 0%, transparent 55%)" }}
        aria-hidden
      />

      <div className="relative z-10">
        <PublicHeader back="/willkommen" />
        <main className="mx-auto max-w-5xl px-4 pt-16 pb-24 sm:px-6 md:pt-24 md:pb-32">
          <div className="mx-auto max-w-3xl animate-rise text-center">
            <p className="text-[0.6875rem] uppercase tracking-[0.35em] text-primary-foreground/75">Probetraining</p>
            <h1 className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl lg:text-6xl">
              Kostenloses
              <br />
              <span className="text-primary-foreground/70">Probetraining buchen</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed font-light text-primary-foreground/75 md:text-base">
              Such dir dein Wunschdatum samt Uhrzeit aus.
            </p>
          </div>

          <TrialBooking />
        </main>
      </div>
    </div>
  );
}
