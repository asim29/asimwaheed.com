import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const publications = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(["peer-reviewed", "preprint"]).default("peer-reviewed"),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number(),
    links: z.record(z.string(), z.string()).optional(),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    kind: z.enum(["intro", "other", "timeline"]).default("timeline"),
    start: z.number().optional(),
    end: z.union([z.number(), z.literal("present")]).optional(),
    title: z.string().optional(),
  }),
});

export const collections = { publications, work };
