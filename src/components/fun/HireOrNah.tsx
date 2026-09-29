import { useEffect, useRef, useState } from "react";
import type { SampleJob } from "../../data/fun/jobs";
import { LIMITS, VERDICTS, type HireResult } from "../../lib/fun/hire";

type Mode = "recruiter" | "candidate";
type Status = "idle" | "thinking" | "done" | "error";
const CUSTOM_JOB_ID = "custom";

const THINKING_LINES = [
  "reading the job description",
  "reading the resume",
  "checking the stated minimums",
  "comparing skills and shipped work",
  "making the call",
];
const MAX_PDF_BYTES = 8 * 1024 * 1024;

const pct = (n: number) => `${Math.round(n * 100)}%`;

async function readPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n").replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
}

export default function HireOrNah({ jobs }: { jobs: SampleJob[] }) {
  const [mode, setMode] = useState<Mode>("recruiter");
  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  const [jobId, setJobId] = useState(jobs[0].id);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<HireResult | null>(null);
  const [tick, setTick] = useState(0);
  const [pdfNote, setPdfNote] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const tooShort =
    mode === "recruiter"
      ? job.trim().length < LIMITS.min
      : resume.trim().length < LIMITS.min || (jobId === CUSTOM_JOB_ID && job.trim().length < LIMITS.min);

  useEffect(() => {
    if (status !== "thinking") return;
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 380);
    return () => clearInterval(id);
  }, [status]);

  async function judge() {
    setStatus("thinking");
    setError("");
    setResult(null);
    const started = Date.now();
    try {
      const res = await fetch("/api/hire-or-nah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "recruiter"
            ? { mode, job }
            : jobId === CUSTOM_JOB_ID
              ? { mode: "custom", job, resume }
              : { mode, jobId, resume },
        ),
      });
      const data = await res.json();
      // Let the deliberation read as a beat, not a flicker.
      await new Promise((r) => setTimeout(r, Math.max(0, 1900 - (Date.now() - started))));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data);
      setStatus("done");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  async function onPdf(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_PDF_BYTES) {
      setPdfNote("that PDF is over 8 MB. Paste the text instead.");
      return;
    }
    setPdfNote("reading pdf in your browser");
    try {
      const text = await readPdf(file);
      setResume(text.slice(0, LIMITS.max));
      setPdfNote(`read ${file.name}, ${text.length.toLocaleString()} characters. It stays in your browser until you ask Jev.`);
    } catch {
      setPdfNote("could not read that pdf. Paste the text instead.");
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next);
    setResult(null);
    setStatus("idle");
    setError("");
  };

  const selectedJob = jobs.find((j) => j.id === jobId);
  const usingCustomJob = jobId === CUSTOM_JOB_ID;
  const tracks = [...new Set(jobs.map((j) => j.track))];

  return (
    <div className="nb-hire">
      <div className="nb-tabs" role="group" aria-label="Choose how to use the demo">
        <button type="button" aria-pressed={mode === "recruiter"} onClick={() => switchMode("recruiter")}>
          <span className="nb-mono">A.</span> Judge my resume
        </button>
        <button type="button" aria-pressed={mode === "candidate"} onClick={() => switchMode("candidate")}>
          <span className="nb-mono">B.</span> Judge your resume
        </button>
      </div>

      {mode === "recruiter" ? (
        <section className="nb-entry">
          <label className="nb-label" htmlFor="job-description">Input 1 of 1 · job description</label>
          <p className="nb-note">
            Paste any role. Jev compares it with <a href="/cv">my resume</a> and gives you its honest call, even when the answer is no.
          </p>
          <textarea
            id="job-description"
            className="nb-textarea"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Paste the job description here"
            rows={10}
            maxLength={LIMITS.max}
          />
          <p className="nb-count nb-mono">
            {job.length.toLocaleString()} / {LIMITS.max.toLocaleString()} characters
          </p>
        </section>
      ) : (
        <>
          <section className="nb-entry">
            <p className="nb-label">Input 1 of 2 · pick or paste a posting</p>
            <div className="nb-jobs">
              {tracks.map((track) => (
                <div key={track} className="nb-job-group">
                  <p className="nb-mono nb-job-track">{track}</p>
                  {jobs
                    .filter((j) => j.track === track)
                    .map((j) => (
                      <label key={j.id} className="nb-job" data-active={j.id === jobId}>
                        <input type="radio" name="job" value={j.id} checked={j.id === jobId} onChange={() => setJobId(j.id)} />
                        <span className="nb-job-co">{j.company}</span>
                        <span className="nb-job-role">{j.role}</span>
                      </label>
                    ))}
                </div>
              ))}
              <div className="nb-job-group">
                <p className="nb-mono nb-job-track">Your own</p>
                <label className="nb-job" data-active={usingCustomJob}>
                  <input
                    type="radio"
                    name="job"
                    value={CUSTOM_JOB_ID}
                    checked={usingCustomJob}
                    onChange={() => setJobId(CUSTOM_JOB_ID)}
                  />
                  <span className="nb-job-co">Bring your own</span>
                  <span className="nb-job-role">Paste any job description</span>
                </label>
              </div>
            </div>
            {usingCustomJob ? (
              <div className="nb-own-job">
                <label className="nb-label" htmlFor="custom-job">Your job description</label>
                <textarea
                  id="custom-job"
                  className="nb-textarea"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="Paste the job description here"
                  rows={10}
                  maxLength={LIMITS.max}
                />
                <p className="nb-count nb-mono">
                  {job.length.toLocaleString()} / {LIMITS.max.toLocaleString()} characters
                </p>
              </div>
            ) : selectedJob ? (
              <details className="nb-jd">
                <summary className="nb-mono">read the {selectedJob.company} posting</summary>
                <p>{selectedJob.text}</p>
                <p className="nb-mono nb-source">
                  Condensed from a public posting, Sep 2026. <a href={selectedJob.source} target="_blank" rel="noopener">source</a>
                </p>
              </details>
            ) : null}
          </section>
          <section className="nb-entry">
            <label className="nb-label" htmlFor="resume-text">Input 2 of 2 · your resume</label>
            <textarea
              id="resume-text"
              className="nb-textarea"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume as text, or load a PDF below"
              rows={10}
              maxLength={LIMITS.max}
            />
            <div className="nb-pdf">
              <label className="nb-btn nb-btn-quiet">
                Load a PDF
                <input type="file" accept="application/pdf" onChange={(e) => onPdf(e.target.files?.[0])} hidden />
              </label>
              <span className="nb-mono nb-count">{pdfNote || `${resume.length.toLocaleString()} / ${LIMITS.max.toLocaleString()} characters`}</span>
            </div>
          </section>
        </>
      )}

      <div className="nb-run">
        <button className="nb-btn" onClick={judge} disabled={tooShort || status === "thinking"}>
          {status === "thinking" ? "Jev is deliberating" : "Ask Jev"}
        </button>
        <p className="nb-mono nb-privacy">
          I do not save your text. It goes to TypeSafe's Jev API, so please do not paste anything sensitive.
        </p>
      </div>

      {status === "thinking" && (
        <ol className="nb-log nb-mono" aria-live="polite">
          {THINKING_LINES.slice(0, Math.min(THINKING_LINES.length, 1 + Math.floor(tick / 1))).map((line, i, shown) => (
            <li key={line} data-live={i === shown.length - 1}>
              {line}
              {i === shown.length - 1 ? <span className="nb-caret" /> : " ... ok"}
            </li>
          ))}
        </ol>
      )}

      {status === "error" && <p className="nb-error nb-mono">{error}</p>}

      {status === "done" && result && (
        <div ref={resultRef}>{result.rejected ? <Rejected which={result.rejected} /> : <Verdict result={result} />}</div>
      )}
    </div>
  );
}

