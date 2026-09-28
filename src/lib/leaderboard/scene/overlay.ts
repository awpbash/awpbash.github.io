import * as THREE from "three";
import type { AxisScale, MetricDef } from "../metrics";
import type { ModelRecord } from "../types";
import { inkFor } from "./theme";

interface Anchored {
  el: HTMLElement;
  place: (out: THREE.Vector3, g: Geometry) => THREE.Vector3 | null;
}

interface Geometry {
  H: number;
  backX: number;
  backZ: number;
  nearX: number;
  nearZ: number;
  yEdgeX: number;
  yEdgeZ: number;
}

const el = (tag: string, className: string, text?: string) => {
  const e = document.createElement(tag);
  e.className = className;
  if (text != null) e.textContent = text;
  return e;
};

// Every piece of text in the viewer is real HTML projected from world space, so
// type stays crisp and inherits the page's fonts.
export class Overlay {
  private layer = el("div", "fx-overlay");
  private axisLayer = el("div", "fx-overlay-axes");
  private labelLayer = el("div", "fx-overlay-labels");
  private tooltip = el("div", "fx-tooltip");
  private axisItems: Anchored[] = [];
  private labelItems: Anchored[] = [];
  private v = new THREE.Vector3();
  private width = 1;
  private height = 1;
  private tooltipBox: [number, number] = [0, 0];

