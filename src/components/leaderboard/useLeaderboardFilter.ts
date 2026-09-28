import { useCallback, useMemo, useState } from "react";
import { buildScale, configFor, metricDef } from "../../lib/leaderboard/metrics";
import { computeParetoFrontier } from "../../lib/leaderboard/paretoFrontier";
import type { AxisSelection, DatasetId, FilterState, LeaderboardDataset } from "../../lib/leaderboard/types";

const initialState = (datasetId: DatasetId = "language"): FilterState => {
  const config = configFor(datasetId);
  const preset = config.presets[0];
  return {
    datasetId,
    presetId: preset.id,
    axes: preset.axes,
    creators: [],
    search: "",
    axisRange: null,
    minContext: 0,
    weights: "all",
  };
};

export function useLeaderboardFilter(datasets: LeaderboardDataset[]) {
  const firstId = datasets[0]?.id ?? "language";
  const [state, setState] = useState<FilterState>(() => initialState(firstId));

  const update = useCallback((patch: Partial<FilterState>) => {
    setState((current) => {
      if (patch.datasetId && patch.datasetId !== current.datasetId) return initialState(patch.datasetId);
      return { ...current, ...patch };
    });
  }, []);

  const dataset = datasets.find((item) => item.id === state.datasetId) ?? datasets[0];
  const config = configFor(dataset?.id ?? "language");
  const models = dataset?.models ?? [];

  const selectPreset = useCallback((presetId: string) => {
    setState((current) => {
      const nextConfig = configFor(current.datasetId);
      const preset = nextConfig.presets.find((item) => item.id === presetId) ?? nextConfig.presets[0];
      return { ...current, presetId: preset.id, axes: preset.axes, axisRange: null };
    });
  }, []);

  const selectAxis = useCallback((axis: "x" | "y" | "z", key: string | null) => {
    setState((current) => {
      if (current.axes[axis] === key) return current;
      if (axis !== "z" && !key) return current;
      const axes: AxisSelection = { ...current.axes };
      const other = key
        ? (Object.keys(axes) as ("x" | "y" | "z")[]).find((item) => item !== axis && axes[item] === key)
        : undefined;
      if (other) {
        const previous = current.axes[axis];
        const replacement = previous ?? configFor(current.datasetId).metrics.find(
          (metric) => metric.key !== key && !Object.values(axes).includes(metric.key),
        )?.key;
        if (replacement) axes[other] = replacement;
      }
      if (axis === "z") axes.z = key;
      else axes[axis] = key!;
      return { ...current, axes, presetId: "custom", axisRange: axis === "x" ? null : current.axisRange };
    });
  }, []);

  const reset = useCallback(() => {
    setState((current) => ({
      ...current,
      creators: [],
      search: "",
      axisRange: null,
      minContext: 0,
      weights: "all",
    }));
  }, []);

  const scales = useMemo(
    () => ({
      x: buildScale(metricDef(config, state.axes.x), models),
      y: buildScale(metricDef(config, state.axes.y), models),
      z: state.axes.z ? buildScale(metricDef(config, state.axes.z), models) : null,
    }),
    [config, models, state.axes],
  );

  const visibleModels = useMemo(() => {
    const query = state.search.trim().toLowerCase();
    const creators = new Set(state.creators);
    const activeScales = scales.z ? [scales.x, scales.y, scales.z] : [scales.x, scales.y];
    return models.filter((model) => {
      if (activeScales.some((scale) => model.values[scale.def.key] == null)) return false;
      if (creators.size && !creators.has(model.creator.slug)) return false;
      if (state.weights === "open" && !model.openWeights) return false;
      if (state.weights === "closed" && model.openWeights) return false;
      if (state.minContext && (model.values.context ?? 0) < state.minContext) return false;
      if (state.axisRange) {
        const value = model.values[scales.x.def.key];
        if (value == null || value < state.axisRange[0] || value > state.axisRange[1]) return false;
      }
      if (query && !`${model.fullName} ${model.creator.name}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [models, scales, state]);

  const frontierIds = useMemo(
    () =>
      computeParetoFrontier(
        visibleModels.map((model) => ({
          id: model.id,
          scores: (scales.z ? [scales.x, scales.y, scales.z] : [scales.x, scales.y]).map((scale) =>
            scale.unit(model.values[scale.def.key]!),
          ),
        })),
      ),
    [visibleModels, scales],
  );

  const excludedForAxes = useMemo(
    () =>
      models.filter((model) =>
        (scales.z ? [scales.x, scales.y, scales.z] : [scales.x, scales.y]).some(
          (scale) => model.values[scale.def.key] == null,
        ),
      ).length,
    [models, scales],
  );

  return {
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
  };
}