function Rejected({ which }: { which: "job" | "resume" }) {
  return (
    <section className="nb-result">
      <p className="nb-label">Result</p>
      <p className="nb-rejected">
        Jev doesn't think that's a real {which === "job" ? "job description" : "resume"}. It declined to judge.
      </p>
    </section>
  );
}

function Verdict({ result }: { result: HireResult }) {
  const top = VERDICTS.find((v) => v.id === result.verdict.choice)!;
  const positive = ["strong_hire", "hire", "lean_hire"].includes(top.id);
  return (
    <section className="nb-result">
      <div className="nb-result-head">
        <p className="nb-label">Result · {result.model}</p>
        <div className="nb-stamp" data-tone={positive ? "yes" : "no"}>
          {top.label}
        </div>
        <p className="nb-mono nb-conf">confidence {result.verdict.confidence.toFixed(2)}</p>
      </div>

      <div className="nb-grid">
        <div>
          <p className="nb-label">How the verdict split</p>
          <table className="nb-dist">
            <tbody>
              {VERDICTS.map((v, i) => {
                const p = result.verdict.probabilities[v.id] ?? 0;
                return (
                  <tr key={v.id} data-top={v.id === top.id} style={{ "--i": i } as React.CSSProperties}>
                    <th scope="row">{v.label}</th>
                    <td className="nb-bar-cell">
                      <span className="nb-bar" style={{ "--w": p } as React.CSSProperties} />
                    </td>
                    <td className="nb-mono nb-num">{pct(p)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <p className="nb-label">Observations</p>
          <ol className="nb-checks">
            {result.checks.map((c, i) => (
              <li key={c.id} style={{ "--i": i + 5 } as React.CSSProperties}>
                <span className="nb-mono nb-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className="nb-check-label">{c.label}</span>
                <span className="nb-scale" aria-label={`${c.score.toFixed(1)} of ${c.max}`}>
                  {Array.from({ length: c.max + 1 }, (_, k) => (
                    <span key={k} data-on={k <= Math.round(c.score)} />
                  ))}
                </span>
                <span className="nb-check-level">{c.level}</span>
                <span className="nb-mono nb-num">{c.confidence.toFixed(2)}</span>
              </li>
            ))}
            {result.flags.map((f, i) => (
              <li key={f.id} style={{ "--i": i + 9 } as React.CSSProperties}>
                <span className="nb-mono nb-idx">{String(result.checks.length + i + 1).padStart(2, "0")}</span>
                <span className="nb-check-label">{f.label}</span>
                <span className="nb-mono nb-yn" data-yes={f.value >= 0.5}>
                  {f.value >= 0.5 ? "yes" : "no"}
                </span>
                <span />
                <span className="nb-mono nb-num">{f.value.toFixed(2)}</span>
              </li>
            ))}
          </ol>
          <p className="nb-mono nb-foot">
            The right column is confidence for scored checks. For yes/no checks, it is the probability of yes. Both run from 0 to 1.
          </p>
        </div>
      </div>
    </section>
  );
}
