export interface ScoredPoint {
  id: string;
  // Each score is oriented so that higher is better on every axis.
  scores: number[];
}

export function dominates(a: number[], b: number[]): boolean {
  let strictlyBetter = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return false;
    if (a[i] > b[i]) strictlyBetter = true;
  }
  return strictlyBetter;
}

export function computeParetoFrontier(points: ScoredPoint[]): Set<string> {
  const frontier = new Set<string>();
  for (const p of points) {
    if (!points.some((q) => q !== p && dominates(q.scores, p.scores))) frontier.add(p.id);
  }
  return frontier;
}
