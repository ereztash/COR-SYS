// ===============================================
// Queue Processor — API Route for processing event queue
// Triggered by cron or manual invocation.
// Claims pending events, dispatches to handlers, marks complete/failed.
// ===============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Event handler registry
type EventHandler = (payload: Record<string, unknown>, supabase: any) => Promise<Record<string, unknown> | void>;

const EVENT_HANDLERS: Record<string, EventHandler> = {
  "plan.generated": handlePlanGenerated,
  "plan.qa_requested": handleQARequested,
  "research.requested": handleResearchRequested,
  "embedding.requested": handleEmbeddingRequested,
  "benchmark.update": handleBenchmarkUpdate,
  "notification.send": handleNotificationSend,
};

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 5;
    const eventTypes = body.eventTypes || null;

    // Claim pending events
    const { data: events, error: claimError } = await supabase.rpc("claim_events", {
      batch_size: batchSize,
      event_types: eventTypes,
    });

    if (claimError) {
      return NextResponse.json(
        { error: claimError.message },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ processed: 0, message: "No pending events" });
    }

    // Process each event
    const results = [];
    for (const event of events) {
      try {
        const handler = EVENT_HANDLERS[event.event_type];

        if (!handler) {
          // Unknown event type — mark as failed
          await supabase.rpc("fail_event", {
            event_id: event.id,
            error_message: `Unknown event type: ${event.event_type}`,
            retry_delay_seconds: 0,
          });
          results.push({ id: event.id, status: "unknown_type" });
          continue;
        }

        const result = await handler(event.payload, supabase);

        await supabase.rpc("complete_event", {
          event_id: event.id,
          event_result: result || {},
        });

        results.push({ id: event.id, status: "completed" });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        await supabase.rpc("fail_event", {
          event_id: event.id,
          error_message: errorMessage,
          retry_delay_seconds: 30 * event.attempts, // exponential-ish backoff
        });

        results.push({ id: event.id, status: "failed", error: errorMessage });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

// ===============================================
// EVENT HANDLERS
// ===============================================

async function handlePlanGenerated(
  payload: Record<string, unknown>,
  _supabase: any
): Promise<Record<string, unknown>> {
  // Trigger embedding + benchmark update for the new plan
  const planId = payload.planId as string;
  const userId = payload.userId as string;

  // Queue embedding and benchmark sub-events
  if (planId && userId) {
    await _supabase.rpc("publish_event", {
      p_event_type: "embedding.requested",
      p_payload: { planId, userId },
      p_user_id: userId,
      p_priority: 7, // lower priority than QA
    });

    await _supabase.rpc("publish_event", {
      p_event_type: "benchmark.update",
      p_payload: { planId, userId },
      p_user_id: userId,
      p_priority: 8,
    });
  }

  return { triggered: ["embedding", "benchmark"] };
}

async function handleQARequested(
  payload: Record<string, unknown>,
  supabase: any
): Promise<Record<string, unknown>> {
  // Call the agent-executor for QA analysis
  const planId = payload.planId as string;

  // In production, this would invoke the QA pipeline
  // For now, log the request
  return { planId, status: "qa_queued" };
}

async function handleResearchRequested(
  payload: Record<string, unknown>,
  supabase: any
): Promise<Record<string, unknown>> {
  const question = payload.question as string;
  const domain = payload.domain as string;

  // In production, this would call the research-agent API route
  return { question, domain, status: "research_queued" };
}

async function handleEmbeddingRequested(
  payload: Record<string, unknown>,
  supabase: any
): Promise<Record<string, unknown>> {
  const planId = payload.planId as string;
  const userId = payload.userId as string;

  // Fetch plan data
  const { data: plan, error } = await supabase
    .from("saved_plans")
    .select("result")
    .eq("id", planId)
    .single();

  if (error || !plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  // Call embed-content API route
  // In a real deployment, this would be an internal function call
  return { planId, userId, status: "embedding_queued" };
}

async function handleBenchmarkUpdate(
  payload: Record<string, unknown>,
  supabase: any
): Promise<Record<string, unknown>> {
  const planId = payload.planId as string;

  // Fetch plan and update benchmarks
  const { data: plan, error } = await supabase
    .from("saved_plans")
    .select("result")
    .eq("id", planId)
    .single();

  if (error || !plan?.result) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const result = plan.result;
  const industry = result.formData?.businessField || "unknown";
  const audienceType = result.formData?.audienceType || "all";

  // Upsert stage count benchmark
  await supabase
    .from("campaign_benchmarks")
    .upsert(
      {
        industry,
        audience_type: audienceType,
        metric_name: "avg_stage_count",
        metric_value: result.stages?.length || 0,
        sample_size: 1,
        confidence: 0.3,
      },
      { onConflict: "industry,audience_type,metric_name" }
    );

  return { planId, industry, status: "benchmarks_updated" };
}

async function handleNotificationSend(
  payload: Record<string, unknown>,
  supabase: any
): Promise<Record<string, unknown>> {
  const platform = payload.platform as string;
  const message = payload.message as string;
  const userId = payload.userId as string;

  // Check if user has this integration connected
  const { data: integration } = await supabase
    .from("user_integrations")
    .select("status, config")
    .eq("user_id", userId)
    .eq("platform", platform)
    .single();

  if (!integration || integration.status !== "connected") {
    return { status: "skipped", reason: "integration_not_connected" };
  }

  // In production, dispatch to platform-specific handler
  return { platform, status: "notification_sent" };
}
