import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import { DIST, PAGES, assertDistExists, loadPage } from "./helpers";
import { THEME_COLORS } from "../../src/constants/theme";

const HEADERS = readFileSync(
  fileURLToPath(new URL("../../public/_headers", import.meta.url)),
  "utf-8"
);

/** Retired palette values. None may survive anywhere in the built output. */
const RETIRED_HEXES = [
  "#f7f8fa", // mist grey — the old page background
  "#1e293b", // deep slate
  "#d1d5db", // ash
  "#374151", // charcoal
  "#2646a6", // midnight blue fill
  "#1e326f", // midnight blue text
  "#13837f", // teal fill
  "#0f6865", // teal text
  "#f2b441", // amber fill
  "#6c511d", // amber text
  "#c94964", // raspberry fill
  "#96364b", // raspberry text
  "#1a6342", // emerald
  "#ad2c2c", // crimson
];

function cspOf(headers: string): string {
  const line = headers
    .split("\n")
    .find((l) => l.includes("Content-Security-Policy:"));
  if (!line) throw new Error("public/_headers declares no CSP");
  return line;
}

beforeAll(() => {
  assertDistExists();
});

describe("theme init script", () => {
  // The script is inline and synchronous so a stored theme applies before the
  // first paint. That only works if the CSP admits it, and a CSP hash covers the
  // exact bytes — so any edit to the script silently blocks it in production
  // unless the hash moves too. This test is what makes that safe to touch.
  it.each(PAGES)("$route ships exactly one inline script", ({ file }) => {
    const document = loadPage(file);
    const inline = [...document.querySelectorAll("script")].filter(
      (s) => !s.getAttribute("src")
    );
    expect(inline).toHaveLength(1);
  });

  it("has its sha256 allowlisted in the CSP", () => {
    const document = loadPage("index.html");
    const script = [...document.querySelectorAll("script")].find(
      (s) => !s.getAttribute("src")
    );
    const text = script?.textContent ?? "";
    expect(text).not.toBe("");

    const digest = createHash("sha256").update(text, "utf8").digest("base64");
    const csp = cspOf(HEADERS);

    expect(
      csp.includes(`'sha256-${digest}'`),
      `The inline theme script is not allowlisted. Add this to script-src in ` +
        `public/_headers:\n\n  'sha256-${digest}'\n`
    ).toBe(true);
  });

  it("keeps the CSP free of unsafe-inline for scripts", () => {
    // A hash is the point: falling back to 'unsafe-inline' would admit any
    // injected script, which is a real loss on a site that renders markdown.
    const csp = cspOf(HEADERS);
    const scriptSrc = csp.slice(csp.indexOf("script-src"));
    const end = scriptSrc.indexOf(";");
    expect(end === -1 ? scriptSrc : scriptSrc.slice(0, end)).not.toContain(
      "unsafe-inline"
    );
  });
});

describe("theme colour meta", () => {
  it.each(PAGES)("$route declares both theme-color variants", ({ file }) => {
    const document = loadPage(file);
    const metas = [...document.querySelectorAll('meta[name="theme-color"]')];

    const byScheme = new Map(
      metas.map((m) => [m.getAttribute("media"), m.getAttribute("content")])
    );

    expect(byScheme.get("(prefers-color-scheme: light)")).toBe(
      THEME_COLORS.light
    );
    expect(byScheme.get("(prefers-color-scheme: dark)")).toBe(
      THEME_COLORS.dark
    );
  });

  it("web manifest colours match the theme constants", () => {
    const manifest = JSON.parse(
      readFileSync(join(DIST, "site.webmanifest"), "utf-8")
    ) as { theme_color: string; background_color: string };

    expect(manifest.background_color).toBe(THEME_COLORS.light);
    expect(manifest.theme_color).toBe(THEME_COLORS.light);
  });
});

describe("theme toggle", () => {
  it.each(PAGES)("$route renders a labelled toggle", ({ file }) => {
    const document = loadPage(file);
    const toggle = document.querySelector("[data-theme-toggle]");

    expect(toggle).not.toBeNull();
    expect(toggle?.tagName.toLowerCase()).toBe("button");
    expect(toggle?.getAttribute("aria-label")).toBeTruthy();
  });
});

describe("retired palette", () => {
  // Scoped to markup and stylesheets: the favicon is a base64 payload where a
  // six-character run could match by chance, and the leading '#' is what keeps
  // this from firing on one.
  it.each(RETIRED_HEXES)("%s appears nowhere in the build", (hex) => {
    const offenders = [...PAGES.map(({ file }) => join(DIST, file))]
      .concat(cssFiles())
      .filter((path) =>
        readFileSync(path, "utf-8").toLowerCase().includes(hex.toLowerCase())
      );

    expect(offenders).toEqual([]);
  });
});

function cssFiles(): string[] {
  const dir = join(DIST, "_astro");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => join(dir, name));
}
