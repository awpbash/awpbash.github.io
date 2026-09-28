import { useMemo, useState } from "react";
import { inkFor, FEATURED_INKS, OTHER_INK } from "../../lib/leaderboard/scene/theme";
import type { DatasetConfig } from "../../lib/leaderboard/metrics";
import type { LeaderboardData, ModelRecord } from "../../lib/leaderboard/types";
import FilterControls from "./FilterControls";
import LeaderboardScene from "./LeaderboardScene";
import { useLeaderboardFilter } from "./useLeaderboardFilter";

function ModelTable({
  rows,
  frontier,
  config,
  activeKeys,
}: {
  rows: ModelRecord[];
  frontier: Set<string>;
  config: DatasetConfig;
  activeKeys: string[];
}) {
  const columns = activeKeys.map((key) => config.metrics.find((item) => item.key === key)!).filter(Boolean);
  return (
    <div className="fx-table-wrap">
      <table className="fx-table">
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Provider</th>
            {columns.map((column) => (
              <th scope="col" className="num" key={column.key} title={column.description}>
                {column.shortTitle}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((model) => (
            <tr key={model.id} className={frontier.has(model.id) ? "is-frontier" : ""}>
              <th scope="row">
                <span
                  className={model.openWeights ? "fx-glyph is-open" : "fx-glyph"}
                  style={{ ["--ink" as string]: inkFor(model.creator.slug) }}
                  aria-hidden="true"
                />
                {model.fullName}
                {model.estimated ? <span title="Estimated by Artificial Analysis">*</span> : null}
              </th>
              <td>{model.creator.name}</td>
              {columns.map((column) => (
                <td className="num" key={column.key}>
                  {model.values[column.key] == null ? "n/a" : column.format(model.values[column.key]!)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FrontierExplorer({ data }: { data: LeaderboardData }) {
  const [showSurface, setShowSurface] = useState(true);
  const {
    state,
    update,
    reset,
    selectPreset,
    selectAxis,
    dataset,
    config,
    scales,
    visibleModels,
    frontierIds,
    excludedForAxes,
  } = useLeaderboardFilter(data.datasets);

  const visibleIds = useMemo(() => new Set(visibleModels.map((model) => model.id)), [visibleModels]);
  const sortByY = (left: ModelRecord, right: ModelRecord) => {
    const a = left.values[scales.y.def.key] ?? 0;
    const b = right.values[scales.y.def.key] ?? 0;
    return scales.y.def.better === "high" ? b - a : a - b;
  };
  const frontierRows = useMemo(
    () => visibleModels.filter((model) => frontierIds.has(model.id)).sort(sortByY),
    [visibleModels, frontierIds, scales.y],
  );
  const allRows = useMemo(() => [...visibleModels].sort(sortByY), [visibleModels, scales.y]);
  const is2D = !state.axes.z;
  const activeKeys = [state.axes.y, state.axes.x, state.axes.z].filter((key): key is string => Boolean(key));
  const activeMetricNames = [scales.y, scales.x, scales.z]
    .filter((scale): scale is NonNullable<typeof scale> => Boolean(scale))
    .map((scale) => scale.def.shortTitle.toLowerCase());
  const metricList =
    activeMetricNames.length === 2
      ? `${activeMetricNames[0]} and ${activeMetricNames[1]}`
      : `${activeMetricNames.slice(0, -1).join(", ")}, and ${activeMetricNames.at(-1)}`;

  if (!dataset) return null;

  return (
    <section className="fx" aria-label="AI model Pareto frontier explorer">
      <FilterControls
        datasets={data.datasets}
        config={config}
        models={dataset.models}
        state={state}
        xScale={scales.x}
        update={update}
        selectPreset={selectPreset}
        selectAxis={selectAxis}
        reset={reset}
      />

      <div className="fx-view-summary">
        <strong>{config.label}</strong>
        <span>{config.description}</span>
        <a href={dataset.source} target="_blank" rel="noopener">
          Source data ↗
        </a>
      </div>

      <figure className="fx-figure">
        <LeaderboardScene
          key={dataset.id}
          models={dataset.models}
          config={config}
          axes={state.axes}
          visible={visibleIds}
          frontier={frontierIds}
          surfaceVisible={showSurface}
        />
        <figcaption className="fx-caption">
          <span>
            <strong>{visibleModels.length}</strong> of {dataset.models.length} models plotted · <strong>{frontierIds.size}</strong> on the frontier
            {excludedForAxes > 0 ? ` · ${excludedForAxes} lack one or more selected metrics` : ""}
          </span>
          <span className="fx-hint">
            {is2D ? "Click the chart, then scroll to zoom. Hover a point for details." : "Drag to rotate. Click the chart, then scroll to zoom. Hover a point for details."}
          </span>
        </figcaption>
      </figure>

      <ul className="fx-legend" aria-label="Chart legend">
        {Object.entries(FEATURED_INKS).map(([slug, ink]) => (
          <li key={slug}>
            <span className="fx-glyph" style={{ ["--ink" as string]: ink.color }} />
            {ink.label}
          </li>
        ))}
        <li>
          <span className="fx-glyph" style={{ ["--ink" as string]: OTHER_INK.color }} />
          {OTHER_INK.label}
        </li>
        <li>
          <span className="fx-glyph is-open" style={{ ["--ink" as string]: OTHER_INK.color }} />
          Open weights
        </li>
        <li>
          <span className="fx-glyph is-frontier" style={{ ["--ink" as string]: OTHER_INK.color }} />
          Pareto frontier
        </li>
        {is2D ? (
          <li>
            <svg className="fx-legend-sheet" viewBox="0 0 24 14" aria-hidden="true">
              <path d="M1 12 L7 9 L13 8 L18 4 L23 2" fill="none" stroke="#2563eb" strokeWidth="1.5" />
            </svg>
            Line connects frontier points
          </li>
        ) : (
          <li className="fx-legend-guide">
            <svg className="fx-legend-sheet" viewBox="0 0 24 14" aria-hidden="true">
              <path d="M1 13 L8 2 L14 8 L23 3 L23 13 Z" fill="#dbeafe" fillOpacity="0.35" stroke="#2563eb" strokeWidth="1" />
              <path d="M8 2 L10 13 M14 8 L10 13 M14 8 L23 13" fill="none" stroke="#2563eb" strokeWidth="0.7" />
            </svg>
            <span>Interpolated frontier guide</span>
            <button
              type="button"
              className="fx-guide-toggle"
              aria-pressed={showSurface}
              onClick={() => setShowSurface((visible) => !visible)}
            >
              {showSurface ? "Hide" : "Show"}
            </button>
          </li>
        )}
      </ul>
      <p className="fx-guide-note">
        Frontier markers represent measured models. The connecting {is2D ? "line" : "surface"} is an interpolated visual guide.
      </p>

      <div className="fx-frontier">
        <h2>
          Current Pareto frontier <span className="fx-count">{frontierRows.length}</span>
        </h2>
        <p>
          Within the current filters, no other model is at least as good on {metricList} while being strictly better on one.
          Changing an axis changes the question and recomputes this set.
        </p>
        <ModelTable rows={frontierRows} frontier={frontierIds} config={config} activeKeys={activeKeys} />
        <details className="fx-all">
          <summary>All plotted models ({allRows.length})</summary>
          <ModelTable rows={allRows} frontier={frontierIds} config={config} activeKeys={activeKeys} />
        </details>
        {dataset.id === "language" && <p className="fx-footnote">* Intelligence score estimated by Artificial Analysis.</p>}
      </div>
    </section>
  );
}
