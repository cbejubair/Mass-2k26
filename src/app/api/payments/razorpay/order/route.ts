import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Normalise anything the Razorpay SDK or our own code may throw */
function parseError(err: unknown): { message: string; status: number } {
  // requireAuth throws plain strings "Unauthorized" / "Forbidden"
  if (typeof err === "string") {
    return {
      message: err,
      status: err === "Unauthorized" ? 401 : err === "Forbidden" ? 403 : 500,
    };
  }
  // Standard Error objects
  if (err instanceof Error) {
    const msg = err.message;
    return {
      message: msg,
      status: msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500,
    };
  }
  // Razorpay SDK throws a plain object: { statusCode, error: { description } }
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    const description =
      (e.error as Record<string, unknown>)?.description ??
      e.description ??
      e.message ??
      JSON.stringify(e);
    const httpStatus = typeof e.statusCode === "number" ? e.statusCode : 500;
    return {
      message: String(description),
      status: httpStatus >= 400 && httpStatus < 600 ? httpStatus : 500,
    };
  }
  return { message: "Internal server error", status: 500 };
}

export async function POST() {
  try {
    const session = await requireAuth(["student"]);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error(
        "[order] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set in environment",
      );
      return NextResponse.json(
        { error: "Payment gateway not configured. Contact support." },
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
      console.error(
        "[order] user not found in DB for userId:",
        session.userId,
        userErr,
      );
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

    let order;
    try {
      order = await razorpay.orders.create({
        amount: 50000, // ₹500 in paise
        currency: "INR",
        receipt: `rcpt_${session.userId.slice(0, 8)}_${Date.now()}`,
      });
    } catch (rzpErr) {
      // Razorpay SDK errors are plain objects — log the full payload
      console.error(
        "[order] Razorpay orders.create failed:",
        JSON.stringify(rzpErr),
      );
      const { message, status } = parseError(rzpErr);
      return NextResponse.json(
        { error: `Payment gateway error: ${message}` },
        { status },
      );
    }

    if (!order?.id) {
      console.error(
        "[order] Razorpay returned unexpected response:",
        JSON.stringify(order),
      );
      return NextResponse.json(
        { error: "Payment gateway returned an invalid response. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("[order] unhandled error:", err);
    const { message, status } = parseError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
