import type { AxisSelection, DatasetId, MetricKey, ModelRecord } from "./types";

export interface MetricDef {
  key: MetricKey;
  title: string;
  shortTitle: string;
  description: string;
  better: "high" | "low";
  scale: "linear" | "log";
  betterWord: string;
  badWord: string;
  format: (value: number) => string;
}

export interface ViewPreset {
  id: string;
  label: string;
  description: string;
  axes: AxisSelection;
}

export interface DatasetConfig {
  id: DatasetId;
  label: string;
  shortLabel: string;
  description: string;
  metrics: MetricDef[];
  presets: ViewPreset[];
}

const trim = (value: string) => value.replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");

export function formatUsd(value: number): string {
  if (value >= 100) return `$${Math.round(value).toLocaleString()}`;
  if (value >= 1) return `$${trim(value.toFixed(2))}`;
  if (value >= 0.01) return `$${trim(value.toFixed(3))}`;
  return `$${trim(value.toPrecision(2))}`;
}

export function formatTokens(value: number): string {
  if (value >= 1e6) return `${trim((value / 1e6).toFixed(1))}M`;
  if (value >= 1e3) return `${trim((value / 1e3).toFixed(1))}k`;
  return Math.round(value).toLocaleString();
}

const formatSeconds = (value: number) =>
  value < 10 ? `${trim(value.toFixed(2))}s` : value < 120 ? `${trim(value.toFixed(1))}s` : `${trim((value / 60).toFixed(1))}m`;

const metric = (
  key: MetricKey,
  title: string,
  shortTitle: string,
  description: string,
  better: "high" | "low",
  scale: "linear" | "log",
  format: (value: number) => string,
): MetricDef => ({
  key,
  title,
  shortTitle,
  description,
  better,
  scale,
  betterWord: better === "high" ? "higher" : "lower",
  badWord: better === "high" ? "lower" : "higher",
  format,
});

const languageMetrics = [
  metric("intelligence", "Artificial Analysis Intelligence Index", "Intelligence", "Composite benchmark score.", "high", "linear", (v) => v.toFixed(1)),
  metric("costTask", "Cost per benchmark task", "Cost / task", "Measured evaluation cost, including how many tokens the model uses.", "low", "log", formatUsd),
  metric("tokensTask", "Output tokens per benchmark task", "Tokens / task", "Answer and reasoning tokens used per Intelligence Index task.", "low", "log", formatTokens),
  metric("tokenPrice", "Blended API price per 1M tokens", "API price / 1M", "Three parts input to one part output pricing.", "low", "log", formatUsd),
  metric("inputPrice", "Input price per 1M tokens", "Input price", "Published API input-token price.", "low", "log", formatUsd),
  metric("outputPrice", "Output price per 1M tokens", "Output price", "Published API output-token price.", "low", "log", formatUsd),
  metric("speed", "Output speed in tokens per second", "Output speed", "Median measured generation throughput.", "high", "log", (v) => `${Math.round(v)} t/s`),
  metric("latency", "Time to first answer token", "Answer latency", "Wait until the first answer token, including reasoning time.", "low", "log", formatSeconds),
  metric("totalTime", "End-to-end response time", "Total response", "Median time until the response is complete.", "low", "log", formatSeconds),
  metric("context", "Context window in tokens", "Context window", "Maximum supported input context.", "high", "log", formatTokens),
];

const arenaMetrics = (priceTitle: string, priceShort: string) => [
  metric("quality", "Arena quality Elo", "Quality Elo", "Preference rating from blind Arena comparisons.", "high", "linear", (v) => Math.round(v).toString()),
  metric("price", priceTitle, priceShort, "Representative published API price.", "low", "log", formatUsd),
  metric("winRate", "Arena win rate", "Win rate", "Share of non-tied Arena comparisons won.", "high", "linear", (v) => `${trim((v * 100).toFixed(1))}%`),
  metric("appearances", "Arena comparisons", "Comparisons", "Number of Arena matchups behind the rating.", "high", "log", (v) => Math.round(v).toLocaleString()),
  metric("uncertainty", "Elo confidence interval (±)", "Rating uncertainty", "Smaller intervals indicate a more established rating.", "low", "linear", (v) => `±${Math.round(v)}`),
];

