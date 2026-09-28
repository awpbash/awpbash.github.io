import * as THREE from "three";
import type { ModelRecord } from "../types";
import { PAPER, inkFor } from "./theme";

export const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// Colours are written straight to the sRGB framebuffer (no colour management),
// so the printed inks match the validated hex values exactly.
const VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aOpacity;
  attribute vec3 aFlags;
  uniform float uPixel;
  varying vec3 vColor;
  varying float vOpacity;
  varying vec3 vFlags;
  varying float vSeed;
  void main() {
    vColor = aColor;
    vOpacity = aOpacity;
    vFlags = aFlags;
    vSeed = fract(sin(aSize * 91.7 + aColor.r * 13.1 + float(gl_VertexID) * 7.3) * 43758.5453) * 6.2831;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float s = aSize * (1.0 + 0.5 * aFlags.y + 0.45 * aFlags.z);
    gl_PointSize = s * uPixel * 36.0 / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uInk;
  varying vec3 vColor;
  varying float vOpacity;
  varying vec3 vFlags;
  varying float vSeed;
  float grain(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
  void main() {
    if (vOpacity < 0.01) discard;
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    float ang = atan(c.y, c.x);
    float r = length(c) + 0.035 * sin(ang * 5.0 + vSeed) + 0.02 * sin(ang * 11.0 + vSeed * 2.0);
    if (r > 1.0) discard;

    bool frontier = vFlags.y > 0.5;
    float markR = frontier ? 0.58 : 0.8;
    vec3 col = uPaper;
    float a = 0.9;
    if (frontier && r > 0.7 && r <= 0.9) { col = uInk; a = 1.0; }
    if (r <= markR) {
      bool hollow = vFlags.x > 0.5 && r < markR - 0.3;
      col = hollow ? uPaper : vColor * (0.9 + 0.1 * grain(floor(gl_FragCoord.xy)));
      a = 1.0;
    }
    a *= 1.0 - smoothstep(0.9, 1.0, r);
    gl_FragColor = vec4(col, a * vOpacity);
  }
`;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class PointCloud {
  readonly object: THREE.Points;
  readonly ids: string[];
  private index = new Map<string, number>();
  private geometry = new THREE.BufferGeometry();
  private pos: Float32Array;
  private from: Float32Array;
  private to: Float32Array;
  private delay: Float32Array;
  private opacity: Float32Array;
  private opacityTarget: Float32Array;
  private flags: Float32Array;
  private tweenStart = -1;
  private tweenDuration = 900;
  private uniforms = {
    uPixel: { value: 1 },
    uPaper: { value: new THREE.Vector3(...hexToRgb(PAPER.surface)) },
    uInk: { value: new THREE.Vector3(...hexToRgb(PAPER.ink)) },
  };

  constructor(models: ModelRecord[]) {
    const n = models.length;
    this.ids = models.map((m) => m.id);
    this.ids.forEach((id, i) => this.index.set(id, i));
    this.pos = new Float32Array(n * 3);
    this.from = new Float32Array(n * 3);
    this.to = new Float32Array(n * 3);
    this.delay = new Float32Array(n);
    this.opacity = new Float32Array(n);
    this.opacityTarget = new Float32Array(n);
    this.flags = new Float32Array(n * 3);

    const colors = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    models.forEach((m, i) => {
      colors.set(hexToRgb(inkFor(m.creator.slug)), i * 3);
      const size = Math.min(Math.max(m.sizeValue ?? 1, 1), 2_000_000);
      const normalized = Math.log10(size) / Math.log10(2_000_000);
      sizes[i] = 7.5 + 5.5 * Math.max(0, Math.min(1, normalized));
      this.flags[i * 3] = m.openWeights ? 1 : 0;
    });

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute("aOpacity", new THREE.BufferAttribute(this.opacity, 1));
    this.geometry.setAttribute("aFlags", new THREE.BufferAttribute(this.flags, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: true,
    });
    this.object = new THREE.Points(this.geometry, material);
    this.object.frustumCulled = false;
  }

  setPixelRatio(ratio: number) {
    this.uniforms.uPixel.value = ratio;
  }

  // targets: world position per id, or null when the model lacks a value on this view.
  setTargets(targets: Map<string, THREE.Vector3 | null>, now: number, mode: "rise" | "move" | "jump") {
    this.ids.forEach((id, i) => {
      const t = targets.get(id);
      const k = i * 3;
      if (t) this.to.set([t.x, t.y, t.z], k);
      if (mode === "rise") this.from.set([this.to[k], -5, this.to[k + 2]], k);
      else this.from.set(this.pos.subarray(k, k + 3), k);
      this.delay[i] = mode === "rise" ? Math.random() * 650 : mode === "move" ? Math.random() * 180 : 0;
    });
    this.tweenStart = mode === "jump" ? -1 : now;
    if (mode === "jump") this.pos.set(this.to);
    this.geometry.attributes.position.needsUpdate = true;
  }

  setVisibility(visible: Set<string>, frontier: Set<string>, instant: boolean) {
    this.ids.forEach((id, i) => {
      this.opacityTarget[i] = visible.has(id) ? 1 : 0;
      this.flags[i * 3 + 1] = frontier.has(id) ? 1 : 0;
      if (instant) this.opacity[i] = this.opacityTarget[i];
    });
    this.geometry.attributes.aFlags.needsUpdate = true;
    this.geometry.attributes.aOpacity.needsUpdate = true;
  }

  setHover(id: string | null) {
    this.ids.forEach((_, i) => (this.flags[i * 3 + 2] = 0));
    if (id != null) this.flags[this.index.get(id)! * 3 + 2] = 1;
    this.geometry.attributes.aFlags.needsUpdate = true;
  }

  isVisible(i: number) {
    return this.opacityTarget[i] > 0.5 && this.opacity[i] > 0.3;
  }

  positionOf(id: string, out = new THREE.Vector3()) {
    const k = this.index.get(id)! * 3;
    return out.set(this.pos[k], this.pos[k + 1], this.pos[k + 2]);
  }

  targetOf(id: string, out = new THREE.Vector3()) {
    const k = this.index.get(id)! * 3;
    return out.set(this.to[k], this.to[k + 1], this.to[k + 2]);
  }

  get settled() {
    return this.tweenStart < 0;
  }

  update(now: number, dt: number) {
    if (this.tweenStart >= 0) {
      let running = false;
      for (let i = 0; i < this.ids.length; i++) {
        const raw = (now - this.tweenStart - this.delay[i]) / this.tweenDuration;
        const t = easeInOut(Math.min(Math.max(raw, 0), 1));
        if (raw < 1) running = true;
        for (let a = 0; a < 3; a++) {
          const k = i * 3 + a;
          this.pos[k] = this.from[k] + (this.to[k] - this.from[k]) * t;
        }
      }
      if (!running) this.tweenStart = -1;
      this.geometry.attributes.position.needsUpdate = true;
    }

    let fading = false;
    const rate = 1 - Math.exp(-dt / 110);
    for (let i = 0; i < this.ids.length; i++) {
      const d = this.opacityTarget[i] - this.opacity[i];
      if (Math.abs(d) > 0.002) {
        this.opacity[i] += d * rate;
        fading = true;
      } else this.opacity[i] = this.opacityTarget[i];
    }
    if (fading) this.geometry.attributes.aOpacity.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    (this.object.material as THREE.Material).dispose();
  }
}
