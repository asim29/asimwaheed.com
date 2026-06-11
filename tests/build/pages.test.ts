import { beforeAll, describe, expect, it } from "vitest";

import { PAGES, SITE_URL, assertDistExists, loadPage } from "./helpers";

beforeAll(() => {
  assertDistExists();
});

describe.each(PAGES)("$route", ({ route, file, title }) => {
  it("has the expected <title>", () => {
    const document = loadPage(file);
    expect(document.querySelector("title")?.textContent).toBe(title);
  });

  it("declares lang, charset, and viewport", () => {
    const document = loadPage(file);
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    expect(document.querySelector("meta[charset]")).not.toBeNull();
    expect(document.querySelector('meta[name="viewport"]')).not.toBeNull();
  });

  it("has a non-empty meta description", () => {
    const document = loadPage(file);
    const description = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    expect(description).toBeTruthy();
  });

  it("has a canonical URL on the site domain", () => {
    const document = loadPage(file);
    const canonical = document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(canonical?.startsWith(SITE_URL)).toBe(true);
    if (route !== "/404") {
      expect(canonical).toBe(`${SITE_URL}${route}`);
    }
  });

  it("has Open Graph title, description, and image", () => {
    const document = loadPage(file);
    for (const property of ["og:title", "og:description", "og:image"]) {
      const content = document
        .querySelector(`meta[property="${property}"]`)
        ?.getAttribute("content");
      expect(content, property).toBeTruthy();
    }
  });

  it("links the full favicon set and web manifest", () => {
    const document = loadPage(file);
    const linkHref = (selector: string) =>
      document.querySelector(selector)?.getAttribute("href");

    expect(linkHref('link[rel="icon"][type="image/svg+xml"]')).toBe(
      "/favicon.svg"
    );
    expect(linkHref('link[rel="icon"][type="image/png"]')).toBe(
      "/favicon-96x96.png"
    );
    expect(linkHref('link[rel="apple-touch-icon"]')).toBe(
      "/apple-touch-icon.png"
    );
    expect(linkHref('link[rel="manifest"]')).toBe("/site.webmanifest");
  });

  it("has a primary nav with all four pages", () => {
    const document = loadPage(file);
    const nav = document.querySelector('nav[aria-label="Primary"]');
    expect(nav).not.toBeNull();

    const hrefs = Array.from(nav?.querySelectorAll("a") ?? []).map((a) =>
      a.getAttribute("href")
    );
    expect(hrefs).toEqual(["/", "/work", "/publications", "/collaborate"]);
  });

  it("gives every image alt text", () => {
    const document = loadPage(file);
    for (const img of document.querySelectorAll("img")) {
      expect(img.getAttribute("alt"), img.outerHTML).toBeTruthy();
    }
  });
});
