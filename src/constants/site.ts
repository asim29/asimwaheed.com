// src/constants/site.ts

export const SITE = {
  name: "Asim Waheed",
  // Home-screen label, where the full name is usually truncated.
  shortName: "Asim",
  homeHref: "/",

  // Shown in the footer. Tracks content revisions rather than deploys, so it is
  // set by hand — a build date would call a dependency bump a content update.
  lastUpdated: "January 2026",

  email: "contact@asimwaheed.com",

  github: "https://www.github.com/asim29",
  scholar: "https://scholar.google.com/citations?user=PgPuHyQAAAAJ",
  linkedin: "https://www.linkedin.com/in/asim-waheed97/",
} as const;
