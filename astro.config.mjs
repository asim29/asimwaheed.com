import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://asimwaheed.com",
  integrations: [sitemap()],

  // The three brand families, downloaded and subset at build time and served
  // from this origin. Self-hosting is what makes the brand real for visitors:
  // naming a family in a font stack only renders it for people who happen to
  // have it installed locally.
  //
  // Fontsource rather than the Google provider because all three are OFL and
  // Fontsource serves them without involving Google at build time. Each family
  // is exposed as its own custom property, wired to the brand's font tokens in
  // src/styles/fonts.css. `weights` defaults to [400] alone, so the range is
  // explicit — the token set uses 500, 600 and 700 as well.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Source Serif 4",
      cssVariable: "--font-brand-serif",
      weights: ["400 700"],
      // Body copy carries markdown _emphasis_, so italics are a real face here.
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "Times New Roman", "Times", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Source Sans 3",
      cssVariable: "--font-brand-sans",
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Helvetica",
        "Arial",
        "sans-serif",
      ],
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-brand-mono",
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
    },
  ],

  markdown: {
    processor: unified({
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
          },
        ],
      ],
    }),
  },
});
