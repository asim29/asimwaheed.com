// Palette values that have to exist outside CSS.
//
// <meta name="theme-color"> and the web manifest tint browser and OS chrome, and
// neither can read a CSS custom property. These two hexes are therefore the one
// sanctioned duplication of a generated token: they mirror --color-bg from
// src/styles/tokens.css for each theme. tests/unit/tokens.test.ts resolves that
// token and asserts the match, so regenerating the palette upstream fails CI
// instead of shipping an address bar that no longer matches the page.
export const THEME_COLORS = {
  light: "#FAF5ED",
  dark: "#1E2A40",
} as const;

/** localStorage key holding an explicit theme choice, when one has been made. */
export const THEME_STORAGE_KEY = "theme";

// Runs before first paint to apply a stored theme choice, and delegates clicks
// on the toggle. Inline and synchronous on purpose: a deferred or external script
// would paint the default theme first and then repaint, which is the flash this
// avoids. Delegation from `document` is what lets one head script serve a button
// that does not exist yet.
//
// Absent a stored choice nothing is written, so the untouched state stays
// prefers-color-scheme — the generated tokens already handle that, and it is what
// a visitor without JS gets. Setting data-theme-controls is what reveals the
// toggle in CSS, so the control only appears once it can actually work.
//
// This is served under a CSP script-src hash. tests/build/theme.test.ts recomputes
// the hash from the built HTML and fails with the correct value if the two drift,
// so editing this string safely means running the tests and pasting the hash it
// reports into public/_headers.
export const THEME_INIT_SCRIPT = `(function () {
  var d = document.documentElement;
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === "light" || stored === "dark") d.dataset.theme = stored;
  } catch (e) {}
  d.dataset.themeControls = "ready";
  document.addEventListener("click", function (e) {
    var hit = e.target instanceof Element ? e.target.closest("[data-theme-toggle]") : null;
    if (!hit) return;
    var isDark = d.dataset.theme
      ? d.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = isDark ? "light" : "dark";
    d.dataset.theme = next;
    try {
      localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)}, next);
    } catch (e) {}
  });
})();`;
