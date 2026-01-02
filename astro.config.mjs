import { defineConfig } from "astro/config";
import remarkExternalLinks from "remark-external-links";

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [
        remarkExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },
});
