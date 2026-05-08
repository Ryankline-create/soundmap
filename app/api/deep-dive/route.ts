import { NextResponse } from "next/server";

import { ROUNDS } from "@/lib/rounds";
import { getDeepDiveFallback, type DeepDive } from "@/lib/deep-dive";
import { REGION_BY_ID } from "@/lib/regions";

export const runtime = "edge";

const MODEL = "claude-haiku-4-5-20251001";

const SCHEMA_HINT = `{
  "region_summary": "1-2 sentences placing this music geographically and culturally",
  "cultural_context": "2-3 sentences on the role this music plays in daily life or community",
  "history": "2-3 sentences on origins and how the style evolved",
  "instruments": [{"name": "Instrument name", "role": "1-line description of what it does in the ensemble"}],
  "listen_for": ["3 short, vivid things to listen for next time"],
  "fun_fact": "One non-obvious surprising fact"
}`;

function buildPrompt(roundId: string) {
  const round = ROUNDS.find((r) => r.id === roundId);
  if (!round) return null;
  const region = REGION_BY_ID[round.region];
  return `You are an expert ethnomusicologist. Write a Song Deep Dive for a high-school student in a music-discovery app.

The track:
- Style: ${round.song.style}
- Title: ${round.song.title}
- From: ${round.city}, ${round.country} (${region.label})
- Listener hint they were given: "${round.hint}"

Respond with VALID JSON ONLY (no markdown, no prose before or after) matching exactly this shape:
${SCHEMA_HINT}

Constraints:
- "instruments": exactly 3 to 5 items
- "listen_for": exactly 3 items
- Be specific and concrete. Avoid clichés like "rich tradition" or "vibrant culture".
- Total response under 350 words.`;
}

type AnthropicMessageBlock = { type: string; text?: string };
type AnthropicResponse = { content?: AnthropicMessageBlock[] };

async function callAnthropic(prompt: string): Promise<DeepDive | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as AnthropicResponse;
  const text = data.content?.find((b) => b.type === "text")?.text ?? "";
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as DeepDive;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let roundId: string | null = null;
  try {
    const body = await req.json();
    roundId = typeof body?.roundId === "string" ? body.roundId : null;
  } catch {
    // ignore — fall through to error response
  }
  if (!roundId) {
    return NextResponse.json({ error: "Missing roundId" }, { status: 400 });
  }

  const fallback = getDeepDiveFallback(roundId);
  const prompt = buildPrompt(roundId);

  if (!prompt || !fallback) {
    return NextResponse.json({ error: "Unknown roundId" }, { status: 404 });
  }

  try {
    const fromAi = await callAnthropic(prompt);
    if (fromAi) {
      return NextResponse.json({ source: "ai", data: fromAi });
    }
  } catch {
    // network or parse error — fall through to fallback
  }

  return NextResponse.json({ source: "fallback", data: fallback });
}
