// Refreshes the multi-modality Pareto explorer from public Artificial Analysis pages.
// The pages are Next.js apps that stream their data through self.__next_f.push(...),
// so the refresh does not need a browser or private API key.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCES = {
  language: "https://artificialanalysis.ai/models/",
  languageLeaderboard: "https://artificialanalysis.ai/leaderboards/models",
  image: "https://artificialanalysis.ai/image/leaderboard/text-to-image",
  voice: "https://artificialanalysis.ai/speech-to-speech",
  video: "https://artificialanalysis.ai/video/leaderboard/text-to-video",
};
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/data/llm-leaderboard.json");
const MIN_DEFAULT_PLOTTABLE = { language: 60, image: 20, voice: 5, video: 10 };
const DEFAULT_AXES = {
  language: ["costTask", "intelligence", "speed"],
  image: ["price", "quality", "uncertainty"],
  voice: ["inputCost", "quality", "latency"],
  video: ["price", "quality", "uncertainty"],
};

const staleArg = process.argv.find((arg) => arg.startsWith("--if-stale-hours="));
const staleHours = staleArg ? Number(staleArg.split("=")[1]) : null;

async function readPrevious() {
  try {
    return JSON.parse(await fs.readFile(OUT, "utf8"));
  } catch {
    return null;
  }
}

async function fetchHtml(source) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
    try {
      const response = await fetch(source, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; junwei.ng benchmark refresh; +https://junwei.ng/benchmarks)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(45_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Could not fetch ${source}: ${lastError?.message}`);
}

function collectObjects(html) {
  const chunkRe = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let flight = "";
  for (const match of html.matchAll(chunkRe)) flight += JSON.parse(match[1]);

  const objects = [];
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== "object") return;
    objects.push(value);
    Object.values(value).forEach(walk);
  };
  for (const line of flight.split("\n")) {
    const body = line.slice(line.indexOf(":") + 1);
    if (body[0] !== "[" && body[0] !== "{") continue;
    try {
      walk(JSON.parse(body));
    } catch {
      // React Flight also contains module references and text rows.
    }
  }
  return objects;
}

const finite = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const positive = (value) => {
  const number = finite(value);
  return number != null && number > 0 ? number : null;
};
const round = (value, digits = 6) => (value == null ? null : Number(value.toPrecision(digits)));
const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const creator = (name, slug) => ({ slug: slug || slugify(name || "Unknown"), name: name || "Unknown" });

function unique(objects, predicate, keyOf) {
  const found = new Map();
  for (const object of objects) {
    if (!predicate(object)) continue;
    const key = keyOf(object);
    const current = found.get(key);
    const score = (value) => Object.values(value).filter((item) => item != null && typeof item !== "string").length;
    if (!current || score(object) > score(current)) found.set(key, object);
  }
  return [...found.values()];
}

function normalizeLanguage(modelObjects, leaderboardObjects) {
  const rich = unique(
    modelObjects,
    (value) =>
      typeof value.id === "string" &&
      typeof value.slug === "string" &&
      typeof value.intelligenceIndex === "number" &&
      value.creator && typeof value.creator === "object" &&
      value.timescaleData && typeof value.timescaleData === "object",
    (value) => value.id,
  );

  const richBySlug = new Map(rich.map((value) => [value.slug, value]));
  const richByName = new Map();
  for (const value of rich) {
    for (const name of [value.name, value.shortName]) {
      if (name) richByName.set(name.trim().toLowerCase(), value);
    }
  }
  const raw = unique(
    leaderboardObjects,
    (value) =>
      typeof value.slug === "string" &&
      typeof value.intelligenceIndex === "number" &&
      typeof value.medianOutputTokensPerSecond === "number" &&
      typeof value.modelCreatorName === "string",
    (value) => value.slug,
  );

  return raw
    .filter((value) => !value.deprecated)
    .map((value) => {
      const detail = richBySlug.get(value.slug) ?? richByName.get((value.shortName || value.name).trim().toLowerCase());
      const inputPrice = positive(detail?.price1mInputTokens ?? value.price1mInputTokens);
      const outputPrice = positive(detail?.price1mOutputTokens ?? value.price1mOutputTokens);
      const values = {
        intelligence: round(positive(value.intelligenceIndex)),
        costTask: round(positive(detail?.intelligenceIndexCostPerTask?.cost?.total ?? value.intelligenceIndexCostPerTask)),
        tokensTask: round(positive(detail?.intelligenceIndexOutputTokensPerTask?.output)),
        tokenPrice: round(inputPrice && outputPrice ? (3 * inputPrice + outputPrice) / 4 : null),
        inputPrice: round(inputPrice),
        outputPrice: round(outputPrice),
        speed: round(positive(detail?.timescaleData?.medianOutputSpeed ?? value.medianOutputTokensPerSecond)),
        latency: round(positive(detail?.timeToFirstAnswerToken?.total ?? value.medianTimeToFirstAnswerTokenSeconds ?? value.medianTimeToFirstTokenSeconds)),
        totalTime: round(positive(detail?.endToEndResponseTime?.total ?? value.medianEndToEndResponseTimeSeconds)),
        context: round(positive(detail?.contextWindowTokens ?? value.contextWindowTokens)),
      };
      return {
        id: value.slug,
        name: value.shortName || detail?.shortName || value.name,
        fullName: value.name || detail?.name,
        creator: creator(value.modelCreatorName, detail?.creator?.slug),
        openWeights: Boolean(value.isOpenWeights ?? detail?.isOpenWeights),
        reasoning: Boolean(value.isReasoning ?? detail?.isReasoning),
        estimated: Boolean(value.intelligenceIndexIsEstimated ?? detail?.intelligenceIndexIsEstimated),
        sizeValue: values.context,
        values,
      };
    })
    .filter((model) => model.values.intelligence != null && Object.values(model.values).filter((value) => value != null).length >= 4);
}

