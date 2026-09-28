import * as THREE from "three";
import { buildFrontierSurface, type SurfaceInput } from "../frontierSurface";
import { PAPER } from "./theme";

const easeOut = (t: number) => 1 - (1 - t) ** 3;

// The Pareto frontier as a folded paper sheet. Every rebuild unfolds up from
// the floor, one vertex at a time, sweeping from the "cheap" corner outward.
export class FrontierSheet {
  readonly group = new THREE.Group();
  private mesh: THREE.Mesh | null = null;
  private lines: THREE.LineSegments | null = null;
  private attr: THREE.BufferAttribute | null = null;
  private target: Float32Array | null = null;
  private delays: Float32Array | null = null;
  private start = -1;
  private readonly duration = 950;
  private readonly sheetMaterial = new THREE.MeshStandardMaterial({
    color: PAPER.sheet,
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
    transparent: true,
    opacity: 0.74,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  private readonly lineMaterial = new THREE.LineBasicMaterial({
    color: PAPER.sheetEdge,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  constructor(private floorY: number, private half: number) {}

  build(points: SurfaceInput[], now: number, delayMs: number, animate: boolean) {
    this.clear();
    const surface = buildFrontierSurface(points, this.half * 1.3);
    if (!surface) return;

    this.target = surface.positions;
    const live = new Float32Array(surface.positions);
    this.delays = new Float32Array(points.length);
    points.forEach((p, i) => {
      // Sweep from the cheap/fast corner (+x, +z) back toward the expensive one.
      const sweep = 1 - ((p.x + p.z) / (4 * this.half) + 0.5);
      this.delays![i] = delayMs + sweep * 520;
      if (animate) live[i * 3 + 1] = this.floorY;
    });

    this.attr = new THREE.BufferAttribute(live, 3);
    const sheetGeometry = new THREE.BufferGeometry();
    sheetGeometry.setAttribute("position", this.attr);
    sheetGeometry.setIndex(new THREE.BufferAttribute(surface.triangles, 1));
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", this.attr);
    lineGeometry.setIndex(new THREE.BufferAttribute(surface.edges, 1));

    this.mesh = new THREE.Mesh(sheetGeometry, this.sheetMaterial);
    this.mesh.castShadow = true;
    this.mesh.renderOrder = 2;
    this.mesh.frustumCulled = false;
    this.lines = new THREE.LineSegments(lineGeometry, this.lineMaterial);
    this.lines.renderOrder = 3;
    this.lines.frustumCulled = false;
    this.group.add(this.mesh, this.lines);
    this.start = animate ? now : -1;
  }

  update(now: number) {
    if (this.start < 0 || !this.attr || !this.target || !this.delays) return;
    const live = this.attr.array as Float32Array;
    let running = false;
    for (let i = 0; i < this.delays.length; i++) {
      const raw = (now - this.start - this.delays[i]) / this.duration;
      if (raw < 1) running = true;
      const t = easeOut(Math.min(Math.max(raw, 0), 1));
      live[i * 3 + 1] = this.floorY + (this.target[i * 3 + 1] - this.floorY) * t;
    }
    this.attr.needsUpdate = true;
    this.mesh?.geometry.computeBoundingSphere();
    if (!running) this.start = -1;
  }

  clear() {
    this.mesh?.geometry.dispose();
    this.lines?.geometry.dispose();
    if (this.mesh) this.group.remove(this.mesh);
    if (this.lines) this.group.remove(this.lines);
    this.mesh = this.lines = null;
    this.attr = this.target = this.delays = null;
  }

  dispose() {
    this.clear();
    this.sheetMaterial.dispose();
    this.lineMaterial.dispose();
  }
}

// In two dimensions the frontier is a boundary, not a surface. Sorting by X
// traces that boundary without suggesting a third metric that is not present.
export class FrontierLine {
  readonly group = new THREE.Group();
  private line: THREE.Line | null = null;
  private readonly material = new THREE.LineBasicMaterial({
    color: PAPER.sheetEdge,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  build(points: THREE.Vector3[]) {
    this.clear();
    if (points.length < 2) return;
    const ordered = [...points].sort((left, right) => left.x - right.x || left.y - right.y);
    const geometry = new THREE.BufferGeometry().setFromPoints(ordered);
    this.line = new THREE.Line(geometry, this.material);
    this.line.renderOrder = 3;
    this.line.frustumCulled = false;
    this.group.add(this.line);
  }

  clear() {
    this.line?.geometry.dispose();
    if (this.line) this.group.remove(this.line);
    this.line = null;
  }

  dispose() {
    this.clear();
    this.material.dispose();
  }
}
