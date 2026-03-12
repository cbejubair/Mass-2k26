"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RazorpayPay from "@/components/payment/razorpay_pay";
import QRDisplay from "@/components/qr/QRDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, X, CheckCircle2, Clock, ExternalLink } from "lucide-react";

interface UnpaidStudent {
  id: string;
  name: string;
  register_number: string;
  department: string;
  year: string;
  class_section: string;
}

interface PaymentItem {
  id: string;
  user_id: string;
  amount: number;
  screenshot_url: string;
  payment_status: string;
  payment_mode: string | null;
  transaction_ref: string | null;
  created_at?: string;
  verified_by?: string | null;
  verified_at?: string | null;
  users: {
    name: string;
    register_number: string;
    department?: string;
    year?: string;
    class_section?: string;
  };
  verifier?: { name: string } | null;
}

interface ClassScope {
  department: string | null;
  year: string | null;
  classSection: string | null;
  label: string;
}

interface PaymentSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalAmount: number;
  pendingAmount: number;
}

interface SelfProfile {
  name: string;
  registerNumber: string | null;
}

interface SelfPayment {
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function CoordinatorSelfPaymentCard() {
  const [profile, setProfile] = useState<SelfProfile | null>(null);
  const [payment, setPayment] = useState<SelfPayment | null>(null);
  const [entryQr, setEntryQr] = useState<EntryQR | null>(null);
  const [loading, setLoading] = useState(true);

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
        // ignore; card will stay in fallback state
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (payment?.payment_status === "approved") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">My Entry Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
            <div>
              <p className="font-semibold">Payment Approved</p>
              <p className="text-xs text-muted-foreground">
                Your class coordinator entry fee has been confirmed.
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
              value={<span className="capitalize">{payment.payment_mode}</span>}
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
                    onClick={() =>
                      window.open(payment.screenshot_url, "_blank")
                    }
                    className="text-primary hover:underline flex items-center gap-1 h-auto p-0"
                  >
                    Preview <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
          </div>

          {entryQr && profile ? (
            <QRDisplay
              token={entryQr.qr_token}
              studentName={profile.name}
              registerNumber={profile.registerNumber ?? ""}
            />
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Generating your QR…
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (payment?.payment_status === "pending") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">My Entry Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold">Awaiting Verification</p>
              <p className="text-xs text-muted-foreground">
                Your payment is being reviewed.
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
              value={<span className="capitalize">{payment.payment_mode}</span>}
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">My Entry Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Class coordinators can also complete the ₹500 entry fee here using
          Razorpay.
        </p>
        <RazorpayPay
          studentName={profile?.name ?? ""}
          registerNumber={profile?.registerNumber ?? ""}
        />
      </CardContent>
    </Card>
  );
}

export default function CoordinatorPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [classScope, setClassScope] = useState<ClassScope | null>(null);
  const [summary, setSummary] = useState<PaymentSummary>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/coordinator/payments");
      const data = await res.json();
      setPayments(data.payments || []);
      if (data.classScope) setClassScope(data.classScope);
      if (data.summary) setSummary(data.summary);
    } catch {
      console.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, status: string) => {
    setVerifying(paymentId);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });

      if (res.ok) {
        fetchPayments();
      }
    } catch {
      alert("Failed to verify");
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusPriority: Record<string, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  const filteredPayments = (
    filter === "all"
      ? payments
      : payments.filter((p) => p.payment_status === filter)
  )
    .slice()
    .sort((a, b) => {
      const byStatus =
        (statusPriority[a.payment_status] ?? 99) -
        (statusPriority[b.payment_status] ?? 99);
      if (byStatus !== 0) return byStatus;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Coordinator Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {classScope
            ? `Scope: ${classScope.label}`
            : "Payment approvals for your assigned routing scope"}
        </p>
      </div>

      <CoordinatorSelfPaymentCard />

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Pending Approvals</p>
            <p className="font-semibold text-amber-400">{summary.pending}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pending Amount</p>
            <p className="font-semibold text-amber-400">
              ₹{summary.pendingAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Approved</p>
            <p className="font-semibold text-green-400">{summary.approved}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rejected</p>
            <p className="font-semibold text-red-400">{summary.rejected}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Amount</p>
            <p className="font-semibold">
              ₹{summary.totalAmount.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filter === status ? "default" : "secondary"}
            className="capitalize"
            onClick={() => setFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredPayments.length} payment(s) • Pending payments appear
        first for quick approval.
      </p>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Register No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">
                  {p.users?.register_number}
                </TableCell>
                <TableCell>{p.users?.name}</TableCell>
                <TableCell>₹{p.amount}</TableCell>
                <TableCell>
                  <span className="text-xs capitalize">
                    {p.payment_mode || "upi"}
                  </span>
                  {p.transaction_ref && (
                    <p
                      className="text-xs text-muted-foreground font-mono truncate max-w-[100px]"
                      title={p.transaction_ref}
                    >
                      {p.transaction_ref}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {p.screenshot_url ? (
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(p.screenshot_url)}
                      className="inline-flex items-center gap-2"
                    >
                      <img
                        src={p.screenshot_url}
                        alt="Payment screenshot"
                        className="h-12 w-12 rounded-md border border-border object-cover"
                      />
                      <span className="text-primary hover:underline text-sm">
                        Preview
                      </span>
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {p.created_at ? (
                    <>
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <br />
                      {new Date(p.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.payment_status === "approved"
                        ? "default"
                        : p.payment_status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {p.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {p.payment_status !== "pending" && p.verifier?.name ? (
                    <>
                      <span className="font-medium text-foreground">
                        {p.verifier.name}
                      </span>
                      {p.verified_at && (
                        <>
                          <br />
                          {new Date(p.verified_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        p.payment_status === "approved" ? "default" : "outline"
                      }
                      className="text-xs h-7"
                      onClick={() => handleVerify(p.id, "approved")}
                      disabled={
                        verifying === p.id || p.payment_status === "approved"
                      }
                    >
                      {verifying === p.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        p.payment_status === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-xs h-7"
                      onClick={() => handleVerify(p.id, "rejected")}
                      disabled={
                        verifying === p.id || p.payment_status === "rejected"
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredPayments.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No payments found for {filter}
        </p>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="secondary"
              className="absolute right-2 top-2 z-10"
              onClick={() => setPreviewUrl(null)}
            >
              Close
            </Button>
            <img
              src={previewUrl}
              alt="Payment screenshot preview"
              className="w-full max-h-[85vh] object-contain rounded-lg border border-border bg-background"
            />
          </div>
        </div>
      )}
    </div>
  );
}