  constructor(host: HTMLElement, private half: number) {
    this.tooltip.hidden = true;
    this.layer.append(this.axisLayer, this.labelLayer, this.tooltip);
    host.append(this.layer);
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  setAxes(xs: AxisScale, ys: AxisScale, zs: AxisScale) {
    this.axisLayer.replaceChildren();
    this.axisItems = [];
    const H = this.half;
    const w = (t: number) => (t - 0.5) * 2 * H;
    const add = (e: HTMLElement, place: Anchored["place"]) => {
      this.axisLayer.append(e);
      this.axisItems.push({ el: e, place });
    };
    for (const t of xs.ticks)
      add(el("span", "fx-tick", t.label), (o, g) => o.set(w(t.t), -H, g.nearZ + Math.sign(g.nearZ) * 0.6));
    for (const t of zs.ticks)
      add(el("span", "fx-tick", t.label), (o, g) => o.set(g.nearX + Math.sign(g.nearX) * 0.6, -H, w(t.t)));
    for (const t of ys.ticks)
      add(el("span", "fx-tick fx-tick-y", t.label), (o, g) =>
        o.set(g.yEdgeX + Math.sign(g.yEdgeX) * 0.35, w(t.t), g.yEdgeZ + Math.sign(g.yEdgeZ) * 0.35),
      );
    add(el("span", "fx-axis-title", xs.def.title), (o, g) => o.set(0, -H, g.nearZ + Math.sign(g.nearZ) * 2.3));
    add(el("span", "fx-axis-title", zs.def.title), (o, g) => o.set(g.nearX + Math.sign(g.nearX) * 2.3, -H, 0));
    add(el("span", "fx-axis-title fx-axis-title-y", `${ys.def.title} ↑`), (o, g) => o.set(g.yEdgeX, H + 0.9, g.yEdgeZ));

    const corner = el("span", "fx-corner-note");
    corner.append(
      el("span", "fx-corner-mark"),
      el("span", "", "Preferred on all three axes"),
    );
    add(corner, (o) => o.set(H, H, H));
  }

  setAxes2D(xs: AxisScale, ys: AxisScale) {
    this.axisLayer.replaceChildren();
    this.axisItems = [];
    const H = this.half;
    const w = (t: number) => (t - 0.5) * 2 * H;
    const add = (e: HTMLElement, place: Anchored["place"]) => {
      this.axisLayer.append(e);
      this.axisItems.push({ el: e, place });
    };

    for (const t of xs.ticks) add(el("span", "fx-tick", t.label), (o) => o.set(w(t.t), -H - 0.42, 0));
    for (const t of ys.ticks) add(el("span", "fx-tick fx-tick-y", t.label), (o) => o.set(-H - 0.42, w(t.t), 0));
    add(el("span", "fx-axis-title", xs.def.title), (o) => o.set(0, -H - 1.45, 0));
    add(el("span", "fx-axis-title fx-axis-title-y", `${ys.def.title} ↑`), (o) => o.set(-H, H + 0.75, 0));

    const corner = el("span", "fx-corner-note");
    corner.append(el("span", "fx-corner-mark"), el("span", "", "Preferred on both axes"));
    add(corner, (o) => o.set(H, H, 0));
  }

  setModelLabels(items: { id: string; text: string }[], resolve: (id: string, out: THREE.Vector3) => THREE.Vector3 | null) {
    this.labelLayer.replaceChildren();
    this.labelItems = items.map(({ id, text }) => {
      const e = el("span", "fx-model-label", text);
      this.labelLayer.append(e);
      return { el: e, place: (o) => resolve(id, o) };
    });
  }

  project(world: THREE.Vector3, camera: THREE.Camera): [number, number] | null {
    this.v.copy(world).project(camera);
    if (this.v.z > 1) return null;
    return [((this.v.x + 1) / 2) * this.width, ((1 - this.v.y) / 2) * this.height];
  }

  update(camera: THREE.Camera) {
    const H = this.half;
    const backX = camera.position.x > 0 ? -H : H;
    const backZ = camera.position.z > 0 ? -H : H;
    // The intelligence scale runs up a silhouette edge. Skip the one that meets
    // the better corner, where the corner note already sits.
    const clash = backX === H && -backZ === H;
    const g: Geometry = {
      H,
      backX,
      backZ,
      nearX: -backX,
      nearZ: -backZ,
      yEdgeX: clash ? -backX : backX,
      yEdgeZ: clash ? backZ : -backZ,
    };
    const place = (items: Anchored[]) => {
      for (const item of items) {
        const world = item.place(new THREE.Vector3(), g);
        const p = world && this.project(world, camera);
        item.el.hidden = !p;
        if (p) item.el.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px)`;
      }
    };
    place(this.axisItems);
    place(this.labelItems);
  }

  showTooltip(model: ModelRecord, onFrontier: boolean, metrics: MetricDef[], activeKeys: string[]) {
    const t = this.tooltip;
    t.replaceChildren();
    const head = el("div", "fx-tt-head");
    const swatch = el("span", "fx-tt-swatch");
    swatch.style.background = model.openWeights ? "transparent" : inkFor(model.creator.slug);
    swatch.style.borderColor = inkFor(model.creator.slug);
    head.append(swatch, el("span", "fx-tt-name", model.fullName));
    const tags = [model.creator.name, model.openWeights ? "open weights" : "proprietary"];
    if (model.reasoning) tags.push("reasoning");
    t.append(head, el("div", "fx-tt-tags", tags.join(" · ")));
    if (onFrontier) t.append(el("div", "fx-tt-frontier", "On the Pareto frontier"));

    const rows: [string, string, string][] = metrics.map((metric) => [
      metric.key,
      metric.shortTitle,
      model.values[metric.key] == null ? "n/a" : metric.format(model.values[metric.key]!),
    ]);
    const dl = el("dl", "fx-tt-rows");
    for (const [key, label, value] of rows) {
      const row = el("div", activeKeys.includes(key) ? "fx-tt-row is-active" : "fx-tt-row");
      row.append(el("dt", "", label), el("dd", "", value));
      dl.append(row);
    }
    t.append(dl);
    t.hidden = false;
    this.tooltipBox = [t.offsetWidth, t.offsetHeight];
  }

  moveTooltip(x: number, y: number) {
    const [bw, bh] = this.tooltipBox;
    const pad = 18;
    const left = x + pad + bw > this.width ? x - pad - bw : x + pad;
    const top = Math.min(Math.max(y - bh / 2, 8), Math.max(8, this.height - bh - 8));
    this.tooltip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }

  hideTooltip() {
    this.tooltip.hidden = true;
  }

  dispose() {
    this.layer.remove();
  }
}
