export const PAPER = {
  surface: "#f8fafc",
  ink: "#172033",
  graphite: "#475569",
  muted: "#7b8798",
  hairline: "#dbe2ea",
  axis: "#9aa7b7",
  sheet: "#dbeafe",
  sheetEdge: "#2563eb",
  highlighter: "#bfdbfe",
  worse: "#e2e8f0",
};

export const FEATURED_INKS: Record<string, { label: string; color: string }> = {
  anthropic: { label: "Anthropic", color: "#e0533d" },
  google: { label: "Google", color: "#2a6fd6" },
  openai: { label: "OpenAI", color: "#b0409a" },
};

export const OTHER_INK = { label: "Other providers", color: "#64748b" };

export const inkFor = (creatorSlug: string) => FEATURED_INKS[creatorSlug]?.color ?? OTHER_INK.color;

export const FONTS = {
  serif: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
};
