"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRDisplay from "@/components/qr/QRDisplay";

// Extend window type for Razorpay script injection
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface RazorpayPayProps {
  studentName: string;
  registerNumber: string;
  studentEmail?: string;
  studentMobile?: string;
}

type Stage = "form" | "processing" | "success" | "error";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayPay({
  studentName,
  registerNumber,
  studentEmail = "",
  studentMobile = "",
}: RazorpayPayProps) {
  const [name, setName] = useState(studentName);
  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then(setScriptReady);
  }, []);

  const handlePay = useCallback(async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }

    setErrorMsg("");
    setStage("processing");

    const loaded = scriptReady || (await loadRazorpayScript());
    if (!loaded || !window.Razorpay) {
      setErrorMsg("Failed to load payment gateway. Please try again.");
      setStage("error");
      return;
    }

    const orderRes = await fetch("/api/payments/razorpay/order", {
      method: "POST",
    });
    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      if (orderRes.status === 401) {
        window.location.href = "/login";
        return;
      }
      setErrorMsg(orderData.error || "Failed to create payment order");
      setStage("error");
      return;
    }

    const { orderId, amount, currency, keyId } = orderData;

    await new Promise<void>((resolve) => {
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "MASS 2K26",
        description: "Event Entry Fee",
        order_id: orderId,
        theme: { color: "#818cf8" },
        prefill: {
          name: name.trim(),
          email: studentEmail,
          contact: studentMobile,
        },
        modal: {
          ondismiss: () => {
            setStage("form");
            resolve();
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const captureRes = await fetch("/api/payments/razorpay/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          const captureData = await captureRes.json();
          if (!captureRes.ok) {
            if (captureRes.status === 401) {
              window.location.href = "/login";
              resolve();
              return;
            }
            setErrorMsg(
              captureData.error ||
                "Payment was charged but could not be recorded. Contact support.",
            );
            setStage("error");
          } else {
            setQrToken(captureData.qrToken ?? null);
            setStage("success");
          }
          resolve();
        },
      });
      rzp.on("payment.failed", (resp: { error: { description: string } }) => {
        setErrorMsg(resp.error?.description || "Payment failed");
        setStage("error");
        resolve();
      });
      rzp.open();
    });
  }, [name, studentEmail, studentMobile, scriptReady]);

  /* ── SUCCESS ──────────────────────────────────────────────── */
  if (stage === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col items-center gap-6">
        <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-foreground">
            Payment Successful!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Your entry QR has been generated. Show it at the entrance.
          </p>
        </div>

        {qrToken ? (
          <QRDisplay
            token={qrToken}
            studentName={studentName}
            registerNumber={registerNumber}
          />
        ) : (
          <p className="text-sm text-muted-foreground">QR loading…</p>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Screenshot your QR for quick access on event day.
        </p>
      </div>
    );
  }

  /* ── ERROR ────────────────────────────────────────────────── */
  if (stage === "error") {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <p className="font-semibold text-foreground">Payment Error</p>
        <p className="text-sm text-red-400 text-center">{errorMsg}</p>
        <Button
          variant="outline"
          onClick={() => {
            setStage("form");
            setErrorMsg("");
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  /* ── FORM ─────────────────────────────────────────────────── */
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <p className="font-bold text-foreground">Pay Online</p>
          <p className="text-xs text-muted-foreground">
            Secure payment via Razorpay
          </p>
        </div>
      </div>

      {/* Amount banner */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent" />
        <div className="relative border border-indigo-500/20 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">
              Event Entry Fee
            </p>
            <p className="text-4xl font-black text-foreground mt-0.5">₹500</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-sm font-semibold text-foreground">MASS 2K26</p>
            <p className="text-xs text-muted-foreground">
              UPI · Card · NetBanking
            </p>
          </div>
        </div>
      </div>

      {/* Name field */}
      <div className="space-y-1.5">
        <Label
          htmlFor="rz-name"
          className="text-sm font-medium text-foreground"
        >
          Full Name
        </Label>
        <Input
          id="rz-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <p className="text-xs text-muted-foreground">
          This name will appear on your payment receipt.
        </p>
      </div>

      {errorMsg && stage === "form" && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Pay button */}
      <Button
        onClick={handlePay}
        disabled={stage === "processing"}
        className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm shadow-lg shadow-indigo-900/30 transition-all"
      >
        {stage === "processing" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Opening Payment Gateway…
          </>
        ) : (
          "Pay ₹500 via Razorpay"
        )}
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          SSL Encrypted
        </div>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-xs text-muted-foreground">
          Powered by Razorpay
        </span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-xs text-muted-foreground">
          Instant confirmation
        </span>
      </div>
    </div>
  );
}
