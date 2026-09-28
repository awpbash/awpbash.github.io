import * as THREE from "three";
import type { AxisScale } from "../metrics";
import { FONTS, PAPER } from "./theme";

const SIZE = 2048;

function grainy(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, density: number) {
  ctx.save();
  ctx.fillStyle = PAPER.surface;
  const count = Math.floor(w * h * density);
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = 0.25 + Math.random() * 0.5;
    ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 1.6, 1.6);
  }
  ctx.restore();
}

// Floor texture: hairline grid at the tick values, split into quadrants at each
// axis median. The quadrant that is better on both floor axes gets a highlighter
// wash, the one worse on both a faint graphite tone. Canvas u runs along +x and
// canvas v along +z, so the better corner is bottom-right.
export function drawFloor(canvas: HTMLCanvasElement, xs: AxisScale, zs: AxisScale) {
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, SIZE, SIZE);
  const mx = xs.medianT * SIZE;
  const mz = zs.medianT * SIZE;

  ctx.fillStyle = "rgba(37, 99, 235, 0.10)";
  ctx.fillRect(mx, mz, SIZE - mx, SIZE - mz);
  grainy(ctx, mx, mz, SIZE - mx, SIZE - mz, 0.012);
  ctx.fillStyle = "rgba(100, 116, 139, 0.06)";
  ctx.fillRect(0, 0, mx, mz);

  ctx.strokeStyle = PAPER.hairline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const t of xs.ticks) {
    ctx.moveTo(t.t * SIZE, 0);
    ctx.lineTo(t.t * SIZE, SIZE);
  }
  for (const t of zs.ticks) {
    ctx.moveTo(0, t.t * SIZE);
    ctx.lineTo(SIZE, t.t * SIZE);
  }
  ctx.stroke();

  ctx.strokeStyle = PAPER.axis;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mx, 0);
  ctx.lineTo(mx, SIZE);
  ctx.moveTo(0, mz);
  ctx.lineTo(SIZE, mz);
  ctx.stroke();

  const direction = (scale: AxisScale, better: boolean) => {
    const high = better ? scale.def.better === "high" : scale.def.better !== "high";
    return `${high ? "higher" : "lower"} ${scale.def.shortTitle.toLowerCase()}`;
  };
  const xg = direction(xs, true);
  const xb = direction(xs, false);
  const zg = direction(zs, true);
  const zb = direction(zs, false);
  const pad = 72;
  const label = (text: string, x: number, y: number, align: CanvasTextAlign, strong: boolean) => {
    const preferredSize = strong ? 108 : 84;
    const fontSize = Math.max(46, Math.min(preferredSize, 1850 / Math.max(12, text.length * 0.55)));
    ctx.font = `${strong ? 600 : 500} ${fontSize}px ${FONTS.serif}`;
    ctx.fillStyle = strong ? PAPER.ink : PAPER.muted;
    ctx.textAlign = align;
    ctx.textBaseline = y > SIZE / 2 ? "bottom" : "top";
    ctx.fillText(text, x, y);
  };
  label(`${xg} + ${zg}`, SIZE - pad, SIZE - pad, "right", true);
  label(`${xb} + ${zb}`, pad, pad, "left", false);
  label(`${xg} but ${zb}`, SIZE - pad, pad, "right", false);
  label(`${zg} but ${xb}`, pad, SIZE - pad, "left", false);
}

// Back walls: paper card with a warm wash rising toward the top edge on the
// better side, so "up and toward the highlighter" reads as good from any angle.
export function drawWall(canvas: HTMLCanvasElement) {
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(241, 245, 249, 0.72)";
  ctx.fillRect(0, 0, 1024, 1024);
  const g = ctx.createRadialGradient(1024, 0, 0, 1024, 0, 1100);
  g.addColorStop(0, "rgba(37, 99, 235, 0.14)");
  g.addColorStop(0.55, "rgba(37, 99, 235, 0.04)");
  g.addColorStop(1, "rgba(37, 99, 235, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 1024);
}

export function canvasTexture(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}
