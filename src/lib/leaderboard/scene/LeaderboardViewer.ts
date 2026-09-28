import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildScale, metricDef, type AxisScale, type DatasetConfig } from "../metrics";
import type { AxisSelection, ModelRecord } from "../types";
import { Walls } from "./axes";
import { FrontierLine, FrontierSheet } from "./frontierMesh";
import { Overlay } from "./overlay";
import { PointCloud } from "./points";
import { canvasTexture, drawFloor, drawWall } from "./regionShading";
import { FONTS, PAPER } from "./theme";

const HALF = 5;
const PICK_RADIUS = 22;

export interface ViewerState {
  config: DatasetConfig;
  axes: AxisSelection;
  visible: Set<string>;
  frontier: Set<string>;
  surfaceVisible: boolean;
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export class LeaderboardViewer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
  private controls: OrbitControls;
  private points: PointCloud;
  private sheet = new FrontierSheet(-HALF, HALF);
  private frontierLine = new FrontierLine();
  private walls: Walls;
  private overlay: Overlay;
  private floorCanvas = document.createElement("canvas");
  private floorTexture: THREE.CanvasTexture;
  private wallTexture: THREE.CanvasTexture;
  private floor: THREE.Mesh;
  private shadowCatcher: THREE.Mesh;
  private dropLine: THREE.Line;
  private dropRing: THREE.Mesh;
  private byId = new Map<string, ModelRecord>();
  private positions = new Map<string, THREE.Vector3 | null>();
  private scales: { x: AxisScale; y: AxisScale; z: AxisScale | null } | null = null;
  private is2D = false;
  private viewKey = "";
  private frontierKey = "";
  private state: ViewerState | null = null;
  private hoverId: string | null = null;
  private dragging = false;
  private zoomArmed = false;
  private desiredTarget = new THREE.Vector3(0, -0.6, 0);
  private raf = 0;
  private last = performance.now();
  private onScreen = true;
  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;
  private width = 1;
  private height = 1;
  private tmp = new THREE.Vector3();

  constructor(
    private host: HTMLElement,
    models: ModelRecord[],
    private reducedMotion: boolean,
  ) {
    models.forEach((m) => this.byId.set(m.id, m));

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.className = "fx-canvas";
    host.append(this.renderer.domElement);

    this.overlay = new Overlay(host, HALF);

    this.scene.add(new THREE.HemisphereLight("#ffffff", "#e6dccb", 2.4));
    const sun = new THREE.DirectionalLight("#ffffff", 1.5);
    sun.position.set(-7, 16, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.radius = 4;
    Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 45 });
    this.scene.add(sun);

