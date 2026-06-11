import { existsSync } from "node:fs";
import { join } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import {
  DIST,
  PAGES,
  assertDistExists,
  internalHrefResolves,
  loadPage,
} from "./helpers";

beforeAll(() => {
  assertDistExists();
});

describe.each(PAGES)("$route", ({ file }) => {
  it("every internal link resolves to a built file", () => {
    const document = loadPage(file);
    for (const anchor of document.querySelectorAll("a[href]")) {
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/")) continue;
      expect(internalHrefResolves(href), `broken link: ${href}`).toBe(true);
    }
  });

  it("every external link opens safely (noopener noreferrer)", () => {
    const document = loadPage(file);
    for (const anchor of document.querySelectorAll("a[href]")) {
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("http")) continue;

      const rel = anchor.getAttribute("rel") ?? "";
      expect(rel, `missing noopener: ${href}`).toContain("noopener");
      expect(rel, `missing noreferrer: ${href}`).toContain("noreferrer");
    }
  });
});

describe("site-level artifacts", () => {
  it.each([
    "sitemap-index.xml",
    "robots.txt",
    "favicon.svg",
    "favicon.ico",
    "favicon-96x96.png",
    "apple-touch-icon.png",
    "site.webmanifest",
    "web-app-manifest-192x192.png",
    "web-app-manifest-512x512.png",
    "_headers",
    "404.html",
  ])("dist/%s exists", (artifact) => {
    expect(existsSync(join(DIST, artifact))).toBe(true);
  });
});
