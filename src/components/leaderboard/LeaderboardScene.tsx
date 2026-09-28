import { useEffect, useRef, useState } from "react";
import type { DatasetConfig } from "../../lib/leaderboard/metrics";
import type { LeaderboardViewer, ViewerState } from "../../lib/leaderboard/scene/LeaderboardViewer";
import type { AxisSelection, ModelRecord } from "../../lib/leaderboard/types";

interface Props {
  models: ModelRecord[];
  config: DatasetConfig;
  axes: AxisSelection;
  visible: Set<string>;
  frontier: Set<string>;
  surfaceVisible: boolean;
}

export default function LeaderboardScene({ models, config, axes, visible, frontier, surfaceVisible }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<LeaderboardViewer | null>(null);
  const latest = useRef<ViewerState>({ config, axes, visible, frontier, surfaceVisible });
  const [status, setStatus] = useState<"loading" | "ready" | "no-webgl">("loading");

  latest.current = { config, axes, visible, frontier, surfaceVisible };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("../../lib/leaderboard/scene/LeaderboardViewer");
      if (cancelled || !hostRef.current) return;
      if (!mod.webglAvailable()) return setStatus("no-webgl");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      viewerRef.current = new mod.LeaderboardViewer(hostRef.current, models, reduced);
      viewerRef.current.update(latest.current);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
  }, [models]);

  useEffect(() => {
    viewerRef.current?.update({ config, axes, visible, frontier, surfaceVisible });
  }, [config, axes, visible, frontier, surfaceVisible]);

  return (
    <div className="fx-stage" ref={hostRef} data-status={status}>
      {status === "loading" && <div className="fx-stage-note">Loading chart…</div>}
      {status === "no-webgl" && (
        <div className="fx-stage-note">
          This figure needs WebGL, which this browser has turned off. The frontier table below has the same answer.
        </div>
      )}
    </div>
  );
}
