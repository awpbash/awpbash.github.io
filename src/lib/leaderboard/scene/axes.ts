import * as THREE from "three";
import type { AxisScale } from "../metrics";
import { PAPER } from "./theme";

// Two candidate walls per horizontal axis. Only the pair behind the data (away
// from the camera) is shown, like the back panels of a printed 3D figure.
export class Walls {
  readonly group = new THREE.Group();
  private xWalls: THREE.Group[] = [];
  private zWalls: THREE.Group[] = [];
  private gridMaterial = new THREE.LineBasicMaterial({ color: PAPER.hairline });
  private frameMaterial = new THREE.LineBasicMaterial({ color: PAPER.axis });
  private wallMaterial: THREE.MeshBasicMaterial;

  constructor(private half: number, wallTexture: THREE.Texture) {
    this.wallMaterial = new THREE.MeshBasicMaterial({
      map: wallTexture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }

  rebuild(xs: AxisScale, ys: AxisScale, zs: AxisScale) {
    this.group.traverse((o) => {
      if (o instanceof THREE.LineSegments || o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.group.clear();
    const H = this.half;
    const w = (t: number) => (t - 0.5) * 2 * H;

    const wall = (axis: "x" | "z", at: number, horizontalTicks: number[]) => {
      const g = new THREE.Group();
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(2 * H, 2 * H), this.wallMaterial);
      plane.renderOrder = -2;
      if (axis === "x") {
        plane.rotation.y = -Math.PI / 2;
        plane.position.set(at, 0, 0);
      } else plane.position.set(0, 0, at);
      g.add(plane);

      const grid: number[] = [];
      const frame: number[] = [];
      const pt = (u: number, y: number) => (axis === "x" ? [at, y, u] : [u, y, at]);
      for (const t of ys.ticks) grid.push(...pt(-H, w(t.t)), ...pt(H, w(t.t)));
      for (const t of horizontalTicks) grid.push(...pt(w(t), -H), ...pt(w(t), H));
      const c = [pt(-H, -H), pt(H, -H), pt(H, H), pt(-H, H)];
      for (let i = 0; i < 4; i++) frame.push(...c[i], ...c[(i + 1) % 4]);

      const lines = (arr: number[], mat: THREE.LineBasicMaterial) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
        const seg = new THREE.LineSegments(geo, mat);
        seg.renderOrder = -1;
        return seg;
      };
      g.add(lines(grid, this.gridMaterial), lines(frame, this.frameMaterial));
      this.group.add(g);
      return g;
    };

    this.xWalls = [-H, H].map((at) => wall("x", at, zs.ticks.map((t) => t.t)));
    this.zWalls = [-H, H].map((at) => wall("z", at, xs.ticks.map((t) => t.t)));

    const floorFrame = new THREE.BufferGeometry();
    const f = [
      [-H, -H, -H],
      [H, -H, -H],
      [H, -H, H],
      [-H, -H, H],
    ];
    const pts: number[] = [];
    for (let i = 0; i < 4; i++) pts.push(...f[i], ...f[(i + 1) % 4]);
    floorFrame.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    this.group.add(new THREE.LineSegments(floorFrame, this.frameMaterial));
  }

  rebuild2D(xs: AxisScale, ys: AxisScale) {
    this.group.traverse((o) => {
      if (o instanceof THREE.LineSegments || o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.group.clear();
    this.xWalls = [];
    this.zWalls = [];

    const H = this.half;
    const w = (t: number) => (t - 0.5) * 2 * H;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2 * H, 2 * H), this.wallMaterial);
    plane.position.z = -0.04;
    plane.renderOrder = -2;

    const grid: number[] = [];
    const frame: number[] = [];
    for (const tick of xs.ticks) grid.push(w(tick.t), -H, 0, w(tick.t), H, 0);
    for (const tick of ys.ticks) grid.push(-H, w(tick.t), 0, H, w(tick.t), 0);
    const corners = [
      [-H, -H, 0],
      [H, -H, 0],
      [H, H, 0],
      [-H, H, 0],
    ];
    for (let i = 0; i < corners.length; i++) frame.push(...corners[i], ...corners[(i + 1) % corners.length]);

    const lines = (values: number[], material: THREE.LineBasicMaterial) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
      const object = new THREE.LineSegments(geometry, material);
      object.renderOrder = -1;
      return object;
    };
    this.group.add(plane, lines(grid, this.gridMaterial), lines(frame, this.frameMaterial));
  }

  update(camera: THREE.Camera, center: THREE.Vector3) {
    const backX = camera.position.x > center.x ? 0 : 1;
    const backZ = camera.position.z > center.z ? 0 : 1;
    this.xWalls.forEach((g, i) => (g.visible = i === backX));
    this.zWalls.forEach((g, i) => (g.visible = i === backZ));
  }

  dispose() {
    this.group.traverse((o) => {
      if (o instanceof THREE.LineSegments || o instanceof THREE.Mesh) o.geometry.dispose();
    });
    this.gridMaterial.dispose();
    this.frameMaterial.dispose();
    this.wallMaterial.dispose();
  }
}
