# asimwaheed.com

Personal website for [Asim Waheed](https://asimwaheed.com). Built with Astro —
static output, no client-side JavaScript — and deployed on Cloudflare Pages.

## Development

Requires Node.js >= 24 and [pnpm](https://pnpm.io). The Node major is pinned in
`.nvmrc` (`nvm use` picks it up, and CI reads the same file); the pnpm version is
pinned via the `packageManager` field in `package.json`, so `corepack enable`
will use it automatically, or install pnpm globally (`npm i -g pnpm`).

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

GitHub Actions run lint/typecheck/build/test and `pnpm audit` on every push and PR,
with dependency review on PRs and CodeQL when JS/TS/Astro source changes. Dependabot
opens grouped weekly update PRs; minor/patch updates auto-merge once CI passes.
Actions are pinned to commit SHAs (enforced by the repository's SHA-pinning setting),
and HTTP security headers ship via `public/_headers`.

## License

Code is MIT-licensed; see [LICENSE](LICENSE). Site content — prose, publications
data, photographs, signature, and CV — is copyright Asim Waheed, all rights
reserved, as recorded in [NOTICE](NOTICE).
