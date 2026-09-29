import { useMemo, useState } from "react";

interface AreaFeature {
  properties: { id: string; name: string; region: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: any };
}
interface MapResult {
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
  inScope: number;
  model: string;
}
type Status = "idle" | "thinking" | "done" | "error";

const EXAMPLES = [
  "east side best side",
  "somewhere that proves Yishun isn't that bad",
  "places to cry after a bad meeting",
  "a first date with Wi-Fi",
  "supper at 2am",
];

const WIDTH = 1000;
const COS_LAT = Math.cos((1.35 * Math.PI) / 180);

// Sequential blue ramp. Shading uses sqrt(p / max) so second and third choices still read.
const RAMP = ["#eef3f9", "#c9dcf3", "#8fb8ea", "#4a86d8", "#1d4ed8", "#172f7a"];
const BASE_FILL = "#eef3f9";
function rampColor(t: number) {
  const x = Math.min(1, Math.max(0, t)) * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(x));
  const f = x - i;
  const a = parseInt(RAMP[i].slice(1), 16);
  const b = parseInt(RAMP[i + 1].slice(1), 16);
  const mix = (shift: number) => Math.round(((a >> shift) & 255) * (1 - f) + ((b >> shift) & 255) * f);
  return `rgb(${mix(16)},${mix(8)},${mix(0)})`;
}

const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());
const pct = (n: number) => (n >= 0.01 ? `${Math.round(n * 100)}%` : "<1%");

function useProjection(features: AreaFeature[]) {
  return useMemo(() => {
    const rings = (g: AreaFeature["geometry"]): number[][][] => (g.type === "Polygon" ? g.coordinates : g.coordinates.flat());
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const f of features)
      for (const ring of rings(f.geometry))
        for (const [lon, lat] of ring) {
          minX = Math.min(minX, lon * COS_LAT); maxX = Math.max(maxX, lon * COS_LAT);
          minY = Math.min(minY, -lat); maxY = Math.max(maxY, -lat);
        }
    const k = WIDTH / (maxX - minX);
    const height = (maxY - minY) * k;
    const project = ([lon, lat]: number[]) => [(lon * COS_LAT - minX) * k, (-lat - minY) * k];

    const areas = features.map((f) => {
      const polys = rings(f.geometry).map((ring) => ring.map(project));
      const d = polys.map((ring) => "M" + ring.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z").join("");
      // Label point: vertex average of the largest ring. Good enough for small, chunky shapes.
      const largest = polys.reduce((a, b) => (b.length > a.length ? b : a));
      const cx = largest.reduce((s, p) => s + p[0], 0) / largest.length;
      const cy = largest.reduce((s, p) => s + p[1], 0) / largest.length;
      return { id: f.properties.id, name: titleCase(f.properties.name), d, cx, cy };
    });
    return { areas, height };
  }, [features]);
}

