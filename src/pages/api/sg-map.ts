import type { APIRoute } from "astro";
import { AREA_NOTES } from "../../data/fun/sg-area-notes";
import { askJev, json, rateLimited } from "../../lib/fun/jev";

// Jev picks one of the 55 planning areas. Its probability for every area becomes the shading.
export const prerender = false;

const QUESTIONS = {
  area: {
    type: "choice",
    instructions: "Which area of Singapore best answers this request",
    criteria: AREA_NOTES,
  },
  in_scope: {
    type: "noul",
    instructions: "The request could be answered by suggesting somewhere to go, eat, do something or live. Moods and vibes count.",
  },
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let query = "";
  try {
    query = String((await request.json()).query ?? "").trim();
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  if (query.length < 3) return json({ error: "Ask something a little longer." }, 400);
  if (query.length > 200) return json({ error: "Keep it under 200 characters." }, 400);

  if (rateLimited(request, clientAddress, "map", 30)) return json({ error: "Jev needs a breather. Try again in a few minutes." }, 429);

  const jev = await askJev({ request: query }, QUESTIONS);
  if (!jev.ok) return jev.response;

  const { area, in_scope } = jev.data.answers;
  if (!area || !(area.choice in AREA_NOTES) || !area.probabilities || typeof in_scope?.noul !== "number") {
    return json({ error: "Jev returned an unexpected response." }, 502);
  }
  return json({
    choice: area.choice,
    confidence: area.confidence,
    probabilities: area.probabilities,
    inScope: in_scope.noul,
    model: jev.data.model,
  });
};
