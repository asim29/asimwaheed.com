# asimwaheed.com

Personal website for Asim Waheed.

Built with Astro, using a static-first, zero-JS-by-default approach.
The site is intentionally minimal at this stage and will evolve incrementally.

---

## Philosophy

- Static-first
  No client-side JavaScript unless explicitly justified.

- Document-based routing
  Each route maps to a real HTML document.

- Layout-driven structure
  Global HTML structure lives in a single base layout.

- Content as data
  Page content will eventually live in Markdown or structured data, not hard-coded templates.

---

## Tech Stack

- Astro
- Node.js + npm
- Cloudflare Pages (deployment)

---

## Local Development (macOS)

### 1. Install prerequisites

This project assumes macOS and Homebrew.

```zsh
brew install node
```

Verify installation:

```zsh
node -v
npm -v
```

---

### 2. Install dependencies

From the project root:

```zsh
npm install
```

---

### 3. Run the dev server

```zsh
npm run dev
```

Astro will start a local development server at:

```zsh
http://localhost:4321
```

---

## Project Structure (current)

```text
/
├── public/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       └── index.astro
├── astro.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

---

## Key Files

```text
src/layouts/BaseLayout.astro
- Defines the canonical HTML document structure
- Owns <html>, <head>, and <body>

src/pages/index.astro
- Homepage content
- Uses BaseLayout
```

---

## Commands

Start local dev server

```zsh
npm run dev
```

Build static site to dist/

```zsh
npm run build
```

Preview production build locally

```zsh
npm run preview
```

---

## Status

Early bootstrap phase.

Current state:

- Astro initialized
- Layout abstraction in place
- Single homepage route
- No styling
- No client-side JavaScript
