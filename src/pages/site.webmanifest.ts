import type { APIRoute } from "astro";

import { SITE } from "../constants/site";
import { THEME_COLORS } from "../constants/theme";

// Built as a route rather than shipped from public/ so its colours come from the
// same constant as <meta name="theme-color"> instead of being a second pair of
// literal hexes to keep in step by hand. Prerendered to /site.webmanifest by the
// static build, so it costs nothing at request time.
//
// Both colours are the light value on purpose: a manifest has one theme_color,
// and it is read when the app is installed and launched, before any stored
// preference is available to consult.
export const GET: APIRoute = () =>
  new Response(
    `${JSON.stringify(
      {
        name: SITE.name,
        short_name: SITE.shortName,
        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        theme_color: THEME_COLORS.light,
        background_color: THEME_COLORS.light,
        display: "standalone",
      },
      null,
      2
    )}\n`,
    { headers: { "Content-Type": "application/manifest+json" } }
  );
