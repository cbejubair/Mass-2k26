"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Upload, ExternalLink } from "lucide-react";

interface ExistingPayment {
  id: string;
  amount: number;
  payment_status: string;
  payment_mode: string;
  transaction_ref: string | null;
  screenshot_url: string;
  created_at: string;
  verified_at?: string | null;
}

export default function PaymentPage() {
  const [transactionRef, setTransactionRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingPayment, setExistingPayment] =
    useState<ExistingPayment | null>(null);
  const router = useRouter();
  const amount = "700";
  const paymentMode = "upi";

  useEffect(() => {
    fetch("/api/payments/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.payment) setExistingPayment(data.payment);
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a screenshot");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("amount", amount);
      formData.append("paymentMode", paymentMode);
      if (transactionRef.trim()) {
        formData.append("transactionRef", transactionRef.trim());
      }

      const res = await fetch("/api/payments/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/student"), 2000);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (existingPayment) {
    const submitted = new Date(existingPayment.created_at);
    const dateStr = submitted.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const timeStr = submitted.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return (
      <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Payment Status</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your payment submission details
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
              <div>
                <p className="font-semibold">Payment Submitted</p>
                <p className="text-xs text-muted-foreground">
                  Your payment has been submitted and is awaiting verification.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-base">
                  ₹{existingPayment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    existingPayment.payment_status === "approved"
                      ? "default"
                      : existingPayment.payment_status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {existingPayment.payment_status}
                </Badge>
              </div>
              {existingPayment.payment_mode && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Mode</span>
                  <span className="font-medium capitalize">
                    {existingPayment.payment_mode}
                  </span>
                </div>
              )}
              {existingPayment.transaction_ref && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transaction Ref</span>
                  <span className="font-mono text-xs">
                    {existingPayment.transaction_ref}
                  </span>
                </div>
              )}
              {/* <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Submitted On
                </span>
                <span className="text-right">
                  <span className="font-medium">{dateStr}</span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {timeStr}
                  </span>
                </span>
              </div> */}
              {existingPayment.verified_at && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Verified On</span>
                  <span className="text-right text-xs">
                    {new Date(existingPayment.verified_at).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Screenshot</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const img = document.createElement("img");
                    img.src = existingPayment.screenshot_url;
                    img.style.cssText =
                      "max-width: 90vw; max-height: 90vh; border-radius: 8px;";
                    const modal = document.createElement("div");
                    modal.style.cssText =
                      "position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 50;";
                    modal.onclick = () => modal.remove();
                    modal.appendChild(img);
                    document.body.appendChild(modal);
                  }}
                  className="text-primary hover:underline flex items-center gap-1 h-auto p-0"
                >
                  Preview <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {existingPayment.payment_status === "rejected" && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
                Your payment was rejected. Please contact your coordinator to
                re-submit.
              </div>
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

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <CheckCircle2 className="h-12 w-12 text-green-400 mb-4" />
        <h2 className="text-xl font-bold">Payment Uploaded!</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Waiting for admin verification. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Payment Upload</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your payment screenshot for verification
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Payment Details</Label>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">₹700</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium">UPI</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transaction Reference (optional)</Label>
              <Input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="UPI ref / transaction ID"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Screenshot</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="screenshot"
                />
                <label htmlFor="screenshot" className="cursor-pointer">
                  {file ? (
                    <div>
                      <p className="text-primary">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Click to upload screenshot
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Max 2MB, JPG/PNG
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Submit Payment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
