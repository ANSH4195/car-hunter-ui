# Work Log — car-hunter-ui

Engineering log for the React migration of the Car Hunter Streamlit app.
Format: reverse-chronological sessions. Each entry covers goal, actions taken, blockers, decisions, and next steps.

---

## 2026-05-08 — Session 1: Scaffold + shadcn Init (Chunk 1)

**Goal:** Bootstrap the React project from the starter template, wire up Vite config, path aliases, and shadcn — so the repo builds cleanly and we have a component foundation to build on.

### Actions taken

1. **Installed global tooling** — `pnpm` (package manager enforced by starter) and `degit` (zero-history template clone) via npm global install.
2. **Cloned starter** — `degit ANSH4195/vite-tailwind-biome-starter car-hunter-ui`. Stack: React 19 + TypeScript + Vite 7 (SWC) + Tailwind CSS 4 + Biome 2.
3. **Git init** — initialized repo, set remote to `https://github.com/ANSH4195/car-hunter-ui.git`, made initial commit.
4. **Installed dependencies** — ran `pnpm install`. Encountered build script block (see Blocker 1 below).
5. **Vite config** — added `base: '/car-hunter-ui/'` (GitHub Pages subpath) and `resolve.alias` for `@/*` → `./src/*`.
6. **tsconfig.app.json** — added `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }` to match Vite alias.
7. **Added `@types/node`** — required for `path.resolve(__dirname, ...)` in vite.config.ts.
8. **Ran `pnpm run build`** — clean. TypeScript + Vite both pass with new config.
9. **shadcn init** — ran `pnpm dlx shadcn@latest init --defaults`. See Blocker 2.
10. **Manual scaffolding** — created `src/lib/utils.ts` (the `cn()` helper shadcn expects), `src/lib/`, `src/components/ui/`, `src/hooks/` directories.
11. **CSS variables** — wrote Tailwind v4-compatible `index.css` with shadcn neutral theme (oklch colour space, `@theme inline` block).

### Blockers

**B1 — pnpm 11 build script security model**
- _What:_ pnpm 11 blocks all native build scripts (`@swc/core`, `@tailwindcss/oxide`, `esbuild`) by default. `pnpm install` succeeds but `pnpm run build` fails because it re-runs install which exits 1.
- _Resolution:_ `pnpm approve-builds --all` writes approval to `.npmrc`. Ran once; subsequent installs are unblocked.
- _Why this exists:_ pnpm 10+ introduced an explicit build-script allowlist to prevent supply-chain attacks via postinstall scripts. The `onlyBuiltDependencies` field in package.json does not retroactively approve already-resolved packages — `approve-builds` is the correct gate.

**B2 — shadcn init partial failure + interactive re-run**
- _What:_ `shadcn@latest init --defaults` chose style `base-nova` (new default using `@base-ui/react` instead of radix-ui). All npm packages installed successfully, but the process errored before writing `src/lib/utils.ts` because `msw` (a shadcn dep) triggered another build-script block. On re-run, shadcn prompted interactively ("overwrite components.json?") — not scriptable.
- _Resolution:_ Manually created `src/lib/utils.ts` with the standard `cn()` helper (`clsx` + `tailwind-merge`). Manually wrote `src/index.css` with the neutral oklch theme and `@theme inline` block that Tailwind v4 requires. `components.json` was already written correctly by the first run.
- _Decision:_ Kept `base-nova` style (uses `@base-ui/react`). The migration doc says "style: default" which referred to the shadcn default at time of writing; `base-nova` is the current default and functionally equivalent for the components we need (Card, Button, Sheet, Select, Dialog, Badge).

### Decisions

| Decision | Rationale |
|----------|-----------|
| Keep `base-nova` shadcn style | It's the current shadcn default; `@base-ui/react` is the same Radix maintainers' next-gen library. No functional difference for our component set. |
| Write CSS variables manually rather than re-running shadcn init | Re-running shadcn init requires interactive input and risks overwriting the already-correct `components.json`. Faster and more reliable to write the 60-line CSS block directly. |
| Use oklch colour space in CSS | shadcn v2+ ships oklch by default; wider gamut, easier to reason about lightness. No change to component authoring. |

### State at end of session

- [x] Repo bootstrapped and on `main`
- [x] Vite config: base path + path alias
- [x] tsconfig: path alias wired
- [x] shadcn: `components.json` written, `src/lib/utils.ts` created, CSS variables in `index.css`
- [x] `pnpm run build` passes cleanly
- [ ] `@supabase/supabase-js` not yet installed (interrupted — user paused to add this log)
- [ ] shadcn components (Card, Button, Sheet, Select, Dialog, Badge) not yet added
- [ ] `src/lib/supabase.ts` not yet created
- [ ] `src/hooks/useListings.ts` not yet created

### Next steps (Chunk 2 — Data layer)

1. `pnpm add @supabase/supabase-js`
2. Create `src/lib/supabase.ts`
3. Create `src/hooks/useListings.ts` with `Listing` type, `useListings()`, `hide()`, `remove()`
4. Wire `.env.local` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
5. Smoke-test: `console.log` listing count in `App.tsx`, verify network call in browser

---

_Log maintained by Claude (claude-sonnet-4-6) on behalf of Shri._
