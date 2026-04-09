// ===============================================
// Research Agent — API Route for deep research queries
// Uses Claude Opus for high-quality strategic analysis.
// Called by the research orchestrator for complex queries.
// ===============================================

import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { question, domain, context, model } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(domain, context);
    const userPrompt = buildUserPrompt(question, domain, context);

    // Use Opus for deep research, Sonnet for standard
    const selectedModel = model || "claude-opus-4-6";
    const maxTokens = 4096;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: maxTokens,
        temperature: 0.1,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error?.message || `API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const text = data.content?.[0]?.text || "";
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;

    return NextResponse.json({
      text,
      tokensUsed: inputTokens + outputTokens,
      inputTokens,
      outputTokens,
      model: selectedModel,
      domain,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(domain?: string, context?: Record<string, string>): string {
  const base = "You are a senior strategic research analyst specializing in the Israeli market. Provide thorough, evidence-based analysis. Always respond in valid JSON.";

  const domainContext: Record<string, string> = {
    regulatory: "Focus on Israeli advertising law (\u05d7\u05d5\u05e7 \u05d4\u05d2\u05e0\u05ea \u05d4\u05e6\u05e8\u05db\u05df), privacy regulations, and industry compliance requirements.",
    market: "Focus on Israeli market dynamics, competitor landscape, pricing benchmarks, and consumer behavior trends.",
    marketing: "Focus on digital marketing channels effective in Israel, Hebrew content strategies, and emerging technologies (RCS, WhatsApp Business, GenAI).",
  };

  const parts = [base];
  if (domain && domainContext[domain]) {
    parts.push(domainContext[domain]);
  }
  if (context?.industry) {
    parts.push(`Industry context: ${context.industry}`);
  }

  return parts.join("\n");
}

function buildUserPrompt(question: string, domain?: string, context?: Record<string, string>): string {
  return `Research question: ${question}
${domain ? `Domain: ${domain}` : ""}
${context?.industry ? `Industry: ${context.industry}` : ""}
${context?.audienceType ? `Audience: ${context.audienceType}` : ""}
${context?.mainGoal ? `Business goal: ${context.mainGoal}` : ""}
Country: Israel

Provide your analysis as a JSON object:
{
  "findings": [
    {
      "insight_he": "\u05ea\u05d5\u05d1\u05e0\u05d4 \u05d1\u05e2\u05d1\u05e8\u05d9\u05ea",
      "insight_en": "insight in English",
      "evidence": "supporting evidence",
      "confidence": 0.0-1.0,
      "actionable": true/false,
      "recommendation_he": "\u05d4\u05de\u05dc\u05e6\u05d4 \u05d1\u05e2\u05d1\u05e8\u05d9\u05ea",
      "recommendation_en": "recommendation in English"
    }
  ],
  "summary_he": "\u05e1\u05d9\u05db\u05d5\u05dd \u05d1\u05e2\u05d1\u05e8\u05d9\u05ea",
  "summary_en": "summary in English"
}`;
}
