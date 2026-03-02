import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    // Fetch all students with their related data
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("role", "student")
      .order("register_number");

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 404 });
    }

    const userIds = users.map((u) => u.id);

    // Fetch related data in parallel
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

    const registrations = regResult.data || [];
    const payments = payResult.data || [];
    const performances = perfResult.data || [];
    const qrs = qrResult.data || [];

    // Build lookup maps
    const regMap = new Map(registrations.map((r) => [r.user_id, r]));
    const payMap = new Map(payments.map((p) => [p.user_id, p]));
    const perfMap = new Map<string, typeof performances>();
    performances.forEach((p) => {
      const existing = perfMap.get(p.user_id) || [];
      existing.push(p);
      perfMap.set(p.user_id, existing);
    });
    const qrMap = new Map(qrs.map((q) => [q.user_id, q]));

    // Build Excel rows
    const rows = users.map((user) => {
      const reg = regMap.get(user.id);
      const pay = payMap.get(user.id);
      const perfs = perfMap.get(user.id) || [];
      const qr = qrMap.get(user.id);

      return {
        "Register No": user.register_number || "",
        Name: user.name,
        Department: user.department || "",
        Year: user.year || "",
        "Class Section": user.class_section || "",
        "Support Status": reg?.support_status ? "Yes" : "No",
        "Payment Status": pay?.payment_status || "Not Submitted",
        Amount: pay?.amount || 0,
        "Performance Type":
          perfs.map((p) => p.performance_type).join(", ") || "None",
        "QR Active": qr?.is_active ? "Yes" : "No",
        "Checked In": qr?.checked_in_at ? "Yes" : "No",
        "Checked Out": qr?.checked_out_at ? "Yes" : "No",
        Remarks: reg?.remarks || "",
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns
    const colWidths = Object.keys(rows[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r) => String((r as any)[key]).length),
        ) + 2,
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Master Report");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="MASS2026_Master_Report_${new Date().toISOString().split("T")[0]}.xlsx"`,
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
