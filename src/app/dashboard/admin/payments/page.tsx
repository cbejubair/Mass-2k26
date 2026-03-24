"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  verified_by: string | null;
  verified_at: string | null;
  created_at?: string;
  users: {
    name: string;
    register_number: string;
    department: string;
    year: string;
    class_section: string;
  } | null;
  verifier: { name: string } | null;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to load payments");
      }

      const data = await res.json();
      if (!Array.isArray(data.payments)) {
        throw new Error("Invalid payments response");
      }

      setPayments(data.payments || []);
      setLoadError(null);
    } catch (error) {
      setPayments([]);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load payments",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string, status: string) => {
    setVerifying(paymentId);
    try {
      await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });
      fetchPayments();
    } catch {
      alert("Failed");
    } finally {
      setVerifying(null);
    }
  };

  const statusPriority: Record<string, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          payments
            .map((payment) => payment.users?.department)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [payments],
  );

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          payments
            .map((payment) => payment.users?.year)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [payments],
  );

  const modeOptions = useMemo(
    () =>
      Array.from(
        new Set(payments.map((payment) => payment.payment_mode || "upi")),
      ).sort((a, b) => a.localeCompare(b)),
    [payments],
  );

  const summary = useMemo(
    () => ({
      pending: payments.filter(
        (payment) => payment.payment_status === "pending",
      ).length,
      approved: payments.filter(
        (payment) => payment.payment_status === "approved",
      ).length,
      rejected: payments.filter(
        (payment) => payment.payment_status === "rejected",
      ).length,
    }),
    [payments],
  );

  const filtered = payments
    .filter((payment) => {
      if (statusFilter !== "all" && payment.payment_status !== statusFilter) {
        return false;
      }

      if (
        departmentFilter !== "all" &&
        payment.users?.department !== departmentFilter
      ) {
        return false;
      }

      if (yearFilter !== "all" && payment.users?.year !== yearFilter) {
        return false;
      }

      const resolvedMode = payment.payment_mode || "upi";
      if (modeFilter !== "all" && resolvedMode !== modeFilter) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const query = search.toLowerCase();
      return (
        payment.users?.name?.toLowerCase().includes(query) ||
        payment.users?.register_number?.toLowerCase().includes(query) ||
        payment.users?.department?.toLowerCase().includes(query) ||
        payment.transaction_ref?.toLowerCase().includes(query)
      );
    })
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

  const renderText = (value?: string | null) => {
    const normalized = value?.trim();
    return normalized ? normalized : "—";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            {loadError}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Payment Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filtered.length} of {payments.length} submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Pending: {summary.pending}</Badge>
          <Badge variant="default">Approved: {summary.approved}</Badge>
          <Badge variant="destructive">Rejected: {summary.rejected}</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, register no, txn ref..."
            className="lg:col-span-2"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentOptions.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {modeOptions.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDepartmentFilter("all");
              setYearFilter("all");
              setModeFilter("all");
            }}
            className="sm:col-span-2 lg:col-span-6"
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead>Register No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year/Section</TableHead>
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
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">
                  {renderText(p.users?.register_number)}
                </TableCell>
                <TableCell>{renderText(p.users?.name)}</TableCell>
                <TableCell>{renderText(p.users?.department)}</TableCell>
                <TableCell>
                  {renderText(
                    [p.users?.year, p.users?.class_section]
                      .map((value) => value?.trim())
                      .filter(Boolean)
                      .join(" / "),
                  )}
                </TableCell>
                <TableCell className="font-semibold">₹{p.amount}</TableCell>
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
                        {renderText(p.verifier.name)}
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
                        "✓ Approve"
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
                      ✕ Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No payments found
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
              src={previewUrl ?? ""}
              alt="Payment screenshot preview"
              className="w-full max-h-[85vh] object-contain rounded-lg border border-border bg-background"
            />
          </div>
        </div>
      )}
    </div>
  );
}
