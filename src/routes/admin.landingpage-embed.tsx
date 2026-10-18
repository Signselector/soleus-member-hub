import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { PageHeader, Section } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/landingpage-embed")({
  head: () => ({ meta: [{ title: "Landingpage Embed — SOLEUS Admin" }] }),
  component: Embed,
});

const BOOKING_URL = "https://publicbooking.soleus.at/public-booking?embed=1";
const SNIPPET = `<iframe
  id="soleus-booking"
  src="${BOOKING_URL}"
  title="Probetraining buchen"
  loading="lazy"
  scrolling="no"
  style="display:block;width:100%;max-width:1024px;height:820px;border:0;margin:0 auto;background:transparent;"
></iframe>
<script>
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "soleus-booking-resize") {
      var f = document.getElementById("soleus-booking");
      if (f && typeof e.data.height === "number") f.style.height = e.data.height + "px";
    }
  });
</script>`;

function Embed() {
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: user can select the code manually */
    }
  };
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="System" title="Landingpage Embed" intro="Code zum Einbetten der öffentlichen Buchungsseite auf einer externen Landingpage." />
      <Section
        title="Einbettungscode"
        aside={
          <button type="button" onClick={copy} className="eyebrow inline-flex items-center gap-2 hover:text-foreground">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Kopiert" : "Kopieren"}
          </button>
        }
      >
        <pre className="overflow-x-auto rounded-2xl bg-[#211d1b] p-6 text-xs leading-relaxed text-[#f7f5f1]"><code>{SNIPPET}</code></pre>
        <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">
          Füge den Code an der Stelle der Landingpage ein, an der die Buchung erscheinen soll. Das Skript passt die Höhe automatisch an den Inhalt an.
        </p>
      </Section>
      <Section title="Vorschau">
        {preview ? (
          <iframe src={BOOKING_URL} title="Vorschau Buchungsseite" scrolling="no" className="block h-[820px] w-full max-w-[1024px] rounded-2xl border border-border bg-[#211d1b]" />
        ) : (
          <button type="button" onClick={() => setPreview(true)} className="h-11 rounded-full border border-foreground/15 px-7 text-[0.6875rem] font-medium uppercase tracking-[0.18em] hover:bg-secondary">Vorschau laden</button>
        )}
      </Section>
    </div>
  );
}
