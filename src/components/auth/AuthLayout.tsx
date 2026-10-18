import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Eyebrow, Wordmark } from "@/components/ui-soleus/primitives";

export function AuthLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-14 text-primary-foreground md:flex">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/atmosphere.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-primary/55" aria-hidden />
        <Wordmark light className="relative" />
        <div className="relative">
          <p className="max-w-sm text-4xl leading-[1.15] font-light tracking-tight lg:text-5xl">
            Dein Raum.
            <br />
            Deine Zeit.
            <br />
            Dein Training.
          </p>
          <p className="eyebrow mt-8 text-primary-foreground/75">Private Gym · Österreich</p>
        </div>
        <p className="eyebrow relative text-primary-foreground/75">© SOLEUS</p>
      </aside>

      <section className="flex flex-col px-6 py-8 md:px-16 md:py-14">
        <Link to="/login" className="md:hidden" aria-label="SOLEUS">
          <Wordmark />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14 animate-rise">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl leading-tight font-light tracking-tight md:text-5xl">{title}</h1>
          {intro && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>}
          <div className="mt-12">{children}</div>
        </div>
      </section>
    </div>
  );
}
