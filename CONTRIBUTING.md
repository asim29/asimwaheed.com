# Contributing

## PR titles are required to follow Conventional Commits

This is not a style preference. PRs here are **squash-merged**, so the PR title becomes the commit
subject on `main` verbatim. A vague title is permanent.

```text
type(scope): imperative summary
```

- **type** — one of `feat`, `fix`, `chore`, `ci`, `docs`, `refactor`, `test`. Required.
- **scope** — optional, lowercase, in parentheses. `deps`, `content`, `css`, `a11y`.
- **summary** — imperative mood ("add", not "added" or "adds"), lowercase, no trailing period.
- Keep the whole title under 72 characters.

```text
feat: add publications filter by year
fix(css): stop timeline markers drifting off the axis
chore(deps): bump astro to 7.2
docs: trim CLAUDE.md
```

Not acceptable:

```text
Add RFC 9116 security.txt        # no type
updates                          # no type, not imperative, says nothing
fix: Fixed the thing.            # past tense, capitalised, trailing period
```

Note that a CSS or copy change takes the type matching its **intent** — `feat`, `fix`, or
`refactor`. Conventional Commits reserves `style` for code formatting, so it does not mean
"visual change" here and is left out of the list above to avoid the trap.

Dependabot generates its own `Bump …` titles and is exempt.

## Before opening a PR

Run `pnpm run ci`. It must pass — it is the same gate `main` requires.
