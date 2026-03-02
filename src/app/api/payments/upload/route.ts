import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["student"]);
    const formData = await req.formData();
    const file = formData.get("screenshot") as File;
    const amount = formData.get("amount") as string;
    const paymentMode = (formData.get("paymentMode") as string) || "upi";
    const transactionRef = (formData.get("transactionRef") as string) || null;

    if (!file || !amount) {
      return NextResponse.json(
        { error: "Screenshot and amount are required" },
        { status: 400 },
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Check if already has a payment
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

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const filePath = `payments/${session.registerNumber}/screenshot.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("mass")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload screenshot" },
        { status: 500 },
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("mass")
      .getPublicUrl(filePath);

    // If previously rejected, update instead of insert
    if (existingPayment) {
      const { error } = await supabaseAdmin
        .from("payments")
        .update({
          amount: parseFloat(amount),
          screenshot_url: urlData.publicUrl,
          payment_status: "pending",
          payment_mode: paymentMode,
          transaction_ref: transactionRef,
          verified_by: null,
          verified_at: null,
        })
        .eq("id", existingPayment.id);

      if (error) {
        return NextResponse.json(
          { error: "Failed to update payment" },
          { status: 500 },
        );
      }
    } else {
      const { error } = await supabaseAdmin.from("payments").insert({
        user_id: session.userId,
        amount: parseFloat(amount),
        screenshot_url: urlData.publicUrl,
        payment_status: "pending",
        payment_mode: paymentMode,
        transaction_ref: transactionRef,
      });

      if (error) {
        console.error("Payment insert error:", error);
        return NextResponse.json(
          { error: "Failed to save payment" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