    this.floorTexture = canvasTexture(this.floorCanvas, this.renderer);
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2 * HALF, 2 * HALF),
      new THREE.MeshBasicMaterial({ map: this.floorTexture, transparent: true, depthWrite: false }),
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -HALF;
    this.floor.renderOrder = -3;
    this.shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(2 * HALF, 2 * HALF),
      new THREE.ShadowMaterial({ color: PAPER.ink, opacity: 0.13, depthWrite: false }),
    );
    this.shadowCatcher.rotation.x = -Math.PI / 2;
    this.shadowCatcher.position.y = -HALF + 0.01;
    this.shadowCatcher.receiveShadow = true;
    this.shadowCatcher.renderOrder = -1;

    const wallCanvas = document.createElement("canvas");
    drawWall(wallCanvas);
    this.wallTexture = canvasTexture(wallCanvas, this.renderer);
    this.walls = new Walls(HALF, this.wallTexture);

    this.points = new PointCloud(models);
    this.points.setPixelRatio(this.renderer.getPixelRatio());

    const inkLine = new THREE.LineBasicMaterial({ color: PAPER.ink, transparent: true, opacity: 0.55 });
    this.dropLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      inkLine,
    );
    this.dropRing = new THREE.Mesh(
      new THREE.RingGeometry(0.14, 0.2, 32),
      new THREE.MeshBasicMaterial({ color: PAPER.ink, transparent: true, opacity: 0.6, depthWrite: false }),
    );
    this.dropRing.rotation.x = -Math.PI / 2;
    this.dropLine.visible = this.dropRing.visible = false;

    this.scene.add(
      this.floor,
      this.shadowCatcher,
      this.walls.group,
      this.points.object,
      this.sheet.group,
      this.frontierLine.group,
      this.dropLine,
      this.dropRing,
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.controls, {
      enableDamping: true,
      dampingFactor: 0.08,
      enablePan: false,
      enableZoom: false,
      rotateSpeed: 0.7,
      zoomSpeed: 0.6,
      minDistance: 22,
      maxDistance: 70,
      minPolarAngle: 0.18,
      maxPolarAngle: 1.45,
      autoRotate: !reducedMotion,
      autoRotateSpeed: 0.35,
    });
    this.controls.target.copy(this.desiredTarget);
    this.controls.addEventListener("start", () => {
      this.controls.autoRotate = false;
      this.dragging = true;
      this.clearHover();
    });
    this.controls.addEventListener("end", () => (this.dragging = false));

    const dom = this.renderer.domElement;
    dom.addEventListener("pointermove", this.onPointerMove);
    dom.addEventListener("pointerleave", this.onPointerLeave);
    dom.addEventListener("pointerdown", this.armZoom);
    dom.addEventListener("wheel", this.onWheel, { capture: true, passive: true });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.intersection = new IntersectionObserver(([entry]) => (this.onScreen = entry.isIntersecting));
    this.intersection.observe(host);
    this.resize(true);

    document.fonts?.load(`600 84px ${FONTS.serif}`).then(() => this.redrawFloor());
    this.raf = requestAnimationFrame(this.frame);
  }

  update(state: ViewerState) {
    const now = performance.now();
    const first = this.viewKey === "";
    const key = `${state.config.id}:${state.axes.x}:${state.axes.y}:${state.axes.z}`;
    const viewChanged = key !== this.viewKey;
    this.state = state;
    this.sheet.group.visible = state.surfaceVisible;

    if (viewChanged) {
      this.viewKey = key;
      const nextIs2D = !state.axes.z;
      const modeChanged = nextIs2D !== this.is2D;
      this.is2D = nextIs2D;
      const all = [...this.byId.values()];
      this.scales = {
        x: buildScale(metricDef(state.config, state.axes.x), all),
        y: buildScale(metricDef(state.config, state.axes.y), all),
        z: state.axes.z ? buildScale(metricDef(state.config, state.axes.z), all) : null,
      };
      const { x, y, z } = this.scales;
      const w = (t: number) => (t - 0.5) * 2 * HALF;
      for (const m of all) {
        const vx = m.values[x.def.key];
        const vy = m.values[y.def.key];
        const vz = z ? m.values[z.def.key] : null;
        this.positions.set(
          m.id,
          vx != null && vy != null && (!z || vz != null)
            ? new THREE.Vector3(w(x.unit(vx)), w(y.unit(vy)), z ? w(z.unit(vz!)) : 0)
            : null,
        );
      }
      this.points.setTargets(this.positions, now, this.reducedMotion ? "jump" : first ? "rise" : "move");
      this.floor.visible = this.shadowCatcher.visible = !this.is2D;
      if (z) {
        this.redrawFloor();
        this.walls.rebuild(x, y, z);
        this.overlay.setAxes(x, y, z);
      } else {
        this.walls.rebuild2D(x, y);
        this.overlay.setAxes2D(x, y);
      }
      if (first || modeChanged) this.positionCamera(this.is2D);
    }

    this.points.setVisibility(state.visible, state.frontier, first || this.reducedMotion);

    const frontierIds = [...state.frontier].filter((id) => this.positions.get(id)).sort();
    const fKey = `${key}|${frontierIds.join(",")}`;
    if (fKey !== this.frontierKey) {
      this.frontierKey = fKey;
      const pts = frontierIds.map((id) => this.positions.get(id)!);
      if (this.is2D) {
        this.sheet.clear();
        this.frontierLine.build(pts);
      } else {
        this.frontierLine.clear();
        this.sheet.build(pts, now, first ? 1150 : viewChanged ? 750 : 120, !this.reducedMotion);
      }
      this.overlay.setModelLabels(this.pickLabels(frontierIds), (id, out) => {
        const i = this.points.ids.indexOf(id);
        return i >= 0 && this.points.isVisible(i) ? this.points.positionOf(id, out) : null;
      });
    }

    const visible = [...state.visible].map((id) => this.positions.get(id)).filter(Boolean) as THREE.Vector3[];
    if (visible.length) {
      const c = visible.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(visible.length);
      this.desiredTarget.set(this.is2D ? 0 : c.x * 0.35, this.is2D ? 0 : -0.6 + c.y * 0.25, this.is2D ? 0 : c.z * 0.35);
    }
    if (this.hoverId && !state.visible.has(this.hoverId)) this.clearHover();
  }

  private pickLabels(ids: string[]) {
    if (!this.scales || !ids.length) return [];
    const { x, y, z } = this.scales;
    const score = (id: string) => {
      const m = this.byId.get(id)!;
      const values = [x.unit(m.values[x.def.key]!), y.unit(m.values[y.def.key]!)];
      if (z) values.push(z.unit(m.values[z.def.key]!));
      return values;
    };
    const picks = new Set<string>();
    const dimensions = z ? 3 : 2;
    for (let axis = 0; axis < dimensions; axis++) picks.add([...ids].sort((a, b) => score(b)[axis] - score(a)[axis])[0]);
    const balanced = [...ids].sort((a, b) => Math.min(...score(b)) - Math.min(...score(a)));
    for (const id of balanced) {
      if (picks.size >= 5) break;
      picks.add(id);
    }
    return [...picks].map((id) => {
      const name = this.byId.get(id)!.name;
      return { id, text: name.length > 30 ? `${name.slice(0, 29)}…` : name };
    });
  }

  private redrawFloor() {
    if (!this.scales?.z) return;
    drawFloor(this.floorCanvas, this.scales.x, this.scales.z);
    this.floorTexture.needsUpdate = true;
  }

  private resize(initial = false) {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.overlay.setSize(w, h);
    if (initial) this.positionCamera(false);
  }

  private positionCamera(flat: boolean) {
    const distance = (flat ? 30 : 40) / Math.min(1, this.camera.aspect * 1.15);
    if (flat) {
      this.camera.position.set(0, 0, distance);
      this.desiredTarget.set(0, 0, 0);
    } else {
      const az = THREE.MathUtils.degToRad(38);
      const el = THREE.MathUtils.degToRad(24);
      this.camera.position.set(
        distance * Math.cos(el) * Math.sin(az),
        distance * Math.sin(el) - 0.6,
        distance * Math.cos(el) * Math.cos(az),
      );
      this.desiredTarget.set(0, -0.6, 0);
    }
    this.controls.enableRotate = !flat;
    this.controls.autoRotate = !flat && !this.reducedMotion;
    this.controls.target.copy(this.desiredTarget);
    this.controls.maxDistance = Math.max(70, distance * 1.4);
    this.controls.update();
  }

  private armZoom = () => {
    this.zoomArmed = true;
  };

  private onWheel = (e: WheelEvent) => {
    // Page scroll passes through until the reader clicks into the figure (or pinches).
    this.controls.enableZoom = this.zoomArmed || e.ctrlKey || e.metaKey;
  };

  private onPointerLeave = () => {
    this.zoomArmed = false;
    this.clearHover();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.dragging || !this.state) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best: string | null = null;
    let bestD = PICK_RADIUS;
    this.points.ids.forEach((id, i) => {
      if (!this.points.isVisible(i)) return;
      const p = this.overlay.project(this.points.positionOf(id, this.tmp), this.camera);
      if (!p) return;
      const d = Math.hypot(p[0] - mx, p[1] - my);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    });
    if (best === this.hoverId) return;
    this.hoverId = best;
    this.points.setHover(best);
    this.renderer.domElement.style.cursor = best ? "pointer" : "";
    if (!best) return this.clearHover();
    const keys = [this.state.axes.x, this.state.axes.y, this.state.axes.z].filter((key): key is string => Boolean(key));
    this.overlay.showTooltip(this.byId.get(best)!, this.state.frontier.has(best), this.state.config.metrics, keys);
  };

  private clearHover() {
    this.hoverId = null;
    this.points.setHover(null);
    this.overlay.hideTooltip();
    this.dropLine.visible = this.dropRing.visible = false;
    this.renderer.domElement.style.cursor = "";
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(64, now - this.last);
    this.last = now;
    if (!this.onScreen) return;

    this.controls.target.lerp(this.desiredTarget, 1 - Math.exp(-dt / 320));
    this.controls.update();
    this.points.update(now, dt);
    this.sheet.update(now);
    this.walls.update(this.camera, new THREE.Vector3());

    if (this.hoverId) {
      const p = this.points.positionOf(this.hoverId, this.tmp);
      const attr = this.dropLine.geometry.attributes.position as THREE.BufferAttribute;
      attr.setXYZ(0, p.x, p.y, p.z);
      attr.setXYZ(1, p.x, -HALF, this.is2D ? 0 : p.z);
      attr.needsUpdate = true;
      this.dropRing.position.set(p.x, -HALF + 0.02, p.z);
      this.dropLine.visible = true;
      this.dropRing.visible = !this.is2D;
      const s = this.overlay.project(p, this.camera);
      if (s) this.overlay.moveTooltip(s[0], s[1]);
    }

    this.overlay.update(this.camera);
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    this.controls.dispose();
    const dom = this.renderer.domElement;
    dom.removeEventListener("pointermove", this.onPointerMove);
    dom.removeEventListener("pointerleave", this.onPointerLeave);
    dom.removeEventListener("pointerdown", this.armZoom);
    dom.removeEventListener("wheel", this.onWheel, { capture: true });
    this.points.dispose();
    this.sheet.dispose();
    this.frontierLine.dispose();
    this.walls.dispose();
    this.floorTexture.dispose();
    this.wallTexture.dispose();
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Line) o.geometry.dispose();
    });
    this.renderer.dispose();
    dom.remove();
    this.overlay.dispose();
  }
}
