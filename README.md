# asimwaheed.com

Personal website for [Asim Waheed](https://asimwaheed.com). Built with Astro —
static output, no client-side JavaScript — and deployed on Cloudflare Pages.

## Development

Requires Node.js >= 24 and [pnpm](https://pnpm.io). The pnpm version is pinned
via the `packageManager` field in `package.json`; `corepack enable` will use it
automatically, or install pnpm globally (`npm i -g pnpm`).

```zsh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run dev      # dev server at http://localhost:4321
pnpm run build    # production build to dist/
pnpm run test     # Vitest (build tests need dist/ — run build first)
pnpm run ci       # full local CI: lint, format, markdownlint, typecheck, build, test
```

Content lives in `src/content/` (work timeline as Markdown, publications as JSON);
layout and components in `src/layouts/` and `src/components/`; design tokens in
`src/styles/tokens.css`. Tests in `tests/` assert against both `src/lib/` logic
and the built HTML in `dist/`.

## CI & Security

GitHub Actions run lint/typecheck/build/test, `pnpm audit`, CodeQL, and dependency
review on every PR, plus a weekly scheduled audit. Dependabot opens grouped weekly
update PRs; minor/patch updates auto-merge once CI passes. Actions are pinned to
commit SHAs, and HTTP security headers ship via `public/_headers`.

## License

Code is MIT-licensed. Site content — prose, publications data, photographs,
signature, and CV — is copyright Asim Waheed, all rights reserved.
See [LICENSE](LICENSE).