function normalizeArena(objects, kind) {
  const raw = unique(
    objects,
    (value) =>
      typeof value.id === "string" &&
      typeof value.name === "string" &&
      typeof value.elo === "number" &&
      value.creator && typeof value.creator === "object" &&
      "appearances" in value,
    (value) => value.id,
  );
  return raw
    .filter((value) => value.isCurrent !== false)
    .map((value) => {
      const price = kind === "image" ? positive(value.pricePer1kImages) : positive(value.pricePerMinute);
      const values = {
        quality: round(positive(value.elo)),
        price: round(price),
        appearances: round(positive(value.appearances)),
        uncertainty: round(positive(value.ciDelta)),
      };
      return {
        id: value.id,
        name: value.name,
        fullName: value.name,
        creator: creator(value.creator.name),
        openWeights: Boolean(value.openWeightsUrl),
        sizeValue: values.appearances,
        values,
      };
    })
    .filter((model) => model.values.quality != null && Object.values(model.values).filter((value) => value != null).length >= 3);
}

function normalizeVoice(objects) {
  const raw = unique(
    objects,
    (value) =>
      typeof value.id === "string" &&
      typeof value.slug === "string" &&
      typeof value.stsQualityIndex === "number" &&
      value.host && typeof value.host === "object" &&
      value.model && typeof value.model === "object",
    (value) => value.id,
  );

  return raw
    .map((value) => {
      const values = {
        quality: round(positive(value.stsQualityIndex)),
        latency: round(positive(value.timeToFirstAudioSeconds)),
        inputCost: round(positive(value.costPerHourOfInputAudio)),
        inputPrice: round(positive(value.pricePerHourInput)),
        outputPrice: round(positive(value.pricePerHourOutput)),
        taskCost: round(positive(value.averageCostPerTask)),
        speechReasoning: round(positive(value.bbaScore)),
        agentSuccess: round(positive(value.tauVoiceAggScore ?? value.tauVoiceAverage ?? value.tauVoicePassAt1)),
      };
      return {
        id: value.id,
        name: value.shortName || value.model.shortName || value.model.name,
        fullName: value.name,
        creator: creator(value.host.name, value.host.slug),
        openWeights: Boolean(value.model.openSource),
        sizeValue: positive(value.tauTrialCount) ?? 1,
        values,
      };
    })
    .filter((model) => model.values.quality != null && Object.values(model.values).filter((value) => value != null).length >= 3);
}

function validateDataset(dataset) {
  const axes = DEFAULT_AXES[dataset.id];
  const plottable = dataset.models.filter((model) => axes.every((key) => model.values[key] != null)).length;
  const required = MIN_DEFAULT_PLOTTABLE[dataset.id];
  if (plottable < required) throw new Error(`${dataset.id}: only ${plottable} default-plottable models (need ${required})`);
  for (const model of dataset.models) {
    if (!model.id || !model.name || !model.creator.name) throw new Error(`${dataset.id}: model is missing identity fields`);
  }
}

async function main() {
  const previous = await readPrevious();
  if (staleHours != null && previous?.generatedAt) {
    const ageHours = (Date.now() - Date.parse(previous.generatedAt)) / 3_600_000;
    if (Number.isFinite(ageHours) && ageHours < staleHours) {
      console.log(`Leaderboard data is ${ageHours.toFixed(1)} hours old; next refresh starts at ${staleHours} hours.`);
      return;
    }
  }

  const entries = await Promise.all(
    Object.entries(SOURCES).map(async ([id, source]) => [id, collectObjects(await fetchHtml(source))]),
  );
  const objects = Object.fromEntries(entries);
  const datasets = [
    {
      id: "language",
      label: "Language models",
      description: "Language-model benchmarks, token use, pricing, and inference performance.",
      source: SOURCES.language,
      models: normalizeLanguage(objects.language, objects.languageLeaderboard),
    },
    {
      id: "image",
      label: "Text-to-image",
      description: "Text-to-image Arena quality, pricing, and rating evidence.",
      source: SOURCES.image,
      models: normalizeArena(objects.image, "image"),
    },
    {
      id: "voice",
      label: "Speech-to-speech",
      description: "Native voice-agent quality, latency, and audio pricing.",
      source: SOURCES.voice,
      models: normalizeVoice(objects.voice),
    },
    {
      id: "video",
      label: "Text-to-video",
      description: "Text-to-video Arena quality, pricing, and rating evidence.",
      source: SOURCES.video,
      models: normalizeArena(objects.video, "video"),
    },
  ].map((dataset) => ({
    ...dataset,
    modelCount: dataset.models.length,
    models: dataset.models.sort((left, right) => left.id.localeCompare(right.id)),
  }));

  datasets.forEach(validateDataset);
  const out = { generatedAt: new Date().toISOString(), datasets };
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`Wrote ${datasets.map((dataset) => `${dataset.modelCount} ${dataset.id}`).join(", ")} records to ${path.relative(process.cwd(), OUT)}.`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
