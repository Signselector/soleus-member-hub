import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/ui-soleus/primitives";

/** Slim top bar for pre-member screens: translucent white over the sand background. */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-6 md:h-20 md:px-10">
        <Link to="/login" aria-label="SOLEUS">
          <Wordmark />
        </Link>
      </div>
    </header>
  );
}
