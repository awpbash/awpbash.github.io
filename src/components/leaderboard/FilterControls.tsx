import { useMemo, useState } from "react";
import type { AxisScale, DatasetConfig } from "../../lib/leaderboard/metrics";
import { FEATURED_INKS } from "../../lib/leaderboard/scene/theme";
import type { DatasetId, FilterState, LeaderboardDataset, ModelRecord } from "../../lib/leaderboard/types";

interface Props {
  datasets: LeaderboardDataset[];
  config: DatasetConfig;
  models: ModelRecord[];
  state: FilterState;
  xScale: AxisScale;
  update: (patch: Partial<FilterState>) => void;
  selectPreset: (presetId: string) => void;
  selectAxis: (axis: "x" | "y" | "z", key: string | null) => void;
  reset: () => void;
}

const STEPS = 1000;
const CONTEXT_OPTIONS = [
  { value: 0, label: "Any context" },
  { value: 200_000, label: "200k+ tokens" },
  { value: 400_000, label: "400k+ tokens" },
  { value: 1_000_000, label: "1M+ tokens" },
];
const PRIMARY_CHIPS = 9;

type IconName = DatasetId | "chevron" | "search" | "sliders" | "context";

function UiIcon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "language")
    return (
      <svg {...common}>
        <path d="M5 5.5h14v9H9l-4 3v-12Z" />
        <path d="M8.5 9.8h7" />
      </svg>
    );
  if (name === "image")
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.4" />
        <path d="m6.5 17 4.2-4 2.6 2.3 2-1.8 2.5 3.5" />
      </svg>
    );
  if (name === "voice")
    return (
      <svg {...common}>
        <path d="M5 10v4M8.5 7v10M12 4v16M15.5 7v10M19 10v4" />
      </svg>
    );
  if (name === "video")
    return (
      <svg {...common}>
        <rect x="3.5" y="6" width="12.5" height="12" rx="2" />
        <path d="m16 10 4.5-2.5v9L16 14" />
      </svg>
    );
  if (name === "chevron")
    return (
      <svg {...common}>
        <path d="m8 10 4 4 4-4" />
      </svg>
    );
  if (name === "search")
    return (
      <svg {...common}>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 4 4" />
      </svg>
    );
  if (name === "context")
    return (
      <svg {...common}>
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <path d="M8 9h8M8 12h8M8 15h5" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h7M15 17h5" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="13" cy="17" r="2" />
    </svg>
  );
}

function providerInitial(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return words.length > 1 ? words.slice(0, 2).map((word) => word[0]).join("") : name.slice(0, 1);
}

