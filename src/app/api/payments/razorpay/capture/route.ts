import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["student"]);
    const { orderId, paymentId, signature } = await req.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing orderId, paymentId, or signature" },
        { status: 400 },
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("[capture] RAZORPAY_KEY_SECRET is not set");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 },
      );
    }

    // Verify Razorpay signature
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 },
      );
    }

    // Verify the user actually exists in the DB (guards against stale/cross-env JWTs)
    const { data: dbUser, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", session.userId)
      .single();

    if (userErr || !dbUser) {
      console.error(
        "[capture] user not found in DB for userId:",
        session.userId,
      );
      return NextResponse.json(
        { error: "Session invalid — please log out and log in again" },
        { status: 401 },
      );
    }

    const now = new Date().toISOString();

    // Check existing payment
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

    // Upsert payment as immediately approved (Razorpay already charged)
    if (existingPayment) {
      const { error } = await supabaseAdmin
        .from("payments")
        .update({
          amount: 700,
          payment_status: "approved",
          payment_mode: "razorpay",
          transaction_ref: paymentId,
          screenshot_url: `razorpay:${paymentId}`,
          verified_at: now,
          verified_by: null,
        })
        .eq("id", existingPayment.id);

      if (error) {
        console.error("[capture] payment update error:", error);
        return NextResponse.json(
          { error: `Failed to record payment: ${error.message}` },
          { status: 500 },
        );
      }
    } else {
      const { error } = await supabaseAdmin.from("payments").insert({
        user_id: session.userId,
        amount: 700,
        payment_status: "approved",
        payment_mode: "razorpay",
        transaction_ref: paymentId,
        screenshot_url: `razorpay:${paymentId}`,
        verified_at: now,
        verified_by: null,
      });

      if (error) {
        console.error("[capture] payment insert error:", error);
        return NextResponse.json(
          { error: `Failed to record payment: ${error.message}` },
          { status: 500 },
        );
      }
    }

    // Create or fetch QR token
    const { data: existingQr } = await supabaseAdmin
      .from("entry_qr")
      .select("id, qr_token")
      .eq("user_id", session.userId)
      .single();

    let qrToken = existingQr?.qr_token as string | undefined;

    if (!existingQr) {
      const newToken = uuidv4();
      const { error: qrError } = await supabaseAdmin.from("entry_qr").insert({
        user_id: session.userId,
        qr_token: newToken,
        is_active: true,
        // total_entries has a DEFAULT 0 in the DB — omit to be migration-safe
      });

      if (qrError) {
        console.error("[capture] entry_qr insert error:", qrError);
        return NextResponse.json(
          {
            error: `Payment recorded but failed to generate QR: ${qrError.message}`,
          },
          { status: 500 },
        );
      }

      qrToken = newToken;
    }

    return NextResponse.json({ success: true, qrToken });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
