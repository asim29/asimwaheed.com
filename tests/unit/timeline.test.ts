import { describe, expect, it } from "vitest";

import { byEndDescending, endSortValue } from "../../src/lib/timeline";

describe("endSortValue", () => {
  it("treats 'present' as newer than any year", () => {
    expect(endSortValue("present")).toBeGreaterThan(endSortValue(9999));
  });

  it("treats a missing end as older than any year", () => {
    expect(endSortValue(undefined)).toBeLessThan(endSortValue(0));
  });

  it("returns the year itself for numeric ends", () => {
    expect(endSortValue(2024)).toBe(2024);
  });
});

describe("byEndDescending", () => {
  const entry = (end?: number | "present") => ({ data: { end } });

  it("sorts newest-first with 'present' at the top", () => {
    const entries = [
      entry(2019),
      entry("present"),
      entry(2023),
      entry(undefined),
      entry(2021),
    ];

    const sorted = [...entries].sort(byEndDescending);

    expect(sorted.map((e) => e.data.end)).toEqual([
      "present",
      2023,
      2021,
      2019,
      undefined,
    ]);
  });

  it("is stable for equal end years", () => {
    const a = { data: { end: 2020 } };
    const b = { data: { end: 2020 } };

    expect(byEndDescending(a, b)).toBe(0);
  });
});
