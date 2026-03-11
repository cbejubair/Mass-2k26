import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["class_coordinator"]);

    const formData = await req.formData();
    const studentId = formData.get("studentId") as string;
    const file = formData.get("screenshot") as File;
    const transactionRef = (formData.get("transactionRef") as string) || null;

    if (!studentId || !file) {
      return NextResponse.json(
        { error: "studentId and screenshot are required" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Get coordinator's class assignment
    const { data: coordinatorRow } = await supabaseAdmin
      .from("users")
      .select("department, year, class_section")
      .eq("id", session.userId)
      .single();

    const dept = coordinatorRow?.department;
    const yr = coordinatorRow?.year;
    const section = coordinatorRow?.class_section;

    if (!dept || !yr || !section) {
      return NextResponse.json(
        { error: "Coordinator has no class assignment" },
        { status: 400 },
      );
    }

    // Verify the student belongs to coordinator's class
    const { data: student, error: studentErr } = await supabaseAdmin
      .from("users")
      .select("id, name, register_number")
      .eq("id", studentId)
      .eq("role", "student")
      .eq("department", dept)
      .eq("year", yr)
      .eq("class_section", section)
      .single();

    if (studentErr || !student) {
      return NextResponse.json(
        { error: "Student not found in your class" },
        { status: 403 },
      );
    }

    // Check if student already has a non-rejected payment
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, payment_status")
      .eq("user_id", studentId)
      .single();

    if (existingPayment && existingPayment.payment_status !== "rejected") {
      return NextResponse.json(
        { error: "Student already has an active payment record" },
        { status: 409 },
      );
    }

    // Upload screenshot to storage
    const fileExt = file.name.split(".").pop();
    const filePath = `payments/${student.register_number}/screenshot.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("mass")
      .upload(filePath, fileBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("[coordinator upload] storage error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload screenshot" },
        { status: 500 },
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("mass")
      .getPublicUrl(filePath);

    if (existingPayment) {
      // Update rejected → pending
      const { error } = await supabaseAdmin
        .from("payments")
        .update({
          amount: 500,
          screenshot_url: urlData.publicUrl,
          payment_status: "pending",
          payment_mode: "upi",
          transaction_ref: transactionRef,
          verified_by: null,
          verified_at: null,
        })
        .eq("id", existingPayment.id);

      if (error) {
        console.error("[coordinator upload] update error:", error);
        return NextResponse.json(
          { error: "Failed to update payment record" },
          { status: 500 },
        );
      }
    } else {
      const { error } = await supabaseAdmin.from("payments").insert({
        user_id: studentId,
        amount: 500,
        screenshot_url: urlData.publicUrl,
        payment_status: "pending",
        payment_mode: "upi",
        transaction_ref: transactionRef,
      });

      if (error) {
        console.error("[coordinator upload] insert error:", error);
        return NextResponse.json(
          { error: "Failed to create payment record" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true, studentName: student.name });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
