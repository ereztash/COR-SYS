// ═══════════════════════════════════════════════
// Agent Executor — Generic API Route for LLM agents
// Receives system prompt + user prompt + model config,
// calls Claude API, returns structured output.
// Used by createLLMAgent() in the blackboard pipeline.
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { systemPrompt, prompt, model, maxTokens, temperature } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const selectedModel = model || "claude-haiku-4-5-20251001";
    const selectedMaxTokens = Math.min(maxTokens || 2048, 8192);
    const selectedTemperature = typeof temperature === "number" ? temperature : 0;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: selectedMaxTokens,
        temperature: selectedTemperature,
        system: systemPrompt || "You are a helpful assistant. Respond in JSON when asked.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error?.message || `API error: ${response.status}`,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const text = data.content?.[0]?.text || "";
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    const tokensUsed = inputTokens + outputTokens;

    return NextResponse.json({
      text,
      tokensUsed,
      inputTokens,
      outputTokens,
      model: selectedModel,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
