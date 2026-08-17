export type PublicationKind = "peer-reviewed" | "preprint";

export interface PublicationKinded {
  data: {
    kind: PublicationKind;
  };
}

export interface PublicationGroup<T> {
  heading: string;
  entries: T[];
}

/** Display order of the groups, and the heading each renders under. */
export const PUBLICATION_GROUPS: ReadonlyArray<{
  kind: PublicationKind;
  heading: string;
}> = [
  { kind: "peer-reviewed", heading: "Peer-reviewed" },
  { kind: "preprint", heading: "Preprints" },
];

/** Groups publications for display, preserving the order they arrive in. */
export function groupByKind<T extends PublicationKinded>(
  entries: readonly T[]
): PublicationGroup<T>[] {
  return PUBLICATION_GROUPS.map(({ kind, heading }) => ({
    heading,
    entries: entries.filter((entry) => entry.data.kind === kind),
  })).filter((group) => group.entries.length > 0);
}
