import { supabaseAdmin } from "@/lib/supabase-admin";

export const PERFORMANCE_REQUIRED_PAYMENT_AMOUNT = 500;

type PaymentStatus = "approved" | "pending" | "rejected";

type PaymentRow = {
  amount: number;
  payment_status: PaymentStatus;
};

export type PerformancePaymentEligibilityStatus =
  | "eligible_approved"
  | "eligible_pending"
  | "ineligible_unpaid"
  | "ineligible_rejected"
  | "ineligible_insufficient";

export interface PerformancePaymentEligibility {
  eligible: boolean;
  status: PerformancePaymentEligibilityStatus;
  requiredAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus | null;
  message: string;
}

export function evaluatePerformancePaymentEligibility(
  payment: PaymentRow | null,
  requiredAmount = PERFORMANCE_REQUIRED_PAYMENT_AMOUNT,
): PerformancePaymentEligibility {
  if (!payment) {
    return {
      eligible: false,
      status: "ineligible_unpaid",
      requiredAmount,
      paidAmount: 0,
      paymentStatus: null,
      message: `Payment of Rs.${requiredAmount} is required before performance registration.`,
    };
  }

  const paidAmount = Number(payment.amount || 0);
  const paymentStatus = payment.payment_status;

  if (paidAmount < requiredAmount) {
    return {
      eligible: false,
      status: "ineligible_insufficient",
      requiredAmount,
      paidAmount,
      paymentStatus,
      message: `Minimum payment of Rs.${requiredAmount} is required. Current paid amount: Rs.${paidAmount}.`,
    };
  }

  if (paymentStatus === "approved") {
    return {
      eligible: true,
      status: "eligible_approved",
      requiredAmount,
      paidAmount,
      paymentStatus,
      message: "Payment approved. You can register performances.",
    };
  }

  if (paymentStatus === "pending") {
    return {
      eligible: true,
      status: "eligible_pending",
      requiredAmount,
      paidAmount,
      paymentStatus,
      message:
        "Payment is pending verification, but performance registration is allowed.",
    };
  }

  return {
    eligible: false,
    status: "ineligible_rejected",
    requiredAmount,
    paidAmount,
    paymentStatus,
    message:
      "Your payment was rejected. Please re-submit payment to continue performance registration.",
  };
}

export async function getPerformancePaymentEligibilityByUserId(userId: string) {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("amount, payment_status")
    .eq("user_id", userId)
    .maybeSingle();

  return evaluatePerformancePaymentEligibility(payment as PaymentRow | null);
}
