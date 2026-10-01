import { useMemo, useState } from "react";
import { inkFor, FEATURED_INKS, OTHER_INK } from "../../lib/leaderboard/scene/theme";
import type { DatasetConfig } from "../../lib/leaderboard/metrics";
import type { DatasetId, LeaderboardData, ModelRecord, WeightsFilter } from "../../lib/leaderboard/types";
import FilterControls from "./FilterControls";
import LeaderboardScene from "./LeaderboardScene";
import { useLeaderboardFilter } from "./useLeaderboardFilter";

type CoverageFilter = "all" | "complete" | "missing";

interface MetricGroup {
  id: string;
  label: string;
  keys: string[];
}

const METRIC_GROUPS: Record<DatasetId, MetricGroup[]> = {
  language: [
    { id: "quality", label: "Quality", keys: ["intelligence"] },
    { id: "cost", label: "Cost", keys: ["costTask", "tokenPrice", "inputPrice", "outputPrice"] },
    { id: "token-use", label: "Token use", keys: ["tokensTask"] },
    { id: "performance", label: "Speed and latency", keys: ["speed", "latency", "totalTime"] },
    { id: "capacity", label: "Context", keys: ["context"] },
  ],
  image: [
    { id: "quality", label: "Quality", keys: ["quality"] },
    { id: "cost", label: "Cost", keys: ["price"] },
    { id: "evidence", label: "Rating evidence", keys: ["appearances", "uncertainty"] },
  ],
  voice: [
    { id: "quality", label: "Quality", keys: ["quality", "speechReasoning", "agentSuccess"] },
    { id: "cost", label: "Cost", keys: ["inputCost", "inputPrice", "outputPrice", "taskCost"] },
    { id: "performance", label: "Latency", keys: ["latency"] },
  ],
  video: [
    { id: "quality", label: "Quality", keys: ["quality"] },
    { id: "cost", label: "Cost", keys: ["price"] },
    { id: "evidence", label: "Rating evidence", keys: ["appearances", "uncertainty"] },
  ],
};

