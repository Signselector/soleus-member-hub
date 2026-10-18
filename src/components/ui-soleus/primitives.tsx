import { Link } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const btnBase =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-8 text-[0.6875rem] font-medium uppercase tracking-[0.18em] transition-all duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  sand: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  outline: "border border-foreground/15 text-foreground hover:bg-secondary",
  ghost: "rounded-none text-foreground underline-offset-8 hover:underline px-0",
};

type V = keyof typeof variants;

export function Button({
  variant = "primary",
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V }) {
  return <button className={cn(btnBase, variants[variant], className)} {...p} />;
}

export function ButtonLink({
  to,
  search,
  variant = "primary",
  className,
  children,
}: {
  to: string;
  search?: Record<string, string>;
  variant?: V;
  className?: string;
  children: ReactNode;
}) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link to={to as any} search={search as any} className={cn(btnBase, variants[variant], className)}>
      {children}
    </Link>
  );
}

export function Field({
  label,
  id,
  ...p
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <label htmlFor={id} className="block">
      <span className="eyebrow">{label}</span>
      <input
        id={id}
        className="mt-2 block h-12 w-full border-0 border-b border-border bg-transparent px-0 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground focus:outline-none"
        {...p}
      />
    </label>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-border", className)} />;
}

/** Real soleus.at logo. `light` renders the white version for dark (espresso) surfaces. */
export function Wordmark({ className, light }: { className?: string; light?: boolean }) {
  if (light) {
    return <img src="/img/soleus-logo.png" alt="SOLEUS" className={cn("h-6 w-auto self-start object-contain object-left md:h-7", className)} />;
  }
  return (
    <span
      role="img"
      aria-label="SOLEUS"
      className={cn("block h-6 w-[7.5rem] bg-foreground md:h-7 md:w-[8.75rem]", className)}
      style={{
        WebkitMaskImage: "url(/img/soleus-logo.png)",
        maskImage: "url(/img/soleus-logo.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}
