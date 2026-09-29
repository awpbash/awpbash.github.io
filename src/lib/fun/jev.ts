// Server-only helpers shared by the Fun Stuff API routes.

const JEV_URL = "https://api.typesafe.ai/v1/systemone";
const WINDOW_MS = 10 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 8_000;
const calls = new Map<string, number[]>();

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

// Per-instance fallback. A Vercel WAF rule provides the durable limit across instances.
export function rateLimited(request: Request, clientAddress: string | undefined, bucket: string, max: number) {
  const ip = clientAddress || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (calls.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) return true;
  recent.push(now);
  calls.set(key, recent);
  if (calls.size > 5000) calls.clear();
  return false;
}

export type JevOutcome = { ok: true; data: any } | { ok: false; response: Response };

export async function askJev(state: unknown, questions: Record<string, unknown>): Promise<JevOutcome> {
  const key = process.env.TYPESAFE_API_KEY ?? (import.meta.env.DEV ? import.meta.env.TYPESAFE_API_KEY : undefined);
  if (!key) return { ok: false, response: json({ error: "Jev is not configured on this deployment." }, 503) };

  const upstream = await fetch(JEV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ state, model: "jev-latest", questions }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    const busy = upstream?.status === 429 || upstream?.status === 529;
    return { ok: false, response: json({ error: busy ? "Jev is busy right now. Try again shortly." : "Jev could not be reached." }, 502) };
  }
  const data = await upstream.json().catch(() => null);
  if (!data || typeof data !== "object" || !("answers" in data)) {
    return { ok: false, response: json({ error: "Jev returned an unexpected response." }, 502) };
  }
  return { ok: true, data };
}