function Segmented<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="fx-seg" role="radiogroup" aria-label={props.label}>
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={props.value === option.value}
          className={props.value === option.value ? "is-on" : ""}
          onClick={() => props.onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function FilterControls({
  datasets,
  config,
  models,
  state,
  xScale,
  update,
  selectPreset,
  selectAxis,
  reset,
}: Props) {
  const [showAllLabs, setShowAllLabs] = useState(false);

  const creators = useMemo(() => {
    const counts = new Map<string, { slug: string; name: string; count: number }>();
    for (const model of models) {
      const creator = counts.get(model.creator.slug) ?? { ...model.creator, count: 0 };
      creator.count++;
      counts.set(model.creator.slug, creator);
    }
    const featured = Object.keys(FEATURED_INKS);
    return [...counts.values()].sort(
      (left, right) =>
        Number(featured.includes(right.slug)) - Number(featured.includes(left.slug)) ||
        right.count - left.count ||
        left.name.localeCompare(right.name),
    );
  }, [models]);

  const [lo, hi] = xScale.domain;
  const fwd = xScale.def.scale === "log" ? Math.log10 : (value: number) => value;
  const inv = xScale.def.scale === "log" ? (value: number) => 10 ** value : (value: number) => value;
  const a = fwd(lo);
  const b = fwd(hi);
  const toStep = (value: number) => Math.round(((fwd(value) - a) / (b - a || 1)) * STEPS);
  const fromStep = (step: number) => inv(a + ((b - a) * step) / STEPS);
  const range = state.axisRange ?? [lo, hi];
  const setRange = (which: 0 | 1, step: number) => {
    const next: [number, number] = [range[0], range[1]];
    next[which] = fromStep(step);
    if (next[0] > next[1]) next[which === 0 ? 1 : 0] = next[which];
    const full = toStep(next[0]) <= 0 && toStep(next[1]) >= STEPS;
    update({ axisRange: full ? null : next });
  };

  const toggleCreator = (slug: string) => {
    const selected = new Set(state.creators);
    selected.has(slug) ? selected.delete(slug) : selected.add(slug);
    update({ creators: [...selected] });
  };

  const visibleChips = showAllLabs ? creators : creators.slice(0, PRIMARY_CHIPS);
  const filtersActive = Boolean(
    state.creators.length || state.search || state.axisRange || state.minContext || state.weights !== "all",
  );
  const activePreset = config.presets.find((preset) => preset.id === state.presetId);

  return (
    <div className="fx-controls">
      <div className="fx-datasets" role="tablist" aria-label="Model category">
        {datasets.map((dataset) => (
          <button
            key={dataset.id}
            type="button"
            role="tab"
            aria-selected={state.datasetId === dataset.id}
            className={state.datasetId === dataset.id ? "is-on" : ""}
            onClick={() => update({ datasetId: dataset.id as DatasetId })}
          >
            <UiIcon name={dataset.id} className="fx-dataset-icon" />
            <span className="fx-dataset-name">{dataset.label}</span>
            <span className="fx-dataset-count">{dataset.modelCount}</span>
          </button>
        ))}
      </div>

      <div className="fx-config-panel">
        <div className="fx-config-head">
          <label className="fx-preset">
            <span className="fx-label">Use case preset</span>
            <span className="fx-select-wrap fx-select-preset">
              <UiIcon name="sliders" className="fx-select-leading" />
              <select value={state.presetId} onChange={(event) => selectPreset(event.target.value)}>
                {config.presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
                {state.presetId === "custom" && <option value="custom">Custom axes</option>}
              </select>
              <UiIcon name="chevron" className="fx-select-chevron" />
            </span>
          </label>
          <p>{activePreset?.description ?? "Custom axis selection."}</p>
        </div>

        <div className="fx-axes" aria-label="Axis configuration">
          {(["x", "y", "z"] as const).map((axis) => (
            <label key={axis} className="fx-axis-select">
              <span className="fx-label">{axis.toUpperCase()} axis{axis === "z" ? " (optional)" : ""}</span>
              <span className="fx-select-wrap fx-select-axis">
                <span className={`fx-axis-badge is-${axis}`}>{axis.toUpperCase()}</span>
                <select
                  value={state.axes[axis] ?? ""}
                  onChange={(event) => selectAxis(axis, event.target.value || null)}
                >
                  {axis === "z" && <option value="">None. Use 2D</option>}
                  {config.metrics.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.shortTitle}, {item.better === "high" ? "higher" : "lower"} is better
                    </option>
                  ))}
                </select>
                <UiIcon name="chevron" className="fx-select-chevron" />
              </span>
              <small>
                {axis === "z" && !state.axes.z
                  ? "Leave this blank to compare only the X and Y metrics."
                  : config.metrics.find((item) => item.key === state.axes[axis])?.description}
              </small>
            </label>
          ))}
        </div>
      </div>

      <div className="fx-row fx-row-filters">
        <label className="fx-field fx-search">
          <span className="fx-label">Search</span>
          <span className="fx-input-wrap">
            <UiIcon name="search" className="fx-input-icon" />
            <input
              type="search"
              placeholder="Model or provider"
              value={state.search}
              onChange={(event) => update({ search: event.target.value })}
            />
          </span>
        </label>

        <div className="fx-field fx-range">
          <span className="fx-label">
            Limit {xScale.def.shortTitle}
            <span className="fx-range-values">
              {xScale.def.format(range[0])} to {xScale.def.format(range[1])}
            </span>
          </span>
          <div className="fx-range-track">
            <input
              type="range"
              min={0}
              max={STEPS}
              value={toStep(range[0])}
              aria-label={`Lowest ${xScale.def.shortTitle}`}
              onChange={(event) => setRange(0, Number(event.target.value))}
            />
            <input
              type="range"
              min={0}
              max={STEPS}
              value={toStep(range[1])}
              aria-label={`Highest ${xScale.def.shortTitle}`}
              onChange={(event) => setRange(1, Number(event.target.value))}
            />
          </div>
        </div>

        <div className="fx-field">
          <span className="fx-label">Weights</span>
          <Segmented
            label="Weights"
            value={state.weights}
            options={[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ]}
            onChange={(weights) => update({ weights })}
          />
        </div>

        {state.datasetId === "language" && (
          <label className="fx-field">
            <span className="fx-label">Minimum context</span>
            <span className="fx-select-wrap fx-select-context">
              <UiIcon name="context" className="fx-select-leading" />
              <select value={state.minContext} onChange={(event) => update({ minContext: Number(event.target.value) })}>
                {CONTEXT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <UiIcon name="chevron" className="fx-select-chevron" />
            </span>
          </label>
        )}
      </div>

      <div className="fx-row fx-chips" aria-label="Providers">
        <span className="fx-label">Providers</span>
        {visibleChips.map((creator) => {
          const selected = state.creators.includes(creator.slug);
          const ink = FEATURED_INKS[creator.slug]?.color ?? "#64748b";
          return (
            <button
              key={creator.slug}
              type="button"
              aria-pressed={selected}
              className={selected ? "fx-chip is-on" : "fx-chip"}
              onClick={() => toggleCreator(creator.slug)}
            >
              <span className="fx-provider-mark" style={{ background: ink }} aria-hidden="true">
                {providerInitial(creator.name)}
              </span>
              {creator.name}
              <span className="fx-count">{creator.count}</span>
            </button>
          );
        })}
        {creators.length > PRIMARY_CHIPS && (
          <button type="button" className="fx-chip fx-chip-more" onClick={() => setShowAllLabs((value) => !value)}>
            {showAllLabs ? "Show fewer" : `+${creators.length - PRIMARY_CHIPS} more`}
          </button>
        )}
        {filtersActive && (
          <button type="button" className="fx-reset" onClick={reset}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
