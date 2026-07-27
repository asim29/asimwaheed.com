// Minimal reader for the generated token file.
//
// tokens.css is generated upstream by BrandGuidelines/tools/palette, so nothing
// here may assume formatting beyond what a custom-property block guarantees:
// `--name: value;` pairs inside a single-level selector block. Parsing rather
// than duplicating is the point — it lets a test compare the palette against
// the handful of places a colour has to be repeated outside CSS.

export type Theme = "light" | "dark";

// Where each theme's role values live. Primitive ramps are declared only in
// :root, so a dark lookup falls through to it for anything the override omits.
const THEME_SELECTORS: Record<Theme, string> = {
  light: ":root",
  dark: '[data-theme="dark"]',
};

const VAR_PREFIX = "var(";

function stripComments(css: string): string {
  let out = "";
  let cursor = 0;
  let open = css.indexOf("/*");

  while (open !== -1) {
    out += css.slice(cursor, open);
    const close = css.indexOf("*/", open + 2);
    if (close === -1) return out;
    cursor = close + 2;
    open = css.indexOf("/*", cursor);
  }

  return out + css.slice(cursor);
}

function skipSpace(css: string, from: number): number {
  const space = [" ", "\n", "\t", "\r"];
  let at = from;
  while (at < css.length && space.includes(css[at])) at += 1;
  return at;
}

/** Reads the CSS ident starting at `start`, stopping at the first other char. */
function identAt(css: string, start: number): string {
  let end = start;
  while (end < css.length) {
    const ch = css[end];
    const isIdent =
      ch === "-" ||
      ch === "_" ||
      (ch >= "a" && ch <= "z") ||
      (ch >= "A" && ch <= "Z") ||
      (ch >= "0" && ch <= "9");
    if (!isIdent) break;
    end += 1;
  }
  return css.slice(start, end);
}

/** Declarations of the first block with exactly this selector. */
function blockDeclarations(css: string, selector: string): Map<string, string> {
  const declarations = new Map<string, string>();
  const clean = stripComments(css);

  // Require the selector to be followed by its opening brace, so that `:root`
  // does not also match the `:root:not([data-theme="light"])` inside the
  // prefers-color-scheme block further down the generated file.
  let braceAt = -1;
  let candidate = clean.indexOf(selector);
  while (candidate !== -1) {
    const after = skipSpace(clean, candidate + selector.length);
    if (clean[after] === "{") {
      braceAt = after;
      break;
    }
    candidate = clean.indexOf(selector, candidate + selector.length);
  }
  if (braceAt === -1) return declarations;

  const end = clean.indexOf("}", braceAt);
  const body = clean.slice(braceAt + 1, end === -1 ? undefined : end);

  for (const declaration of body.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon === -1) continue;
    const name = declaration.slice(0, colon).trim();
    if (!name.startsWith("--")) continue;
    declarations.set(name, declaration.slice(colon + 1).trim());
  }

  return declarations;
}

/**
 * Resolves a colour token to its literal value for one theme, following any
 * chain of `var()` indirection from semantic role down to primitive ramp step.
 */
export function resolveColor(css: string, token: string, theme: Theme): string {
  const themed = blockDeclarations(css, THEME_SELECTORS[theme]);
  const root = theme === "light" ? themed : blockDeclarations(css, ":root");

  const seen = new Set<string>();
  let name = token;

  while (!seen.has(name)) {
    seen.add(name);

    const value = themed.get(name) ?? root.get(name);
    if (value === undefined) {
      throw new Error(`Token ${name} is not defined (resolving ${token})`);
    }
    if (!value.startsWith(VAR_PREFIX)) return value;

    name = value.slice(VAR_PREFIX.length, value.lastIndexOf(")")).trim();
  }

  throw new Error(`Cyclic token reference reached from ${token} at ${name}`);
}

/** Every custom property the stylesheet declares, in any block. */
export function definedTokens(css: string): Set<string> {
  const clean = stripComments(css);
  const names = new Set<string>();

  let at = clean.indexOf("--");
  while (at !== -1) {
    const name = identAt(clean, at);
    // A declaration is a name followed by a colon; `var(--x)` is a reference.
    if (clean[skipSpace(clean, at + name.length)] === ":") names.add(name);
    at = clean.indexOf("--", at + Math.max(name.length, 2));
  }

  return names;
}

/** Every custom property the stylesheet reads through `var()`. */
export function usedTokens(css: string): Set<string> {
  const clean = stripComments(css);
  const names = new Set<string>();

  let at = clean.indexOf(VAR_PREFIX);
  while (at !== -1) {
    const name = identAt(clean, skipSpace(clean, at + VAR_PREFIX.length));
    if (name.startsWith("--")) names.add(name);
    at = clean.indexOf(VAR_PREFIX, at + VAR_PREFIX.length);
  }

  return names;
}
