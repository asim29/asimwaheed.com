import { readFileSync } from "node:fs";
import { join } from "node:path";

import { HtmlValidate } from "html-validate";
import { beforeAll, describe, expect, it } from "vitest";

import { DIST, PAGES, assertDistExists } from "./helpers";

beforeAll(() => {
  assertDistExists();
});

const htmlvalidate = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    // Content pages intentionally start at h3 under the masthead; there is
    // no per-page h1 by design.
    "heading-level": "off",
  },
});

describe.each(PAGES)("$route", ({ file }) => {
  it("is valid HTML", async () => {
    const html = readFileSync(join(DIST, file), "utf-8");
    const report = await htmlvalidate.validateString(html);

    const messages = report.results.flatMap((result) =>
      result.messages.map(
        (message) =>
          `${message.ruleId} (line ${message.line}): ${message.message}`
      )
    );
    expect(messages).toEqual([]);
  });
});
