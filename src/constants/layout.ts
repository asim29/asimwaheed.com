// Layout values that both a template and a stylesheet need to agree on.

// Rendered edge length of the home-page portrait, in px.
//
// Astro's <Image> needs it as a literal at build time to emit width/height and
// pick the optimized variant, while the float layout needs it in CSS. index.astro
// therefore passes it down as the --intro-photo-size custom property instead of
// the number being written once in each place, where the two could drift and
// reintroduce the layout shift the width/height attributes exist to prevent.
export const INTRO_PHOTO_SIZE = 220;

// Edge length used for every inline icon, matching the 24px viewBox the Lucide
// sources in src/icons are drawn on. Rendering at any other size would resample
// strokes drawn for this grid.
export const ICON_SIZE = 24;
