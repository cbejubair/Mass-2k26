"use client";

import { useState, useCallback } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RazorpayPayProps {
  studentName: string;
  registerNumber: string;
  studentEmail?: string;
  studentMobile?: string;
}

export default function RazorpayPay({
  studentName,
  registerNumber,
  studentEmail = "",
  studentMobile = "",
}: RazorpayPayProps) {
  const [name, setName] = useState(studentName);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = useCallback(async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }

    setErrorMsg("");
    window.location.href = "https://rzp.io/rzp/bJME4Qgv";
  }, [name]);

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

      {errorMsg && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Pay button */}
      <Button
        onClick={handlePay}
        className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm shadow-lg shadow-indigo-900/30 transition-all"
      >
        Go to Payment Link
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          SSL Encrypted
        </div>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-xs text-muted-foreground">Redirect payment</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-xs text-muted-foreground">
          Instant confirmation
        </span>
      </div>
    </div>
  );
}
