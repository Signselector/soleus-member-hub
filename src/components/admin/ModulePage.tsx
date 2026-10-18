import { ADMIN_MODULES } from "@/lib/admin/modules";
import { Chip, PageHeader } from "@/components/admin/ui";

/** Placeholder for admin modules that are in the navigation but not rebuilt yet. */
export function ModulePage({ slug }: { slug: string }) {
  const m = ADMIN_MODULES.find((x) => x.slug === slug);
  if (!m) return null;
  return (
    <div className="space-y-10">
      <PageHeader eyebrow={m.group} title={m.label} intro={m.description} actions={<Chip t={m.planned ? "line" : "soft"}>{m.planned ? "Geplant" : "In Vorbereitung"}</Chip>} />
      <div className="rounded-2xl border border-dashed border-border px-6 py-14 md:px-10">
        <p className="text-base font-light text-muted-foreground">
          {m.planned ? "Dieses Modul ist vorgesehen und wird zu einem späteren Zeitpunkt umgesetzt." : "Dieser Bereich des bisherigen Adminportals wird als Nächstes in das neue Design überführt."}
        </p>
        {m.migration && (
          <div className="mt-8 max-w-xl border-t border-border pt-6">
            <p className="eyebrow text-[0.625rem]">Hinweis zur Migration</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">{m.migration}</p>
          </div>
        )}
      </div>
    </div>
  );
}
