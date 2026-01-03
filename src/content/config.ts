import { defineCollection, z } from "astro:content";

const publications = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    links: z.record(z.string()).optional(),
  }),
});

export const collections = {
  publications,
};
