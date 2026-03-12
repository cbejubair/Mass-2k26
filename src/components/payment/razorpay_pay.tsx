"use client";

import { useState, useCallback } from "react";
import {
  CreditCard,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Loader2,
} from "lucide-react";
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
  const [transactionRef, setTransactionRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handlePay = useCallback(async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    window.location.href = "https://rzp.io/rzp/bJME4Qgv";
  }, [name]);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setErrorMsg("Please upload the payment screenshot");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be less than 5 MB");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("amount", "500");
      formData.append("paymentMode", "payment_link");
      if (transactionRef.trim()) {
        formData.append("transactionRef", transactionRef.trim());
      }

      const res = await fetch("/api/payments/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to upload screenshot");
        return;
      }

      setSuccessMsg(
        "Screenshot uploaded successfully. Your payment is now pending admin/coordinator approval.",
      );
      setFile(null);
      setTransactionRef("");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [file, transactionRef]);

  /* ── FORM ─────────────────────────────────────────────────── */
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          Announcement: After payment, please take a screenshot and upload it
          below.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete the payment on the redirected page, save the success
          screenshot, then upload it here for approval. Register No:{" "}
          {registerNumber}
        </p>
      </div>

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

      <div className="rounded-2xl border border-border bg-background/40 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Upload className="h-4.5 w-4.5 text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Upload Payment Screenshot
            </p>
            <p className="text-xs text-muted-foreground">
              Visible here so you can upload immediately after paying.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label
            htmlFor="payment-ref"
            className="text-sm font-medium text-foreground"
          >
            Transaction Reference
            <span className="text-muted-foreground font-normal">
              {" "}
              (optional)
            </span>
          </Label>
          <Input
            id="payment-ref"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="Enter UTR / Transaction ID"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="payment-screenshot"
            className="text-sm font-medium text-foreground"
          >
            Payment Screenshot <span className="text-red-400">*</span>
          </Label>
          <input
            id="payment-screenshot"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-violet-500"
          />
          {file && (
            <p className="text-xs text-muted-foreground">
              Selected: {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full h-11 font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm shadow-lg shadow-violet-900/30 transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading Screenshot…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Screenshot for Approval
            </>
          )}
        </Button>
      </div>

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
