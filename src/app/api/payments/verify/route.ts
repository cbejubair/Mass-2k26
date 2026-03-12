import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import {
  getCoordinatorScope,
  paymentCoordinatorRoles,
} from "@/lib/coordinator-access";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["admin", ...paymentCoordinatorRoles]);
    const { paymentId, status } = await req.json();

    if (!paymentId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid payment ID or status" },
        { status: 400 },
      );
    }

    if (session.role !== "admin") {
      const scope = await getCoordinatorScope(session);

      if (!scope.canManagePayments) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { data: payment } = await supabaseAdmin
        .from("payments")
        .select(
          "user_id, users!payments_user_id_fkey!inner(department, year, class_section)",
        )
        .eq("id", paymentId)
        .single();

      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 },
        );
      }

      const student = (payment as any).users;
      if (scope.accessLevel === "class") {
        if (
          student.department !== scope.department ||
          student.year !== scope.year ||
          student.class_section !== scope.classSection
        ) {
          return NextResponse.json(
            { error: "You can only verify payments for your assigned class" },
            { status: 403 },
          );
        }
      } else if (
        scope.accessLevel === "department" &&
        student.department !== scope.department
      ) {
        return NextResponse.json(
          { error: "You can only verify payments for your department" },
          { status: 403 },
        );
      }
    }

    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .update({
        payment_status: status,
        verified_by: session.userId,
        verified_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select("user_id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to verify payment" },
        { status: 500 },
      );
    }

    // If approved, auto-create/activate QR token
    if (status === "approved" && payment) {
      // Check if QR already exists
      const { data: existingQr } = await supabaseAdmin
        .from("entry_qr")
        .select("id")
        .eq("user_id", payment.user_id)
        .single();

      if (!existingQr) {
        await supabaseAdmin.from("entry_qr").insert({
          user_id: payment.user_id,
          qr_token: uuidv4(),
          is_active: true,
        });
      } else {
        await supabaseAdmin
          .from("entry_qr")
          .update({
            is_active: true,
            checked_in_at: null,
            checked_in_by: null,
            checked_out_at: null,
            checked_out_by: null,
          })
          .eq("user_id", payment.user_id);
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
