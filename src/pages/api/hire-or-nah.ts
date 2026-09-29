import type { APIRoute } from "astro";
import { SAMPLE_JOBS } from "../../data/fun/jobs";
import { MY_RESUME } from "../../data/fun/resume";
import { CHECKS, FLAGS, LIMITS, VERDICTS, type HireResult, type VerdictId } from "../../lib/fun/hire";
import { askJev, json, rateLimited } from "../../lib/fun/jev";

// Runs on demand so the Jev key never reaches the browser. Nothing is stored.
export const prerender = false;

function buildQuestions(checkJob: boolean, checkResume: boolean) {
  const questions: Record<string, unknown> = {
    verdict: {
      type: "choice",
      instructions: "Hiring recommendation for this candidate's resume against this job description",
      criteria: Object.fromEntries(VERDICTS.map((v) => [v.id, v.criteria])),
    },
  };
  for (const check of CHECKS) {
    questions[check.id] = { type: "score", instructions: check.instructions, criteria: [...check.criteria] };
  }
  for (const flag of FLAGS) {
    questions[flag.id] = { type: "noul", instructions: flag.instructions };
  }
  if (checkJob) questions.job_valid = { type: "noul", instructions: "job_description is a genuine job posting or role description" };
  if (checkResume) questions.resume_valid = { type: "noul", instructions: "resume is a genuine resume or CV describing a person's experience" };
  return questions;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: { mode?: string; job?: string; jobId?: string; resume?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Bad request." }, 400);
  }

  let job: string | undefined;
  let resume: string | undefined;
  if (payload.mode === "recruiter") {
    job = payload.job?.trim();
    resume = MY_RESUME;
  } else if (payload.mode === "candidate") {
    job = SAMPLE_JOBS.find((j) => j.id === payload.jobId)?.text;
    resume = payload.resume?.trim();
  } else if (payload.mode === "custom") {
    job = payload.job?.trim();
    resume = payload.resume?.trim();
  }
  if (!job || !resume) return json({ error: "Missing input." }, 400);
  for (const text of [job, resume]) {
    if (text.length < LIMITS.min) return json({ error: `Paste at least ${LIMITS.min} characters so Jev has something to judge.` }, 400);
    if (text.length > LIMITS.max) return json({ error: `Keep it under ${LIMITS.max.toLocaleString()} characters.` }, 400);
  }

  if (rateLimited(request, clientAddress, "hire", 40)) return json({ error: "You got rate-limited. Stop spamming my API bruh. Try again in 10 minutes." }, 429);

  const jev = await askJev(
    { job_description: job, resume },
    buildQuestions(payload.mode === "recruiter" || payload.mode === "custom", payload.mode === "candidate" || payload.mode === "custom"),
  );
  if (!jev.ok) return jev.response;

  try {
    const a = jev.data.answers;
    if (!VERDICTS.some((verdict) => verdict.id === a.verdict.choice)) throw new Error("Unknown verdict");
    const result: HireResult = {
      verdict: { choice: a.verdict.choice as VerdictId, confidence: a.verdict.confidence, probabilities: a.verdict.probabilities },
      checks: CHECKS.map((check) => {
        const answer = a[check.id];
        const level = Math.max(0, Math.min(check.criteria.length - 1, Math.round(answer.score)));
        return { id: check.id, label: check.label, score: answer.score, max: check.criteria.length - 1, level: check.criteria[level], confidence: answer.confidence };
      }),
      flags: FLAGS.map((flag) => ({ id: flag.id, label: flag.label, value: a[flag.id].noul })),
      model: jev.data.model,
    };
    if (a.job_valid && a.job_valid.noul < 0.5) result.rejected = "job";
    if (a.resume_valid && a.resume_valid.noul < 0.5) result.rejected = "resume";
    return json(result);
  } catch {
    return json({ error: "Jev returned an unexpected response." }, 502);
  }
};
