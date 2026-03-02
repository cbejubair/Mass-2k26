"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

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
        <h1 className="text-xl sm:text-2xl font-bold">Payment Verification</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {classScope
            ? `Class Map: ${classScope.label}`
            : "Class-mapped payment approvals"}
        </p>
      </div>

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
