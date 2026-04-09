import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://asimwaheed.com",
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },
});
