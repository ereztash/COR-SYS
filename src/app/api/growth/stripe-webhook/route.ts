import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    // In production: verify Stripe signature with STRIPE_WEBHOOK_SECRET
    // For now, parse the event directly
    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const tier = session.metadata?.tier;

      if (userId && tier) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Update user profile with new tier
        await supabase.from("profiles").update({
          display_name: tier, // Store tier in profile (temporary — should add tier column)
        }).eq("id", userId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        // Downgrade to free
        await supabase.from("profiles").update({
          display_name: "free",
        }).eq("id", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 400 }
    );
  }
}
