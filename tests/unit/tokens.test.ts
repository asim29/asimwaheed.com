import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import astroConfig from "../../astro.config.mjs";
import { definedTokens, resolveColor, usedTokens } from "../../src/lib/tokens";
import { THEME_COLORS } from "../../src/constants/theme";

const SRC = fileURLToPath(new URL("../../src", import.meta.url));
const TOKENS_CSS = readFileSync(join(SRC, "styles/tokens.css"), "utf-8");
const FONTS_CSS = readFileSync(join(SRC, "styles/fonts.css"), "utf-8");

/** The custom properties Astro's fonts API emits, per astro.config.mjs. */
const FONT_VARIABLES = (astroConfig.fonts ?? []).map((f) => f.cssVariable);

/**
 * A miniature stand-in for tokens.css. The resolver is tested against this
 * rather than the real palette so that regenerating the palette upstream
 * cannot turn a resolver regression into a passing test, or a legitimate
 * colour change into a resolver failure.
 */
const FIXTURE = `
:root {
  /* a comment that must not be parsed as a declaration */
  --color-paper-50: #FAF5ED;
  --color-slate-950: #1E2A40;
  --color-violet-600: #AC00F8;
  --color-violet-800: #6F00A2;

  --color-bg: var(--color-paper-50);
  --color-emphasis-fill: var(--color-violet-800);
}

[data-theme="dark"] {
  --color-bg: var(--color-slate-950);
  --color-emphasis-fill: var(--color-violet-600);
}
`;

describe("resolveColor", () => {
  it("follows a var() chain to a literal hex", () => {
    expect(resolveColor(FIXTURE, "--color-bg", "light")).toBe("#FAF5ED");
  });

  it("returns a primitive that is already a literal unchanged", () => {
    expect(resolveColor(FIXTURE, "--color-paper-50", "light")).toBe("#FAF5ED");
  });

  it("reads the dark override rather than the :root value", () => {
    expect(resolveColor(FIXTURE, "--color-bg", "dark")).toBe("#1E2A40");
  });

  it("resolves a role whose two themes point at different ramp steps", () => {
    // Orchid emphasis: light and dark deliberately differ by more than
    // lightness, so a resolver that ignored the theme block would pass the
    // --color-bg cases above and still be wrong here.
    expect(resolveColor(FIXTURE, "--color-emphasis-fill", "light")).toBe(
      "#6F00A2"
    );
    expect(resolveColor(FIXTURE, "--color-emphasis-fill", "dark")).toBe(
      "#AC00F8"
    );
  });

  it("falls back to the :root value for a role the dark block omits", () => {
    expect(resolveColor(FIXTURE, "--color-violet-800", "dark")).toBe("#6F00A2");
  });

  it("throws naming the token when it is not defined", () => {
    expect(() => resolveColor(FIXTURE, "--color-nope", "light")).toThrow(
      "--color-nope"
    );
  });
});

describe("theme constants stay in step with tokens.css", () => {
  // The one place a palette value must be duplicated outside CSS: browser UI
  // chrome (<meta name="theme-color">) and the web manifest cannot read a CSS
  // custom property. This asserts the duplicate still matches its source, so
  // regenerating the palette upstream fails here instead of shipping silently.
  it.each(["light", "dark"] as const)(
    "THEME_COLORS.%s matches the resolved --color-bg",
    (theme) => {
      expect(THEME_COLORS[theme].toUpperCase()).toBe(
        resolveColor(TOKENS_CSS, "--color-bg", theme).toUpperCase()
      );
    }
  );
});

describe("every token the site consumes is defined", () => {
  function cssFilesUnder(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return cssFilesUnder(path);
      return extname(entry.name) === ".css" ? [path] : [];
    });
  }

  const defined = definedTokens(TOKENS_CSS);

  // Properties supplied from outside any stylesheet: one set inline by a template,
  // and the font variables Astro emits at build time. Font names are read from the
  // config rather than listed here, so renaming one there without updating
  // fonts.css surfaces as a failure instead of a silent exemption.
  //
  // Component-local properties declared in the same file need no entry — the
  // definedTokens(css) check below covers those.
  const suppliedOutsideStylesheets = new Set([
    "--intro-photo-size",
    ...FONT_VARIABLES,
  ]);

  it.each(cssFilesUnder(SRC).filter((f) => !f.endsWith("tokens.css")))(
    "%s references no undefined token",
    (file) => {
      const css = readFileSync(file, "utf-8");
      const undefinedTokens = [...usedTokens(css)].filter(
        (token) =>
          !defined.has(token) &&
          !suppliedOutsideStylesheets.has(token) &&
          !definedTokens(css).has(token)
      );
      expect(undefinedTokens).toEqual([]);
    }
  );
});

describe("self-hosted fonts are wired to the brand tokens", () => {
  // fonts.css is the seam between Astro's build-time font pipeline and the
  // generated token file. Nothing else references the Astro variables, so a
  // config rename would otherwise fail silently: an unresolved var() makes the
  // token empty and the browser quietly falls back to a default serif.
  it("every configured font variable is consumed", () => {
    expect(FONT_VARIABLES.length).toBeGreaterThan(0);
    const consumed = usedTokens(FONTS_CSS);
    expect(FONT_VARIABLES.filter((v) => !consumed.has(v))).toEqual([]);
  });

  it.each(["--font-sans", "--font-serif", "--font-mono"])(
    "%s is redefined to point at a self-hosted family",
    (token) => {
      const value = valueOf(FONTS_CSS, token);
      expect(
        FONT_VARIABLES.map((v) => `var(${v})`),
        `${token} resolves to ${value}`
      ).toContain(value);
    }
  );
});

/** The raw declared value of `token` in `css`, without following indirection. */
function valueOf(css: string, token: string): string {
  const at = css.indexOf(`${token}:`);
  if (at === -1) throw new Error(`${token} is not declared`);
  const start = at + token.length + 1;
  return css.slice(start, css.indexOf(";", start)).trim();
}
