import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getPerformancePaymentEligibilityByUserId,
  PERFORMANCE_REQUIRED_PAYMENT_AMOUNT,
} from "@/lib/performance-payment-rule";

export async function GET() {
  try {
    const session = await requireAuth(["student"]);
    const eligibility = await getPerformancePaymentEligibilityByUserId(
      session.userId,
    );

    return NextResponse.json({
      eligibility,
      requiredAmount: PERFORMANCE_REQUIRED_PAYMENT_AMOUNT,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
