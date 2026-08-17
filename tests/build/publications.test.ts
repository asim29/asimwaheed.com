import { beforeAll, describe, expect, it } from "vitest";

import { SITE } from "../../src/constants/site";
import { assertDistExists, loadPage } from "./helpers";

const ELEMENT_NODE = 1;

function textOutsideStrong(element: Element): string {
  return Array.from(element.childNodes)
    .filter(
      (node) =>
        node.nodeType !== ELEMENT_NODE ||
        (node as Element).tagName.toLowerCase() !== "strong"
    )
    .map((node) => node.textContent ?? "")
    .join("");
}

beforeAll(() => {
  assertDistExists();
});

describe("/publications", () => {
  it("bolds the site owner's name in every author list naming them", () => {
    const document = loadPage("publications/index.html");
    const metas = Array.from(
      document.querySelectorAll(".publication-meta")
    ) as Element[];

    const unbolded = metas
      .filter((meta) => textOutsideStrong(meta).includes(SITE.name))
      .map((meta) => meta.textContent?.trim());
    expect(unbolded).toEqual([]);

    const bolded = metas.filter((meta) =>
      Array.from(meta.querySelectorAll("strong")).some(
        (el) => el.textContent?.trim() === SITE.name
      )
    );
    expect(bolded.length).toBeGreaterThan(0);
  });
});
