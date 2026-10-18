import { Eyebrow, ButtonLink } from "@/components/ui-soleus/primitives";

export function Placeholder({ eyebrow, title, text, back = "/home" }: { eyebrow: string; title: string; text: string; back?: string }) {
  return (
    <div className="max-w-xl animate-rise">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-5 text-4xl leading-tight font-light tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">{text}</p>
      <ButtonLink to={back} variant="outline" className="mt-12">Zurück</ButtonLink>
    </div>
  );
}
