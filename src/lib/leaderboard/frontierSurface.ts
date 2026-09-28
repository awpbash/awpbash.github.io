import { Delaunay } from "d3-delaunay";

export interface SurfaceInput {
  x: number;
  y: number;
  z: number;
}

export interface Surface {
  positions: Float32Array;
  triangles: Uint32Array;
  edges: Uint32Array;
}

const MIN_ANGLE = (9 * Math.PI) / 180;

function minAngle(ax: number, az: number, bx: number, bz: number, cx: number, cz: number): number {
  const ab = Math.hypot(bx - ax, bz - az);
  const bc = Math.hypot(cx - bx, cz - bz);
  const ca = Math.hypot(ax - cx, az - cz);
  if (!ab || !bc || !ca) return 0;
  const angle = (opp: number, s1: number, s2: number) =>
    Math.acos(Math.min(1, Math.max(-1, (s1 * s1 + s2 * s2 - opp * opp) / (2 * s1 * s2))));
  return Math.min(angle(bc, ab, ca), angle(ca, ab, bc), angle(ab, bc, ca));
}

// Triangulates frontier points over the floor (x, z) and lifts each vertex to its
// height, giving a folded sheet. Sliver triangles on the hull are cut away so the
// sheet reads as folded paper rather than a spiky tent.
export function buildFrontierSurface(points: SurfaceInput[], maxEdge: number): Surface | null {
  if (points.length < 3) return null;
  const delaunay = Delaunay.from(points, (p) => p.x, (p) => p.z);
  const kept: number[] = [];
  const t = delaunay.triangles;
  for (let i = 0; i < t.length; i += 3) {
    const [a, b, c] = [points[t[i]], points[t[i + 1]], points[t[i + 2]]];
    const longest = Math.max(
      Math.hypot(a.x - b.x, a.z - b.z),
      Math.hypot(b.x - c.x, b.z - c.z),
      Math.hypot(c.x - a.x, c.z - a.z),
    );
    if (longest > maxEdge) continue;
    if (minAngle(a.x, a.z, b.x, b.z, c.x, c.z) < MIN_ANGLE) continue;
    kept.push(t[i], t[i + 1], t[i + 2]);
  }
  if (!kept.length) return null;

  const edgeSet = new Set<string>();
  const edges: number[] = [];
  for (let i = 0; i < kept.length; i += 3) {
    for (const [p, q] of [
      [kept[i], kept[i + 1]],
      [kept[i + 1], kept[i + 2]],
      [kept[i + 2], kept[i]],
    ]) {
      const key = p < q ? `${p}-${q}` : `${q}-${p}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push(p, q);
    }
  }

  const positions = new Float32Array(points.length * 3);
  points.forEach((p, i) => positions.set([p.x, p.y, p.z], i * 3));
  return { positions, triangles: Uint32Array.from(kept), edges: Uint32Array.from(edges) };
}
