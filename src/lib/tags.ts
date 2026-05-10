// Canonical tag taxonomy. Two filterable axes only: what you built (stack) and
// why it exists (context). Keep both lists small.

export const STACK_TAGS = [
  "llm",
  "agents",
  "multimodal",
  "vision",
  "rag",
  "rl",
  "fine-tuning",
  "edge",
  "mlops",
  "cloud",
  "data",
] as const;

export const CONTEXT_TAGS = [
  "hackathon",
  "internship",
  "research",
  "experiment",
  "coursework",
] as const;

export const BLOG_KINDS = [
  "hackathon",
  "reflection",
  "experiment",
  "stats",
  "misc",
] as const;

export type StackTag = (typeof STACK_TAGS)[number];
export type ContextTag = (typeof CONTEXT_TAGS)[number];
export type BlogKind = (typeof BLOG_KINDS)[number];

// Pretty-print labels for display (chips, headers).
export const STACK_LABELS: Record<StackTag, string> = {
  llm: "LLM",
  agents: "Agents",
  multimodal: "Multimodal",
  vision: "Vision",
  rag: "RAG",
  rl: "RL",
  "fine-tuning": "Fine-tuning",
  edge: "Edge / On-device",
  mlops: "MLOps",
  cloud: "Cloud",
  data: "Data",
};

export const CONTEXT_LABELS: Record<ContextTag, string> = {
  hackathon: "Hackathon",
  internship: "Internship",
  research: "Research",
  experiment: "Experiment",
  coursework: "Coursework",
};
