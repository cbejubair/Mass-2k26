import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const session = await requireAuth(["student"]);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("[order] Razorpay env vars not set");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Verify the user actually exists in the DB (guards against stale/cross-env JWTs)
    const { data: dbUser, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", session.userId)
      .single();

    if (userErr || !dbUser) {
      console.error("[order] user not found in DB for userId:", session.userId);
      return NextResponse.json(
        { error: "Session invalid — please log out and log in again" },
        { status: 401 },
      );
    }

    // Check if payment already exists and is not rejected
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, payment_status")
      .eq("user_id", session.userId)
      .single();

    if (existingPayment && existingPayment.payment_status !== "rejected") {
      return NextResponse.json(
        { error: "Payment already submitted" },
        { status: 409 },
      );
    }

    const order = await razorpay.orders.create({
      amount: 70000, // ₹700 in paise
      currency: "INR",
      receipt: `rcpt_${session.userId.slice(0, 8)}_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
