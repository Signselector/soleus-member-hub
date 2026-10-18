import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/ui-soleus/primitives";

/** Slim top bar (optional "Zurück" link) for pre-member screens: translucent white over the sand background. */
export function PublicHeader({ back, wide }: { back?: "/willkommen" | "/login" | "/mitglied-werden"; wide?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 backdrop-blur-md">
      <div className={`mx-auto flex h-16 items-center justify-between px-6 md:h-20 md:px-10 ${wide ? "max-w-7xl" : "max-w-6xl"}`}>
        <Link to="/login" aria-label="SOLEUS">
          <Wordmark />
        </Link>
        {back && (
          <Link to={back} className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Zurück
          </Link>
        )}
      </div>
    </header>
  );
}
