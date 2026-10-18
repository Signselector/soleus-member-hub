import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/landingpage-embed")({
  head: () => ({ meta: [{ title: "Landingpage Embed — SOLEUS Admin" }] }),
  component: Embed,
});

const PREVIEW = "https://publicbooking.soleus.at/public-booking";
const SRC = `${PREVIEW}?embed=1`;
const SNIPPET = `<iframe
  id="soleus-booking"
  src="${SRC}"
  width="100%"
  height="520"
  style="border:none; display:block; width:100%; max-width:1024px; margin:0 auto; background:transparent;"
  allowtransparency="true"
  loading="lazy"
  scrolling="no"
  title="Probetraining buchen"
></iframe>
<script>
  // Passt die Höhe automatisch an den Inhalt an.
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "soleus-booking-resize") {
      var f = document.getElementById("soleus-booking");
      if (f && typeof e.data.height === "number") f.style.height = e.data.height + "px";
    }
  });
</script>`;
const UTM = `${SRC}&utm_source=meta&utm_campaign=spring2026&utm_ad=ad123`;

const HINTS: React.ReactNode[] = [
  <>Verwende immer die Produktions-URL <strong>publicbooking.soleus.at</strong>. Vorschau-/Preview-Links sind passwortgeschützt und zeigen einen Sign-in-Wall.</>,
  <>Alle Buchungen werden als Probetraining auf den System-User „ProbetrainingLandingpage" erfasst.</>,
  <>Die echten Kundendaten (Name, Telefon, E-Mail) sind in der Buchungsliste sichtbar.</>,
  <>Du erhältst nach jeder Buchung eine E-Mail-Benachrichtigung an <strong>office@soleus.at</strong>.</>,
  <>Spam-Schutz: Honeypot + 3 Buchungen pro IP/Stunde.</>,
  <>Mindestens 24 Stunden Vorlauf, max. 3 Wochen im Voraus buchbar.</>,
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-6 shadow-[0_18px_40px_-26px_rgba(33,29,27,0.35)] md:p-8">
      <h2 className="text-xl font-light tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* clipboard unavailable: select the code manually */
        }
      }}
      className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#211d1b] px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[#f7f5f1]"
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" strokeWidth={1.5} />} {done ? "Kopiert" : label}
    </button>
  );
}

function Embed() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="System" title="Landingpage Embed" intro="Code zum Einbetten der öffentlichen Buchungsseite auf einer externen Landingpage." />
      <div className="space-y-5 pt-4">
        <Card title="Vorschau-Link">
          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-muted px-4 py-3 font-mono text-sm">{PREVIEW}</code>
            <a href={PREVIEW} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-foreground/15 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary"><ExternalLink className="h-4 w-4" strokeWidth={1.5} /> Öffnen</a>
          </div>
        </Card>

        <Card title="iframe-Code">
          <textarea readOnly value={SNIPPET} aria-label="iframe-Code" rows={12} className="w-full resize-y rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed focus:outline-none" />
          <div className="mt-4"><CopyBtn text={SNIPPET} label="iframe-Code kopieren" /></div>
        </Card>

        <Card title="UTM-Tracking (optional)">
          <p className="text-sm text-muted-foreground">Hänge UTM-Parameter an den iframe-Link an, um die Kampagne pro Buchung mitzuerfassen:</p>
          <code className="mt-4 block break-all rounded-lg bg-muted px-4 py-3 font-mono text-sm">{UTM}</code>
          <p className="mt-3 text-xs text-muted-foreground">Erfasste Parameter: <code className="font-mono">utm_source</code>, <code className="font-mono">utm_campaign</code>, <code className="font-mono">utm_ad</code></p>
        </Card>

        <Card title="Hinweise">
          <ul className="space-y-3 text-sm leading-relaxed text-foreground/80">
            {HINTS.map((h, i) => (
              <li key={i} className="flex gap-3"><span aria-hidden>•</span><span>{h}</span></li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