export const DATASET_CONFIGS: Record<DatasetId, DatasetConfig> = {
  language: {
    id: "language",
    label: "Language models",
    shortLabel: "Language",
    description: "Compare benchmark quality, token use, API pricing, throughput, latency, and context size.",
    metrics: languageMetrics,
    presets: [
      { id: "api-value", label: "API value", description: "Quality versus measured cost per task and throughput.", axes: { x: "costTask", y: "intelligence", z: "speed" } },
      { id: "token-budget", label: "Fixed token budget", description: "Highlights models that reach their score with fewer output tokens.", axes: { x: "tokensTask", y: "intelligence", z: "speed" } },
      { id: "api-rates", label: "Published API rates", description: "Quality versus blended token price and answer latency.", axes: { x: "tokenPrice", y: "intelligence", z: "latency" } },
      { id: "interactive", label: "Interactive use", description: "Quality versus first-answer latency and total response time.", axes: { x: "latency", y: "intelligence", z: "totalTime" } },
      { id: "long-context", label: "Long context", description: "Quality, context capacity, and measured task cost.", axes: { x: "context", y: "intelligence", z: "costTask" } },
    ],
  },
  image: {
    id: "image",
    label: "Text-to-image models",
    shortLabel: "Image",
    description: "Compare Image Arena preference, representative API price, and rating evidence.",
    metrics: arenaMetrics("Price per 1,000 images", "Price / 1k images"),
    presets: [
      { id: "quality-price", label: "Quality and price", description: "Arena quality, price, and win rate.", axes: { x: "price", y: "quality", z: "winRate" } },
      { id: "rating-confidence", label: "Rating confidence", description: "Quality, uncertainty, and number of Arena comparisons.", axes: { x: "uncertainty", y: "quality", z: "appearances" } },
    ],
  },
  voice: {
    id: "voice",
    label: "Speech-to-speech models",
    shortLabel: "Voice",
    description: "Compare native voice-agent quality, time to first audio, and audio pricing.",
    metrics: [
      metric("quality", "Speech-to-Speech Index", "Quality index", "Artificial Analysis composite voice-agent score.", "high", "linear", (v) => `${trim(v.toFixed(1))}%`),
      metric("latency", "Time to first audio", "First audio", "Seconds until audio output begins.", "low", "log", formatSeconds),
      metric("inputCost", "Cost per hour of input audio", "Input cost / hour", "Measured cost normalized to one hour of input audio.", "low", "log", formatUsd),
      metric("inputPrice", "API price per hour of audio input", "Input API rate", "Published input-audio API rate.", "low", "log", formatUsd),
      metric("outputPrice", "API price per hour of audio output", "Output API rate", "Published output-audio API rate.", "low", "log", formatUsd),
      metric("taskCost", "Average cost per benchmark task", "Cost / task", "Average benchmark task cost.", "low", "log", formatUsd),
      metric("speechReasoning", "Speech reasoning score", "Speech reasoning", "Big Bench Audio score.", "high", "linear", (v) => `${trim((v * 100).toFixed(1))}%`),
      metric("agentSuccess", "Voice-agent task success", "Agent success", "Task success on the voice-agent evaluation.", "high", "linear", (v) => `${trim((v * 100).toFixed(1))}%`),
    ],
    presets: [
      { id: "balanced", label: "Voice-agent value", description: "Overall quality, first-audio latency, and measured input cost.", axes: { x: "inputCost", y: "quality", z: "latency" } },
      { id: "api-rates", label: "Published API rates", description: "Quality, output-audio pricing, and latency.", axes: { x: "outputPrice", y: "quality", z: "latency" } },
      { id: "agent", label: "Agent performance", description: "Voice-agent success, latency, and task cost.", axes: { x: "taskCost", y: "agentSuccess", z: "latency" } },
    ],
  },
  video: {
    id: "video",
    label: "Text-to-video models",
    shortLabel: "Video",
    description: "Compare Video Arena quality, per-minute API price, and rating evidence.",
    metrics: arenaMetrics("API price per generated minute", "Price / minute"),
    presets: [
      { id: "quality-price", label: "Quality and price", description: "Arena quality, price, and rating certainty.", axes: { x: "price", y: "quality", z: "uncertainty" } },
      { id: "rating-confidence", label: "Rating confidence", description: "Quality, uncertainty, and number of Arena comparisons.", axes: { x: "uncertainty", y: "quality", z: "appearances" } },
    ],
  },
};

export const configFor = (id: DatasetId) => DATASET_CONFIGS[id];
export const metricDef = (config: DatasetConfig, key: MetricKey) =>
  config.metrics.find((item) => item.key === key) ?? config.metrics[0];

export interface Tick {
  value: number;
  t: number;
  label: string;
}

export interface AxisScale {
  def: MetricDef;
  domain: [number, number];
  unit: (value: number) => number;
  ticks: Tick[];
  medianT: number;
}

export function buildScale(def: MetricDef, models: ModelRecord[]): AxisScale {
  const values = models.map((model) => model.values[def.key]).filter((value): value is number => value != null && Number.isFinite(value) && value > 0);
  let lo = values.length ? Math.min(...values) : 0.1;
  let hi = values.length ? Math.max(...values) : 1;
  const fwd = def.scale === "log" ? Math.log10 : (value: number) => value;

  if (def.scale === "linear") {
    const span = hi - lo || Math.max(1, Math.abs(hi) * 0.1);
    lo = Math.max(0, lo - span * 0.04);
    hi += span * 0.04;
  } else {
    const span = Math.log10(hi) - Math.log10(lo) || 1;
    lo = 10 ** (Math.log10(lo) - span * 0.04);
    hi = 10 ** (Math.log10(hi) + span * 0.04);
  }

  const a = fwd(lo);
  const b = fwd(hi);
  const raw = (value: number) => (fwd(Math.min(Math.max(value, lo), hi)) - a) / (b - a || 1);
  const unit = (value: number) => (def.better === "high" ? raw(value) : 1 - raw(value));
  const sorted = [...values].sort((left, right) => left - right);
  const median = sorted[Math.floor(sorted.length / 2)] ?? lo;

  return { def, domain: [lo, hi], unit, ticks: makeTicks(def, lo, hi, unit), medianT: unit(median) };
}

function makeTicks(def: MetricDef, lo: number, hi: number, unit: (value: number) => number): Tick[] {
  const values: number[] = [];
  if (def.scale === "linear") {
    const rawStep = (hi - lo) / 4;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep || 1));
    const normalized = rawStep / magnitude;
    const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
    for (let value = Math.ceil(lo / step) * step; value <= hi + step * 0.001; value += step) values.push(value);
  } else {
    const kLo = Math.floor(Math.log10(lo));
    const kHi = Math.ceil(Math.log10(hi));
    const mantissas = kHi - kLo > 4 ? [1] : kHi - kLo > 2 ? [1, 3] : [1, 2, 5];
    for (let power = kLo; power <= kHi; power++) {
      for (const mantissa of mantissas) {
        const value = mantissa * 10 ** power;
        if (value >= lo && value <= hi) values.push(value);
      }
    }
  }
  return values.map((value) => ({ value, t: unit(value), label: def.format(value) }));
}
