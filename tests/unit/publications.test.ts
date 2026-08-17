import { describe, expect, it } from "vitest";

import { groupByKind, type PublicationKind } from "../../src/lib/publications";

const entry = (kind: PublicationKind, title: string) => ({
  data: { kind, title },
});

describe("groupByKind", () => {
  it("orders peer-reviewed above preprints whatever the input order", () => {
    const groups = groupByKind([
      entry("preprint", "a"),
      entry("peer-reviewed", "b"),
    ]);

    expect(groups.map((group) => group.heading)).toEqual([
      "Peer-reviewed",
      "Preprints",
    ]);
  });

  it("omits a group nothing falls into", () => {
    const groups = groupByKind([entry("peer-reviewed", "a")]);

    expect(groups.map((group) => group.heading)).toEqual(["Peer-reviewed"]);
  });

  it("preserves input order within a group", () => {
    const groups = groupByKind([
      entry("peer-reviewed", "2026"),
      entry("preprint", "2025"),
      entry("peer-reviewed", "2024"),
      entry("peer-reviewed", "2021"),
    ]);

    expect(groups[0].entries.map((e) => e.data.title)).toEqual([
      "2026",
      "2024",
      "2021",
    ]);
  });
});
