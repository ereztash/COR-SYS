// ═══════════════════════════════════════════════
// Embed Content — API Route for generating embeddings
// Takes content text, generates embedding via API,
// stores in pgvector for semantic search.
// ═══════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const { items, userId, planId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Generate embeddings in batch (max 2048 items per API call)
    const texts = items.map((item: any) => item.text as string);
    const embeddings = await generateEmbeddings(texts, OPENAI_API_KEY);

    if (embeddings.length !== items.length) {
      return NextResponse.json(
        { error: "Embedding count mismatch" },
        { status: 500 }
      );
    }

    // Store in database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete existing embeddings for this plan (if re-embedding)
    if (planId) {
      await supabase
        .from("content_embeddings")
        .delete()
        .eq("plan_id", planId)
        .eq("user_id", userId);
    }

    // Insert new embeddings
    const rows = items.map((item: any, i: number) => ({
      plan_id: planId || null,
      user_id: userId,
      content_type: item.contentType || "unknown",
      content_text: item.text,
      metadata: item.metadata || {},
      embedding: embeddings[i],
    }));

    const { error: insertError } = await supabase
      .from("content_embeddings")
      .insert(rows);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      embedded: items.length,
      planId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

async function generateEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
      dimensions: 1536,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Embedding API error: ${response.status}`);
  }

  return data.data
    .sort((a: any, b: any) => a.index - b.index)
    .map((item: any) => item.embedding);
}
