import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO || "price_pro_placeholder",
  business: process.env.STRIPE_PRICE_BUSINESS || "price_business_placeholder",
};

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from JWT
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tier } = await req.json();
    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "subscription",
        "customer_email": user.email || "",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "success_url": `${req.headers.get("origin") || "https://funnelforge.co.il"}/?checkout=success`,
        "cancel_url": `${req.headers.get("origin") || "https://funnelforge.co.il"}/?checkout=cancel`,
        "metadata[user_id]": user.id,
        "metadata[tier]": tier,
      }),
    });

    const session = await response.json();

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
