# CLAUDE.md — asimwaheed.com

Static Astro site, zero client JS by default, deployed on Cloudflare Pages.
Scripts are in `package.json`. `pnpm run dev` serves localhost:4321; `pnpm run ci` runs the
full gate. Run `pnpm run ci` and resolve everything before asking to commit.

## Testing

Vitest. `tests/unit/` covers logic in `src/lib/` — extract nontrivial logic out of `.astro`
frontmatter so it is testable. `tests/build/` asserts against built HTML, so run `pnpm run build`
first; `tests/build/helpers.ts` holds the `PAGES` manifest, which needs updating when a page is
added.

`tokens.test.ts` and `theme.test.ts` guard drift that would otherwise ship silently, because CSS
fails quietly — an undefined custom property renders as nothing instead of erroring. They check
that hexes duplicated outside CSS still match `tokens.css`, that no stylesheet references an
undefined token, and that the CSP hash matches the built script.

## Dependencies

- Install with `--ignore-scripts` (`pnpm add -D --ignore-scripts`), then `pnpm audit`.
- Overrides live in `pnpm-workspace.yaml` under `overrides:` — pnpm no longer reads `pnpm.*`
  from `package.json`. `yaml` is pinned there for a security fix.
- `sharp` is a direct dependency, not just Astro's optional one: Astro's image optimization does
  a bare `import('sharp')` from a bundled chunk resolving at the project root, which npm's flat
  layout hoisted implicitly and pnpm's strict layout does not. Keep it aligned with Astro's
  `optionalDependencies.sharp` range.
- Node's major version is pinned in `.nvmrc`, read by CI and `nvm use`. Keep it consistent with
  the `engines.node` floor.
- Dependabot opens weekly grouped PRs and auto-merges minor/patch once CI passes. Its `npm`
  ecosystem reads `pnpm-lock.yaml`.

## Security

- Actions are pinned to full commit SHAs with a `# vX.Y.Z` comment; the repo setting rejects
  unpinned refs. Bump both the SHA and the comment.
- Workflows declare least-privilege `permissions:`. CI fails on `pnpm audit --audit-level high`.
- Headers are in `public/_headers`. `script-src` allowlists the SHA-256 of the single inline theme
  script instead of `'unsafe-inline'`. **The hash covers the script's bytes verbatim, so editing
  `THEME_INIT_SCRIPT` invalidates it and the theme silently stops applying in production.**
  `tests/build/theme.test.ts` recomputes it and fails with the replacement value.
- Self-hosted fonts need no CSP change — same origin under `font-src 'self'`, and their
  `@font-face` lands in an inline `<style>` already covered by `style-src`.

### Merge gate

The `main-required-checks` ruleset requires exactly one check, `ci` — the job id in
`.github/workflows/ci.yml`. GitHub matches required checks by string, so renaming that job
silently disables the gate: it waits on a check that never reports. For the same reason only a
check that runs on _every_ PR may be required, which is why path-filtered CodeQL stays advisory.

## Content

Lives in `src/content/`, schema in `src/content.config.ts`. Markdown pages in `src/pages/*.md`
set their layout via a `layout` frontmatter key.

`src/content/work/*.md` carries a `kind` field — `intro` renders above the timeline, `other`
below, `timeline` is an entry with `start`/`end`/`title`. Sorted descending by `end`.

## CSS

Consume tokens for every color, spacing, and typography value; no raw hex or magic numbers in
component CSS.

**`src/styles/tokens.css` is generated — never hand-edit it.** It is copied verbatim from
`BrandGuidelines/css/tokens.css`, itself emitted from OKLCH seeds by `BrandGuidelines/tools/palette`
with contrast verified. To change a color, edit the seed, regenerate with `--apply`, and re-copy
the file with its provenance header. It is in `.prettierignore` so re-copying never lands in diff.

Two token layers: primitive ramps (`50`→`950` on one perceptual lightness scale) and semantic
roles (`--color-text`, `--color-link`, …). **Consume roles, not ramp steps** — only roles carry
dark values, so referencing `--color-violet-800` opts out of the dark theme. The one sanctioned
exception is `::selection`, which pins `--color-slate-950` because amber is identical in both
themes and its ink must not flip.

**Colour means "interactive"; weight means "important".** Links take `--color-link`; `<strong>`
is weight-only. Content mixes `**word**` and `**[word](/link)**`, so colouring `strong` renders
identical markup two different ways and puts unclickable coloured words beside clickable ones.
The web palette therefore omits `--color-emphasis-text`, which is written for documents and slides
where nothing competes for colour.

**Orchid is currently unused here, and that is deliberate — do not add it back ad hoc.** Prose
emphasis, hairline rules, all-headings, and chrome were each built and rejected on review. A
proposal needs to be one sentence applicable to elements that don't exist yet, recur in a fixed
position on every page, and have enough visual mass to read as a hue.

Dark theme: `prefers-color-scheme` by default, overridden by `[data-theme]` on `<html>` from the
script in `src/constants/theme.ts`. Component CSS needs no light/dark branches. `color-scheme`
lives in `base.css` so native UI follows a pinned theme.

Not every literal is a defect — a one-off with no shared decision behind it beats a token used
once. Breakpoints stay literal: `var()` is invalid in a `@media` prelude.

Fonts are self-hosted by Astro's fonts API (`fonts` in `astro.config.mjs`), which subsets and
emits `@font-face` plus metric-matched fallbacks at build time. `src/styles/fonts.css` points the
font tokens at Astro's generated variables, kept out of the generated file on purpose.

## Astro

- One script exists: the theme initializer in `src/constants/theme.ts`, admitted because CSS has
  no storage and cannot persist a theme across page loads. It is dependency-free and degrades
  cleanly — `prefers-color-scheme` needs no JS, and the toggle stays hidden until the script
  reveals it. A second script means updating the CSP hash.
- `BaseLayout.astro` owns global HTML. Config lives in `src/constants/` — `site.ts` (nav, social,
  footer date), `aria.ts` (labels), `layout.ts` (values a template and a stylesheet must agree on).
- `site.webmanifest` is a build route (`src/pages/site.webmanifest.ts`), so its colors come from
  the same constant as the `theme-color` meta tags.
- Plain `.css` imported by a page is **not** scoped, so `:global()` is invalid there — it reaches
  the browser as an unknown pseudo-class and silently invalidates the whole rule. It belongs only
  in an `.astro` `<style>` block.

## Markdownlint

`.markdownlint.json` suppresses MD001, MD013, MD033, and MD041 because content files are HTML
fragments embedded in Astro pages, not standalone documents. Do not suppress more globally.

## Commit Policy

Never run `git commit` without explicit user approval. After `pnpm run ci` passes, stop and ask.
Do not add `Co-Authored-By: Claude` lines to commit messages.
