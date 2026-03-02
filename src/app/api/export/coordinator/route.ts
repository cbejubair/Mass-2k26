import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const session = await requireAuth(["class_coordinator"]);

    // Fetch only students from coordinator's class
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("role", "student")
      .eq("department", session.department!)
      .eq("year", session.year!)
      .eq("class_section", session.classSection!)
      .order("register_number");

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 404 });
    }

    const userIds = users.map((u) => u.id);

    const [regResult, payResult, perfResult, qrResult] = await Promise.all([
      supabaseAdmin
        .from("event_registrations")
        .select("*")
        .in("user_id", userIds),
      supabaseAdmin.from("payments").select("*").in("user_id", userIds),
      supabaseAdmin
        .from("performance_registrations")
        .select("*")
        .in("user_id", userIds),
      supabaseAdmin.from("entry_qr").select("*").in("user_id", userIds),
    ]);

    const regMap = new Map((regResult.data || []).map((r) => [r.user_id, r]));
    const payMap = new Map((payResult.data || []).map((p) => [p.user_id, p]));
    const qrMap = new Map((qrResult.data || []).map((q) => [q.user_id, q]));

    const rows = users.map((user) => {
      const reg = regMap.get(user.id);
      const pay = payMap.get(user.id);
      const qr = qrMap.get(user.id);

      return {
        "Register No": user.register_number || "",
        Name: user.name,
        "Payment Status": pay?.payment_status || "Not Submitted",
        Amount: pay?.amount || 0,
        "Support Status": reg?.support_status ? "Yes" : "No",
        "QR Active": qr?.is_active ? "Yes" : "No",
        "Checked In": qr?.checked_in_at ? "Yes" : "No",
        "Checked Out": qr?.checked_out_at ? "Yes" : "No",
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Class Report");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Class_Report_${session.classSection}_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
