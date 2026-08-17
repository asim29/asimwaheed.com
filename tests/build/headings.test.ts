import { beforeAll, describe, expect, it } from "vitest";

import { PAGES, assertDistExists, loadPage } from "./helpers";

beforeAll(() => {
  assertDistExists();
});

describe.each(PAGES)("$route", ({ file, title }) => {
  it("has exactly one h1, carrying the page title", () => {
    const document = loadPage(file);
    const headings = Array.from(document.querySelectorAll("h1"));

    expect(headings.map((h) => h.textContent?.trim())).toEqual([title]);
  });
});