export default function SgMap({ features }: { features: AreaFeature[] }) {
  const { areas, height } = useProjection(features);
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<MapResult | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  async function ask(text: string) {
    const q = text.trim();
    if (q.length < 3 || status === "thinking") return;
    setQuery(q);
    setStatus("thinking");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/sg-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setAsked(q);
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const shaded = result && result.inScope >= 0.5 ? result : null;
  const maxP = shaded ? Math.max(...Object.values(shaded.probabilities)) : 1;
  const top = shaded ? areas.find((a) => a.id === shaded.choice) : undefined;
  const ranked = shaded
    ? areas
        .map((a) => ({ ...a, p: shaded.probabilities[a.id] ?? 0 }))
        .sort((a, b) => b.p - a.p)
        .slice(0, 6)
    : [];
  const labelled = new Set(top ? [top.id] : []);
  const hovered = hover ? areas.find((a) => a.id === hover) : undefined;
  const hoverLabel = hovered
    ? `${hovered.name}${shaded ? ` · ${pct(shaded.probabilities[hovered.id] ?? 0)}` : ""}`
    : "";
  const hoverLabelWidth = Math.max(150, hoverLabel.length * 14);

  return (
    <div className="sg">
      <form
        className="sg-ask"
        onSubmit={(e) => {
          e.preventDefault();
          ask(query);
        }}
      >
        <label className="nb-label" htmlFor="sg-q">
          What are you in the mood for?
        </label>
        <div className="sg-row">
          <input
            id="sg-q"
            className="sg-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="places to cry after a bad meeting"
            maxLength={200}
            autoComplete="off"
          />
          <button className="nb-btn" disabled={query.trim().length < 3 || status === "thinking"}>
            {status === "thinking" ? "Jev is thinking" : "Ask Jev"}
          </button>
        </div>
        <p className="sg-examples nb-mono">
          or try:{" "}
          {EXAMPLES.map((ex) => (
            <button type="button" key={ex} onClick={() => ask(ex)} disabled={status === "thinking"}>
              {ex}
            </button>
          ))}
        </p>
      </form>

      <div className="sg-grid">
        <figure className="sg-map" data-thinking={status === "thinking"}>
          <svg viewBox={`-10 -10 ${WIDTH + 20} ${height + 20}`} role="img" aria-label="Map of Singapore planning areas">
            {areas.map((a) => {
              const p = shaded?.probabilities[a.id] ?? 0;
              const t = shaded ? Math.sqrt(p / maxP) : 0;
              const dist = top ? Math.hypot(a.cx - top.cx, a.cy - top.cy) : 0;
              return (
                <path
                  key={a.id}
                  d={a.d}
                  className="sg-area"
                  data-top={a.id === top?.id}
                  style={{
                    fill: shaded ? rampColor(t) : BASE_FILL,
                    transitionDelay: shaded ? `${Math.round(dist * 1.1)}ms` : "0ms",
                  }}
                  onMouseEnter={() => setHover(a.id)}
                  onMouseLeave={() => setHover((h) => (h === a.id ? null : h))}
                  onClick={() => setHover((h) => (h === a.id ? null : a.id))}
                />
              );
            })}
            <g className="sg-borders" aria-hidden="true">
              {areas.map((a) => (
                <path key={a.id} d={a.d} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
            {hovered && <path d={hovered.d} className="sg-hover" vectorEffect="non-scaling-stroke" />}
            {top && <path d={top.d} className="sg-pulse" />}
            {areas
              .filter((a) => labelled.has(a.id) && a.id !== hovered?.id)
              .map((a) => (
                <g key={a.id} className="sg-label" transform={`translate(${a.cx},${a.cy})`}>
                  <text className="sg-label-name" y="-44">{a.name}</text>
                  <text className="sg-label-p" y="-18">
                    {pct(shaded!.probabilities[a.id])}
                  </text>
                </g>
              ))}
            {hovered && (
              <g className="sg-hover-label" transform={`translate(${hovered.cx},${hovered.cy})`} aria-hidden="true">
                <rect x={-hoverLabelWidth / 2} y="-44" width={hoverLabelWidth} height="36" rx="6" />
                <text y="-20">{hoverLabel}</text>
              </g>
            )}
          </svg>
          <figcaption className="sg-caption">
            <div className="sg-legend" data-active={!!shaded}>
              <span className="nb-mono sg-legend-title">How likely each area is the answer</span>
              <span className="sg-ramp" style={{ background: `linear-gradient(90deg, ${RAMP.join(", ")})` }} />
              <span className="nb-mono sg-ticks">
                <span>0%</span>
                <span>{shaded ? pct(maxP / 4) : ""}</span>
                <span>{shaded ? pct(maxP) : "more likely"}</span>
              </span>
            </div>
            <p className="nb-mono sg-hovered">
              {hovered
                ? `${hovered.name}${shaded ? `: ${pct(shaded.probabilities[hovered.id] ?? 0)}` : ""}`
                : "Tap or hover over an area to see its name."}
            </p>
          </figcaption>
        </figure>

        <div className="sg-side">
          {status === "idle" && (
            <p className="sg-hint">
              Ask something above and your best match, plus the next five, will show up here.
            </p>
          )}
          {status === "thinking" && (
            <p className="nb-mono sg-status">
              weighing every part of the island<span className="nb-caret" />
            </p>
          )}
          {status === "error" && <p className="nb-error nb-mono">{error}</p>}
          {result && !shaded && (
            <p className="sg-hint">That's not really a "where" question. Try a food, a vibe or a mood.</p>
          )}
          {shaded && top && (
            <>
              <p className="nb-label">"{asked}"</p>
              <p className="sg-answer">{top.name}</p>
              <p className="nb-mono nb-conf">Jev is {pct(shaded.probabilities[top.id] ?? 0)} sure</p>
              <p className="nb-label sg-rank-title">Top picks</p>
              <table className="nb-dist sg-rank">
                <tbody>
                  {ranked.map((r, i) => (
                    <tr key={r.id} data-top={r.id === top.id} style={{ "--i": i } as React.CSSProperties}>
                      <th scope="row">{r.name}</th>
                      <td className="nb-bar-cell">
                        <span className="nb-bar" style={{ "--w": r.p, background: rampColor(0.25 + 0.75 * Math.sqrt(r.p / maxP)) } as React.CSSProperties} />
                      </td>
                      <td className="nb-mono nb-num">{pct(r.p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="nb-mono nb-foot">Out of 55 areas. {shaded.model}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
