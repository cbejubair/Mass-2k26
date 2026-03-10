"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import RazorpayPay from "@/components/payment/razorpay_pay";
import QrPayment from "@/components/payment/qr_payment";
import QRDisplay from "@/components/qr/QRDisplay";

interface UserProfile {
  name: string;
  registerNumber: string | null;
}

interface ExistingPayment {
  id: string;
  amount: number;
  payment_status: "pending" | "approved" | "rejected";
  payment_mode: string;
  transaction_ref: string | null;
  screenshot_url: string;
  created_at: string;
  verified_at?: string | null;
}

interface EntryQR {
  qr_token: string;
  is_active: boolean;
}

type PayMethod = "razorpay" | "upi";

export default function PaymentPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [payment, setPayment] = useState<ExistingPayment | null>(null);
  const [entryQr, setEntryQr] = useState<EntryQR | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [tab, setTab] = useState<PayMethod>("razorpay");
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const [profileRes, paymentRes] = await Promise.all([
          fetch("/api/auth/me").then((r) => r.json()),
          fetch("/api/payments/status").then((r) => r.json()),
        ]);

        setProfile({
          name: profileRes.name ?? "",
          registerNumber: profileRes.registerNumber ?? "",
        });

        if (paymentRes.payment) {
          setPayment(paymentRes.payment);
          if (paymentRes.payment.payment_status === "approved") {
            const qrRes = await fetch("/api/qr/generate", { method: "POST" });
            const qrData = await qrRes.json();
            if (qrData.qr) setEntryQr(qrData.qr);
          }
        }
      } catch {
        // ignore
      } finally {
        setPageLoading(false);
      }
    }
    init();
  }, []);

  /* ── LOADING ─────────────────────────────────────────────── */
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ── APPROVED ─────────────────────────────────────────────── */
  if (payment?.payment_status === "approved") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Payment Status</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your entry QR code is ready.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
              <div>
                <p className="font-semibold">Payment Approved</p>
                <p className="text-xs text-muted-foreground">
                  Present this QR at the event entrance.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3 text-sm">
              <InfoRow
                label="Amount"
                value={`₹${payment.amount.toLocaleString()}`}
              />
              <InfoRow
                label="Mode"
                value={
                  <span className="capitalize">{payment.payment_mode}</span>
                }
              />
              {payment.transaction_ref && (
                <InfoRow
                  label="Transaction Ref"
                  value={
                    <span className="font-mono text-xs">
                      {payment.transaction_ref}
                    </span>
                  }
                />
              )}
              {payment.verified_at && (
                <InfoRow
                  label="Approved On"
                  value={
                    <span className="text-xs">
                      {new Date(payment.verified_at).toLocaleString("en-IN")}
                    </span>
                  }
                />
              )}
              {payment.screenshot_url &&
                !payment.screenshot_url.startsWith("razorpay:") && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Screenshot</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const img = document.createElement("img");
                        img.src = payment.screenshot_url;
                        img.style.cssText =
                          "max-width:90vw;max-height:90vh;border-radius:8px;";
                        const modal = document.createElement("div");
                        modal.style.cssText =
                          "position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:50;";
                        modal.onclick = () => modal.remove();
                        modal.appendChild(img);
                        document.body.appendChild(modal);
                      }}
                      className="text-primary hover:underline flex items-center gap-1 h-auto p-0"
                    >
                      Preview <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
            </div>

            {entryQr && profile ? (
              <div className="pt-2">
                <QRDisplay
                  token={entryQr.qr_token}
                  studentName={profile.name}
                  registerNumber={profile.registerNumber ?? ""}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Generating your QR…
              </p>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard/student")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── PENDING ──────────────────────────────────────────────── */
  if (payment?.payment_status === "pending") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Payment Status</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your payment is under review.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold">Awaiting Verification</p>
                <p className="text-xs text-muted-foreground">
                  A coordinator or admin will review your payment shortly.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3 text-sm">
              <InfoRow
                label="Amount"
                value={`₹${payment.amount.toLocaleString()}`}
              />
              <InfoRow
                label="Status"
                value={<Badge variant="secondary">Pending</Badge>}
              />
              <InfoRow
                label="Mode"
                value={
                  <span className="capitalize">{payment.payment_mode}</span>
                }
              />
              {payment.transaction_ref && (
                <InfoRow
                  label="UTR / Ref"
                  value={
                    <span className="font-mono text-xs">
                      {payment.transaction_ref}
                    </span>
                  }
                />
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard/student")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── NO PAYMENT / REJECTED ────────────────────────────────── */
  const isRejected = payment?.payment_status === "rejected";

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">
          {isRejected ? "Re-submit Payment" : "Complete Your Payment"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isRejected
            ? "Your previous payment was rejected. Please submit again."
            : "Choose a payment method to register for MASS 2K26."}
        </p>
      </div>

      {isRejected && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400 flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          Payment was rejected. Please contact your coordinator if needed.
        </div>
      )}

      {/* Tab switcher */}
      <div className="grid grid-cols-2 gap-2 bg-muted/40 rounded-xl p-1 border border-border">
        <button
          onClick={() => setTab("razorpay")}
          className={`rounded-lg py-2.5 px-4 text-sm font-medium transition-all ${
            tab === "razorpay"
              ? "bg-background shadow-sm text-foreground border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Online Payment
        </button>
        <button
          onClick={() => setTab("upi")}
          className={`rounded-lg py-2.5 px-4 text-sm font-medium transition-all ${
            tab === "upi"
              ? "bg-background shadow-sm text-foreground border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          UPI / Manual
        </button>
      </div>

      {tab === "razorpay" ? (
        <RazorpayPay
          studentName={profile?.name ?? ""}
          registerNumber={profile?.registerNumber ?? ""}
        />
      ) : (
        <QrPayment
          studentName={profile?.name ?? ""}
          registerNumber={profile?.registerNumber ?? ""}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
