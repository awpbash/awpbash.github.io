// Shared between the Hire or Nah API route and the client.
// Jev only classifies, so every line on the result page maps to one question here.

export const VERDICTS = [
  { id: "strong_hire", label: "Strong Hire", criteria: "Clearly exceeds the requirements. An easy yes." },
  { id: "hire", label: "Hire", criteria: "Meets the requirements with no real gaps." },
  { id: "lean_hire", label: "Lean Hire", criteria: "Meets most requirements. Minor gaps that can be learned on the job." },
  { id: "weak", label: "Weak", criteria: "Significant gaps against the core requirements." },
  { id: "no_hire", label: "No Hire", criteria: "Does not fit the role." },
] as const;

export type VerdictId = (typeof VERDICTS)[number]["id"];

export const CHECKS = [
  {
    id: "skills",
    label: "Technical skills",
    instructions: "How many of the skills and tools the job asks for appear in the resume",
    criteria: ["Few of them", "Some of them", "Most of them", "All of them and more"],
  },
  {
    id: "seniority",
    label: "Seniority",
    instructions: "How the candidate's experience level compares to the level the job asks for",
    criteria: ["Far too junior", "Somewhat junior", "Right level", "Above the level"],
  },
  {
    id: "domain",
    label: "Domain fit",
    instructions: "How relevant the candidate's past work domain is to this job's domain",
    criteria: ["Unrelated", "Adjacent", "Relevant", "Directly relevant"],
  },
  {
    id: "impact",
    label: "Shipped work",
    instructions: "How much evidence the resume shows of real work shipped to users or production",
    criteria: ["None", "Coursework only", "Some shipped work", "Strong track record"],
  },
] as const;

export const FLAGS = [
  { id: "education", label: "Meets the education requirement", instructions: "The candidate meets the education requirement stated in the job description, or the job states none" },
  { id: "minimums", label: "Meets every stated minimum", instructions: "The candidate meets every minimum requirement stated in the job description" },
] as const;

export interface HireResult {
  verdict: { choice: VerdictId; confidence: number; probabilities: Record<VerdictId, number> };
  checks: { id: string; label: string; score: number; max: number; level: string; confidence: number }[];
  flags: { id: string; label: string; value: number }[];
  rejected?: "job" | "resume";
  model: string;
}

export const LIMITS = { min: 150, max: 12000 };
