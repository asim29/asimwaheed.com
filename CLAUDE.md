# CLAUDE.md — asimwaheed.com

## Workflow

The primary commands are:

```zsh
npm run dev           # local dev server at localhost:4321
npm run check         # TypeScript + Astro type check (astro check)
npm run lint          # ESLint + Stylelint
npm run lint:fix      # ESLint + Stylelint with auto-fix
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only, used in CI)
npm run markdownlint  # markdownlint on all .md files
npm run markdownlint:fix  # markdownlint with auto-fix
npm run build         # production build to dist/
npm run ci            # full CI suite locally (lint + format:check + markdownlint + check + build)
```

Before every commit, run `npm run ci`. Resolve all errors before asking to commit.

## Dependency Management

- Use `npm install --save-dev --ignore-scripts` for new dev dependencies.
- Use `npm install --ignore-scripts` for new runtime dependencies.
- The `--ignore-scripts` flag prevents npm lifecycle scripts from running during install.
- After adding dependencies, run `npm audit` to check for vulnerabilities.

## Content Model

Content lives in `src/content/` as Markdown (`.md`) or JSON (`.json`) files.

### Markdown pages (`src/pages/*.md`)

Pages with YAML frontmatter. The `layout` key specifies the Astro layout:

```yaml
---
layout: ../layouts/BaseLayout.astro
title: Page Title
---
```

### Work timeline (`src/content/work/*.md`)

Each file has a `kind` frontmatter field:

- `kind: intro` — introductory prose rendered above the timeline
- `kind: other` — a section rendered below the timeline
- `kind: timeline` (or numeric prefix) — a timeline entry with `start`, `end`, `title` fields

Rendered by `src/pages/work.astro`. Sorted descending by `end` date.

### Publications (`src/content/publications/*.json`)

Schema defined in `src/content/config.ts`:

- `title`, `authors`, `venue`, `year` are required
- `links` is optional (`{ paper, arxiv, ... }`)

Rendered by `src/pages/publications.astro`.

## CSS Conventions

All design tokens live in `src/styles/tokens.css`. Every color, spacing, and typography value
should be consumed through these CSS custom properties — never write raw hex values or magic
numbers directly in component CSS.

The token layers are:

1. Raw palette (`--color-mist-grey`, `--space-4`, etc.)
2. Semantic roles (`--color-bg-default`, `--color-text-primary`, etc.)
3. Abstract accent slots (`--color-accent-1` through `--color-accent-4`)

When adding new styles, consume semantic roles or accent slots, not raw palette values.

## Astro Conventions

- Zero client-side JavaScript by default. Do not add `<script>` blocks or framework components
  without a clear justification.
- Layout structure is owned by `src/layouts/BaseLayout.astro`. Global HTML (`<html>`, `<head>`,
  `<body>`) lives there.
- Navigation and social links are configured in `src/constants/site.ts`.
- Aria labels for icon links are in `src/constants/aria.ts`.

## Markdownlint Config

Content markdown files (`src/content/`, `src/pages/`) are HTML fragments embedded in Astro
pages, not standalone documents. The global `.markdownlint.json` suppresses:

- `MD001` — heading increment (content files start with H3, not H1)
- `MD013` — line length (prose should not be hard-wrapped)
- `MD033` — inline HTML (legitimate in Astro content)
- `MD041` — first-line H1 (fragments do not need document-level structure)

Do not suppress additional rules globally. If a new content pattern conflicts with a rule,
evaluate whether the rule or the pattern should change.

## Commit Policy

Never run `git commit` without explicit user approval. After `npm run ci` passes, stop and ask.
Do not add `Co-Authored-By: Claude` lines to commit messages.
