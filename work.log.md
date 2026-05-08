# Work Log — car-hunter-ui

Engineering log for the React migration of the Car Hunter Streamlit app.
Format: reverse-chronological sessions. Each entry covers goal, actions taken, blockers, decisions, and next steps.

---

## 2026-05-08 — Session 2: Data Layer (Chunk 2)

**Goal:** Install Supabase, create the typed data hook, and verify a real network call works end-to-end before building any UI.

### Actions taken

1. **`pnpm add @supabase/supabase-js`** — added v2.105.3.
2. **`src/lib/supabase.ts`** — `createClient` wired to `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Env vars prefixed `VITE_` so Vite exposes them to the browser bundle.
3. **`src/hooks/useListings.ts`** — `Listing` type derived directly from `schema.sql` (not the migration doc, which was missing the `state` column added in a later migration). `useListings()` hook with `hide()` (soft-delete) and `remove()` (hard-delete). Optimistic local state update on both — removes the row from state immediately rather than waiting for a re-fetch.
4. **`src/App.tsx`** — replaced placeholder with smoke-test: shows loading state, error state, and listing count. Will be replaced by full grid in Chunk 4.
5. **`.env.example`** — committed as template; `.env.local` stays git-ignored via `*.local` in `.gitignore`.
6. **Biome config migration** — `biome.json` was on schema v1.8.2, CLI is v2.2.5. Ran `biome migrate --write` which moved `organizeImports` → `assist.actions.source.organizeImports`.
7. **Biome CSS override** — added `overrides` block to disable `noUnknownAtRules` for CSS files. See Blocker 1.

### Blockers

**B1 — Biome flagging Tailwind v4 at-rules as unknown**
- _What:_ Biome lint rule `suspicious/noUnknownAtRules` errors on `@custom-variant` and `@theme inline`, which are Tailwind v4-specific at-rules not in the CSS spec and therefore not in Biome's allowlist.
- _Resolution:_ Added `overrides` in `biome.json` to turn off `noUnknownAtRules` for `**/*.css`. This is intentional and scoped — TS/JS files are unaffected.
- _Why not suppress per-line:_ The two at-rules are at the top of `index.css` and will never be removed; a blanket CSS override is cleaner than two `biome-ignore` comments.

**B2 — `Listing` type mismatch with migration doc**
- _What:_ The migration doc's `useListings.ts` snippet was missing the `state text` column that was added in a later migration (`schema.sql` line 15). Using the doc verbatim would have caused a runtime type gap — the DB returns `state` but TypeScript wouldn't know about it.
- _Resolution:_ Read `schema.sql` directly and derived the type from it. Added `state: string | null` to the `Listing` type.

### Decisions

| Decision | Rationale |
|----------|-----------|
| Derive `Listing` type from `schema.sql`, not migration doc | Source of truth is the schema file; the doc is guidance, not spec |
| Optimistic local state update on hide/remove | Avoids a full re-fetch round-trip; fast UX; fine for a personal tool where concurrent edits are impossible |
| `error` field returned from hook | Surfaces DB errors in the UI rather than silently showing an empty list |

### State at end of session

- [x] `@supabase/supabase-js` installed
- [x] `src/lib/supabase.ts` — client ready
- [x] `src/hooks/useListings.ts` — typed hook with hide/remove
- [x] `src/App.tsx` — smoke-test wired
- [x] `pnpm run lint` clean
- [x] `pnpm run build` clean
- [ ] shadcn UI components not yet added (Card, Button, Sheet, Select, Dialog, Badge)
- [ ] CarCard component not built
- [ ] Layout + grid not built
- [ ] Filter bar not built

### Next steps (Chunk 3 — CarCard)

1. `pnpm dlx shadcn@latest add card button badge dialog`
2. Build `src/components/CarCard.tsx` — all fields, hide/delete buttons, image thumbnail
3. Render a flat list of `CarCard` in `App.tsx`
4. `pnpm run lint && pnpm run build`

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
