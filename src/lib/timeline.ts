export type TimelineEnd = number | "present" | undefined;

export interface TimelineDated {
  data: {
    end?: TimelineEnd;
  };
}

export function endSortValue(end: TimelineEnd): number {
  if (end === "present") return Infinity;
  return end ?? -Infinity;
}

/** Sorts timeline entries newest-first; "present" sorts above any year. */
export function byEndDescending(a: TimelineDated, b: TimelineDated): number {
  return endSortValue(b.data.end) - endSortValue(a.data.end);
}
