import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseHTML } from "linkedom";

export const DIST = fileURLToPath(new URL("../../dist", import.meta.url));

export const SITE_URL = "https://asimwaheed.com";

/** Every page the build is expected to produce, with its canonical title. */
export const PAGES = [
  { route: "/", file: "index.html", title: "Asim Waheed" },
  { route: "/work/", file: "work/index.html", title: "Work" },
  {
    route: "/publications/",
    file: "publications/index.html",
    title: "Publications",
  },
  {
    route: "/collaborate/",
    file: "collaborate/index.html",
    title: "Collaborate",
  },
  { route: "/404", file: "404.html", title: "Page Not Found" },
] as const;

export function assertDistExists(): void {
  if (!existsSync(DIST)) {
    throw new Error(
      "dist/ not found — run `pnpm run build` before `pnpm run test`."
    );
  }
}

export function loadPage(file: string): Document {
  const html = readFileSync(join(DIST, file), "utf-8");
  const { document } = parseHTML(html);
  return document;
}

/** Resolves an internal href (e.g. "/work" or "/cv/foo.pdf") against dist/. */
export function internalHrefResolves(href: string): boolean {
  const path = href.split("#")[0].split("?")[0];
  if (path === "" || path === "/") {
    return existsSync(join(DIST, "index.html"));
  }

  const rel = path.startsWith("/") ? path.slice(1) : path;
  const candidates = [
    join(DIST, rel),
    join(DIST, rel, "index.html"),
    join(DIST, `${rel}.html`),
  ];
  return candidates.some((candidate) => existsSync(candidate));
}
