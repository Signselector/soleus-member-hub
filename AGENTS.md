<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS

- Mock data lives only in `src/lib/mock-data.ts`; components import from it so a real backend can replace it later.
- Mock auth/user state (guest / new / member, booking case, access) lives in `src/lib/auth-state.tsx` context; swap for real auth when backend arrives.
- Brand UI primitives (Button, Field, Eyebrow, Wordmark) live in `src/components/ui-soleus/` — reuse them instead of shadcn defaults to keep the SOLEUS look.
- Member pages wrap content in `MemberShell` (desktop top nav + mobile bottom nav) so the app works as a wrapped mobile app later.