function ModelTable({
  rows,
  frontier,
  config,
  columns,
  defaultSortKey,
  scrollBody = false,
}: {
  rows: ModelRecord[];
  frontier: Set<string>;
  config: DatasetConfig;
  columns: DatasetConfig["metrics"];
  defaultSortKey: string;
  scrollBody?: boolean;
}) {
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>(() => {
    const metric = config.metrics.find((item) => item.key === defaultSortKey);
    return { key: defaultSortKey, direction: metric?.better === "low" ? "asc" : "desc" };
  });

  const sortedRows = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((left, right) => {
      if (sort.key === "model") return direction * left.fullName.localeCompare(right.fullName);
      if (sort.key === "provider") return direction * left.creator.name.localeCompare(right.creator.name);

      const a = left.values[sort.key];
      const b = right.values[sort.key];
      if (a == null && b == null) return left.fullName.localeCompare(right.fullName);
      if (a == null) return 1;
      if (b == null) return -1;
      return direction * (a - b) || left.fullName.localeCompare(right.fullName);
    });
  }, [rows, sort]);

  const setSortKey = (key: string) => {
    setSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      const metric = config.metrics.find((item) => item.key === key);
      return {
        key,
        direction: key === "model" || key === "provider" || metric?.better === "low" ? "asc" : "desc",
      };
    });
  };

  const ariaSort = (key: string): "ascending" | "descending" | "none" =>
    sort.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  const SortButton = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <button type="button" className="fx-sort-button" onClick={() => setSortKey(sortKey)}>
      <span>{label}</span>
      <svg viewBox="0 0 12 14" aria-hidden="true" className={sort.key === sortKey ? "is-active" : ""}>
        {sort.key === sortKey && sort.direction === "asc" ? (
          <path d="m2 8 4-4 4 4M6 4v7" />
        ) : sort.key === sortKey ? (
          <path d="m2 6 4 4 4-4M6 3v7" />
        ) : (
          <path d="m2 5 4-3 4 3M2 9l4 3 4-3" />
        )}
      </svg>
    </button>
  );

  return (
    <div className={scrollBody ? "fx-table-wrap is-scrollable" : "fx-table-wrap"}>
      <table className="fx-table">
        <thead>
          <tr>
            <th scope="col" aria-sort={ariaSort("model")}>
              <SortButton label="Model" sortKey="model" />
            </th>
            <th scope="col" aria-sort={ariaSort("provider")}>
              <SortButton label="Provider" sortKey="provider" />
            </th>
            {columns.map((column) => (
              <th
                scope="col"
                className="num"
                key={column.key}
                title={column.description}
                aria-sort={ariaSort(column.key)}
              >
                <SortButton label={column.shortTitle} sortKey={column.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((model) => (
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
  const [metricGroup, setMetricGroup] = useState("all");
  const [coverage, setCoverage] = useState<CoverageFilter>("all");
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
    filteredModels,
    frontierIds,
    excludedForAxes,
  } = useLeaderboardFilter(data.datasets);

  const visibleIds = useMemo(() => new Set(visibleModels.map((model) => model.id)), [visibleModels]);
  const frontierRows = useMemo(
    () => visibleModels.filter((model) => frontierIds.has(model.id)),
    [visibleModels, frontierIds],
  );
  const is2D = !state.axes.z;
  const activeKeys = [state.axes.y, state.axes.x, state.axes.z].filter((key): key is string => Boolean(key));
  const allTableColumns = useMemo(() => {
    const orderedKeys = [...activeKeys, ...config.metrics.map((metric) => metric.key)];
    return [...new Set(orderedKeys)]
      .map((key) => config.metrics.find((metric) => metric.key === key))
      .filter((metric): metric is DatasetConfig["metrics"][number] => Boolean(metric));
  }, [activeKeys.join("|"), config]);
  const metricGroups = METRIC_GROUPS[config.id];
  const activeMetricGroup = metricGroups.some((group) => group.id === metricGroup) ? metricGroup : "all";
  const browserColumns = useMemo(() => {
    if (activeMetricGroup === "all") return allTableColumns;
    const keys = metricGroups.find((group) => group.id === activeMetricGroup)?.keys ?? [];
    return keys
      .map((key) => config.metrics.find((metric) => metric.key === key))
      .filter((metric): metric is DatasetConfig["metrics"][number] => Boolean(metric));
  }, [activeMetricGroup, allTableColumns, config, metricGroups]);
  const browserRows = useMemo(() => {
    if (coverage === "all") return filteredModels;
    return filteredModels.filter((model) => {
      const complete = config.metrics.every((metric) => model.values[metric.key] != null);
      return coverage === "complete" ? complete : !complete;
    });
  }, [config, coverage, filteredModels]);
  const tableCreators = useMemo(() => {
    const creators = new Map<string, string>();
    for (const model of dataset?.models ?? []) creators.set(model.creator.slug, model.creator.name);
    return [...creators].sort((left, right) => left[1].localeCompare(right[1]));
  }, [dataset]);
  const providerValue = state.creators.length === 1 ? state.creators[0] : state.creators.length > 1 ? "multiple" : "";
  const tableFiltersActive = Boolean(
    state.search ||
      state.creators.length ||
      state.weights !== "all" ||
      state.minContext ||
      state.axisRange ||
      coverage !== "all" ||
      activeMetricGroup !== "all",
  );
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
        <ModelTable
          key={`${dataset.id}-frontier`}
          rows={frontierRows}
          frontier={frontierIds}
          config={config}
          columns={allTableColumns}
          defaultSortKey={state.axes.y}
        />

        <section className="fx-data-browser" aria-labelledby="benchmark-data-heading">
          <div className="fx-data-browser-head">
            <div>
              <p className="fx-label">Dataset browser</p>
              <h2 id="benchmark-data-heading">All benchmark data</h2>
            </div>
            <p>Filter the records, choose a metric group, then sort any column.</p>
          </div>

          <div className="fx-table-controls">
            <div className="fx-table-control fx-table-categories">
              <span className="fx-label">Model category</span>
              <div className="fx-table-category-list" role="tablist" aria-label="Table model category">
                {data.datasets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={state.datasetId === item.id}
                    className={state.datasetId === item.id ? "is-on" : ""}
                    onClick={() => {
                      setMetricGroup("all");
                      setCoverage("all");
                      update({ datasetId: item.id });
                    }}
                  >
                    {item.label}
                    <span>{item.modelCount}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="fx-table-filter-grid">
              <label className="fx-table-control">
                <span className="fx-label">Search</span>
                <input
                  type="search"
                  value={state.search}
                  placeholder="Model or provider"
                  onChange={(event) => update({ search: event.target.value })}
                />
              </label>

              <label className="fx-table-control">
                <span className="fx-label">Provider</span>
                <select
                  value={providerValue}
                  onChange={(event) => update({ creators: event.target.value ? [event.target.value] : [] })}
                >
                  <option value="">All providers</option>
                  {providerValue === "multiple" && (
                    <option value="multiple" disabled>{state.creators.length} providers selected</option>
                  )}
                  {tableCreators.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
                </select>
              </label>

              <label className="fx-table-control">
                <span className="fx-label">Weights</span>
                <select
                  value={state.weights}
                  onChange={(event) => update({ weights: event.target.value as WeightsFilter })}
                >
                  <option value="all">All models</option>
                  <option value="open">Open weights</option>
                  <option value="closed">Closed weights</option>
                </select>
              </label>

              <label className="fx-table-control">
                <span className="fx-label">Data coverage</span>
                <select value={coverage} onChange={(event) => setCoverage(event.target.value as CoverageFilter)}>
                  <option value="all">Any coverage</option>
                  <option value="complete">All metrics available</option>
                  <option value="missing">Has missing metrics</option>
                </select>
              </label>
            </div>

            <div className="fx-table-control fx-metric-groups">
              <span className="fx-label">Metric category</span>
              <div className="fx-metric-group-list">
                <button
                  type="button"
                  aria-pressed={activeMetricGroup === "all"}
                  className={activeMetricGroup === "all" ? "is-on" : ""}
                  onClick={() => setMetricGroup("all")}
                >
                  All metrics
                </button>
                {metricGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={activeMetricGroup === group.id}
                    className={activeMetricGroup === group.id ? "is-on" : ""}
                    onClick={() => setMetricGroup(group.id)}
                  >
                    {group.label}
                  </button>
                ))}
                {tableFiltersActive && (
                  <button
                    type="button"
                    className="fx-table-clear"
                    onClick={() => {
                      reset();
                      setCoverage("all");
                      setMetricGroup("all");
                    }}
                  >
                    Clear table filters
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="fx-table-note">
            Showing <strong>{browserRows.length}</strong> of {dataset.models.length} models. These filters also update the chart
            and frontier. Models missing a chart metric remain available here and show n/a.
          </p>
          <ModelTable
            key={`${dataset.id}-${activeMetricGroup}`}
            rows={browserRows}
            frontier={frontierIds}
            config={config}
            columns={browserColumns}
            defaultSortKey={state.axes.y}
            scrollBody={true}
          />
        </section>
        {dataset.id === "language" && <p className="fx-footnote">* Intelligence score estimated by Artificial Analysis.</p>}
      </div>
    </section>
  );
}
