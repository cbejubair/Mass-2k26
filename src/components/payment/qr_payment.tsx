"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  QrCode,
  ZoomIn,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import QRDisplay from "@/components/qr/QRDisplay";

interface QrPaymentProps {
  studentName: string;
  registerNumber: string;
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
}

type Stage = "upload" | "submitting" | "pending" | "approved" | "rejected";

function previewScreenshot(url: string) {
  const img = document.createElement("img");
  img.src = url;
  img.style.cssText =
    "max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.8);";
  const backdrop = document.createElement("div");
  backdrop.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;";
  backdrop.onclick = () => backdrop.remove();
  backdrop.appendChild(img);
  document.body.appendChild(backdrop);
}

export default function QrPayment({
  studentName,
  registerNumber,
}: QrPaymentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [stage, setStage] = useState<Stage>("upload");
  const [errorMsg, setErrorMsg] = useState("");
  const [existingPayment, setExistingPayment] =
    useState<ExistingPayment | null>(null);
  const [entryQr, setEntryQr] = useState<EntryQR | null>(null);

  const checkExisting = async () => {
    const res = await fetch("/api/payments/status");
    const data = await res.json();
    if (data.payment) {
      const p: ExistingPayment = data.payment;
      setExistingPayment(p);
      if (p.payment_status === "approved") {
        const qrRes = await fetch("/api/qr/generate", { method: "POST" });
        const qrData = await qrRes.json();
        if (qrData.qr) setEntryQr(qrData.qr);
        setStage("approved");
      } else if (p.payment_status === "rejected") {
        setStage("rejected");
      } else {
        setStage("pending");
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] || null;
    if (!chosen) return;
    if (chosen.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be less than 5 MB");
      return;
    }
    setErrorMsg("");
    setFile(chosen);
    await checkExisting();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select your payment screenshot");
      return;
    }

    setStage("submitting");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("amount", "500");
      formData.append("paymentMode", "upi");
      if (transactionRef.trim())
        formData.append("transactionRef", transactionRef.trim());

      const res = await fetch("/api/payments/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Upload failed");
        setStage("upload");
        return;
      }

      const statusRes = await fetch("/api/payments/status");
      const statusData = await statusRes.json();
      if (statusData.payment) setExistingPayment(statusData.payment);
      setStage("pending");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStage("upload");
    }
  };

  /* ── APPROVED ───────────────────────────────────────────────── */
  if (stage === "approved") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 self-stretch">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-foreground">Payment Approved!</p>
            <p className="text-sm text-muted-foreground">
              Scan the QR at the event entrance.
            </p>
          </div>
        </div>

        {entryQr ? (
          <QRDisplay
            token={entryQr.qr_token}
            studentName={studentName}
            registerNumber={registerNumber}
          />
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating your QR…
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Screenshot your QR code for quick access on the event day.
        </p>
      </div>
    );
  }

  /* ── PENDING ────────────────────────────────────────────────── */
  if (stage === "pending") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-foreground">Payment Under Review</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your screenshot has been submitted. A coordinator or admin will
              approve it shortly and your QR code will be activated.
            </p>
          </div>
        </div>

        {existingPayment && (
          <div className="rounded-xl bg-muted/40 border border-border p-4 text-sm space-y-3">
            <Row label="Amount" value={`₹${existingPayment.amount}`} />
            <Row
              label="Status"
              value={
                <Badge
                  variant="secondary"
                  className="bg-amber-500/15 text-amber-400 border-0"
                >
                  Pending
                </Badge>
              }
            />
            {existingPayment.transaction_ref && (
              <Row
                label="UTR / Ref"
                value={
                  <span className="font-mono text-xs">
                    {existingPayment.transaction_ref}
                  </span>
                }
              />
            )}
            <Row
              label="Screenshot"
              value={
                <button
                  onClick={() =>
                    previewScreenshot(existingPayment.screenshot_url)
                  }
                  className="inline-flex items-center gap-1 text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors"
                >
                  View <ZoomIn className="h-3.5 w-3.5" />
                </button>
              }
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          You’ll receive your QR code once the payment is verified.
        </p>
      </div>
    );
  }

  /* ── REJECTED ──────────────────────────────────────────────── */
  if (stage === "rejected") {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
            <XCircle className="h-4.5 w-4.5 text-destructive" />
          </div>
          <div>
            <p className="font-bold text-foreground">Payment Rejected</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your payment was rejected. Please re-upload a valid screenshot or
              contact your coordinator.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setStage("upload");
            setFile(null);
            setTransactionRef("");
            setExistingPayment(null);
          }}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Re-upload Screenshot
        </Button>
      </div>
    );
  }

  /* ── UPLOAD FORM ────────────────────────────────────────────── */
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <QrCode className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <p className="font-bold text-foreground">Pay via UPI QR</p>
          <p className="text-xs text-muted-foreground">
            Scan • Pay • Upload screenshot
          </p>
        </div>
      </div>

      {/* Organizer UPI QR display */}
      <div className="rounded-xl bg-muted/40 border border-border p-5 flex flex-col sm:flex-row items-center gap-5">
        <div className="bg-white rounded-xl p-3 shadow-md shrink-0">
          <Image
            src="/payment-qr.jpeg"
            alt="UPI Payment QR"
            width={160}
            height={160}
            className="rounded-lg"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              t.style.display = "none";
              const parent = t.parentElement;
              if (parent && !parent.querySelector(".qr-placeholder")) {
                const ph = document.createElement("div");
                ph.className =
                  "qr-placeholder flex flex-col items-center justify-center w-40 h-40 text-gray-400 text-xs text-center gap-2";
                ph.innerHTML = `<span class="text-4xl">📷</span><span>Place your UPI QR<br/>at /public/payment-qr.jpeg</span>`;
                parent.appendChild(ph);
              }
            }}
          />
        </div>
        <div className="text-sm space-y-1.5 text-center sm:text-left">
          <p className="font-bold text-foreground text-base">MASS 2K26</p>
          <p className="text-muted-foreground">Scan with any UPI app</p>
          <p className="text-3xl font-black text-violet-400 mt-1">₹500</p>
          <p className="text-xs text-muted-foreground">
            PhonePe · GPay · Paytm · BHIM
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Transaction ref */}
        <div className="space-y-1.5">
          <Label
            htmlFor="qr-ref"
            className="text-sm font-medium text-foreground"
          >
            UTR / Transaction Reference{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="qr-ref"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="e.g. 426123456789"
          />
        </div>

        {/* Screenshot upload */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">
            Payment Screenshot <span className="text-red-400">*</span>
          </Label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer">
            <input
              type="file"
              accept="image/*"
              id="qr-screenshot"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="qr-screenshot" className="cursor-pointer block">
              {file ? (
                <div className="space-y-1">
                  <p className="font-medium text-violet-400">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-muted/60 border border-border flex items-center justify-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">
                    Click to upload screenshot
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG / PNG • Max 5 MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={stage === "submitting" || !file}
          className="w-full h-11 font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm shadow-lg shadow-violet-900/30 transition-all disabled:opacity-50"
        >
          {stage === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting…
            </>
          ) : (
            "Submit for Verification"
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Your QR code will be activated after admin / coordinator approval.
      </p>
    </div>
  );
}

/* ── Helper ─────────────────────────────────────────────────────── */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
