"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Pin,
  CreditCard,
  Drama,
  QrCode,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  LogIn,
  LogOut,
  Users,
  ArrowRight,
  Ticket,
  UploadCloud,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  registration: { support_status: boolean; remarks: string } | null;
  payment: { payment_status: string; amount: number } | null;
  performances: { performance_type: string; approval_status: string }[];
  teamPerformances: {
    performance_type: string;
    leader_name: string;
    approval_status: string;
  }[];
  qr: {
    is_active: boolean;
    checked_in_at: string | null;
    checked_out_at: string | null;
    total_entries?: number;
    qr_token: string;
  } | null;
  surveyFilled: boolean;
}

const paymentLabel = (status?: string | null) => {
  if (!status) return "Not Submitted";
  if (status === "approved") return "Approved";
  if (status === "pending") return "Under Review";
  if (status === "rejected") return "Rejected";
  return status;
};

function StatusIcon({
  status,
}: {
  status: "done" | "pending" | "error" | "inactive";
}) {
  if (status === "done")
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
  if (status === "error")
    return <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
  if (status === "pending")
    return <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />;
  return (
    <div className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" />
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [regRes, payRes, perfRes, qrRes, teamPerfRes, surveyRes] =
          await Promise.all([
            fetch("/api/register").then((r) => r.json()),
            fetch("/api/payments/status")
              .then((r) => r.json())
              .catch(() => ({ payment: null })),
            fetch("/api/performances/submit").then((r) => r.json()),
            fetch("/api/qr/generate").then((r) => r.json()),
            fetch("/api/performances/team")
              .then((r) => r.json())
              .catch(() => ({ teamPerformances: [] })),
            fetch("/api/survey")
              .then((r) => r.json())
              .catch(() => ({ feedback: null })),
          ]);

        setData({
          registration: regRes.registration || null,
          payment: payRes.payment || null,
          performances: perfRes.performances || [],
          teamPerformances: teamPerfRes.teamPerformances || [],
          qr: qrRes.qr || null,
          surveyFilled: !!surveyRes.feedback,
        });
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const payStatus = data?.payment?.payment_status;
  const isInsideNow = !!data?.qr?.checked_in_at && !data?.qr?.checked_out_at;
  const entryCount = data?.qr?.total_entries ?? 0;

  // Determine quick action steps
  const steps = [
    {
      key: "survey",
      label: "Survey",
      description: data?.surveyFilled
        ? "Survey submitted — thank you!"
        : "Share your event preferences & feedback",
      icon: FileText,
      href: "/dashboard/student/survey",
      status: (data?.surveyFilled ? "done" : "inactive") as "done" | "inactive",
      actionLabel: data?.surveyFilled ? "View Response" : "Fill Survey",
    },
    {
      key: "payment",
      label: "Payment",
      description: data?.payment
        ? `₹${data.payment.amount} — ${paymentLabel(payStatus)}`
        : "Upload your UPI payment receipt",
      icon: CreditCard,
      href: "/dashboard/student/payment",
      status:
        payStatus === "approved"
          ? ("done" as const)
          : payStatus === "rejected"
            ? ("error" as const)
            : payStatus === "pending"
              ? ("pending" as const)
              : ("inactive" as const),
      actionLabel: payStatus ? "View Payment" : "Upload Receipt",
    },
    {
      key: "willingness",
      label: "Willingness Form",
      description: "Confirm your support & coordinator interest",
      icon: ClipboardList,
      href: "/dashboard/student/willingness",
      status: (data?.registration ? "done" : "inactive") as "done" | "inactive",
      actionLabel: data?.registration ? "View Response" : "Fill Now",
    },
    {
      key: "performance",
      label: "Performance",
      description:
        data?.performances && data.performances.length > 0
          ? `${data.performances.length} event${data.performances.length > 1 ? "s" : ""} registered`
          : "Register for cultural events",
      icon: Drama,
      href: "/dashboard/student/performance",
      status: (data?.performances && data.performances.length > 0
        ? "done"
        : "inactive") as "done" | "inactive",
      actionLabel:
        data?.performances && data.performances.length > 0
          ? "Manage"
          : "Register",
    },
    {
      key: "qr",
      label: "QR Ticket",
      description: data?.qr?.is_active
        ? isInsideNow
          ? `Currently inside${entryCount > 1 ? ` — ${entryCount} entries` : ""}`
          : entryCount > 0
            ? `${entryCount} entr${entryCount === 1 ? "y" : "ies"} recorded`
            : "Ready to scan at the gate"
        : "Available after payment approval",
      icon: Ticket,
      href: "/dashboard/student/qr",
      status: (data?.qr?.is_active ? "done" : "inactive") as
        | "done"
        | "inactive",
      actionLabel: data?.qr?.is_active ? "View Ticket" : "Not Available",
      locked: !data?.qr?.is_active,
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to MASS 2K26 — track your registration progress below.
        </p>
      </div>

      {/* Stat mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Payment */}
        <Card
          className={`border ${payStatus === "approved" ? "border-emerald-500/30 bg-emerald-500/5" : payStatus === "rejected" ? "border-rose-500/30 bg-rose-500/5" : payStatus === "pending" ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard
                className={`w-4 h-4 ${payStatus === "approved" ? "text-emerald-400" : payStatus === "rejected" ? "text-rose-400" : payStatus === "pending" ? "text-amber-400" : "text-muted-foreground"}`}
              />
              <span className="text-xs text-muted-foreground">Payment</span>
            </div>
            <p
              className={`font-bold text-sm ${payStatus === "approved" ? "text-emerald-400" : payStatus === "rejected" ? "text-rose-400" : payStatus === "pending" ? "text-amber-400" : "text-muted-foreground"}`}
            >
              {paymentLabel(payStatus)}
            </p>
            {data?.payment?.amount && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ₹{data.payment.amount}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Performances */}
        <Card
          className={`border ${(data?.performances?.length ?? 0) > 0 ? "border-purple-500/30 bg-purple-500/5" : "border-white/10"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Drama
                className={`w-4 h-4 ${(data?.performances?.length ?? 0) > 0 ? "text-purple-400" : "text-muted-foreground"}`}
              />
              <span className="text-xs text-muted-foreground">
                Performances
              </span>
            </div>
            <p
              className={`font-bold text-2xl ${(data?.performances?.length ?? 0) > 0 ? "text-purple-400" : "text-muted-foreground"}`}
            >
              {data?.performances?.length ?? 0}
            </p>
            {(data?.teamPerformances?.length ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                +{data?.teamPerformances?.length} as member
              </p>
            )}
          </CardContent>
        </Card>

        {/* QR / Entry */}
        <Card
          className={`border ${data?.qr?.is_active ? (isInsideNow ? "border-emerald-500/30 bg-emerald-500/5" : "border-blue-500/30 bg-blue-500/5") : "border-white/10"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {isInsideNow ? (
                <LogIn className="w-4 h-4 text-emerald-400" />
              ) : entryCount > 0 ? (
                <LogOut className="w-4 h-4 text-blue-400" />
              ) : (
                <QrCode className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">QR Ticket</span>
            </div>
            <p
              className={`font-bold text-sm ${data?.qr?.is_active ? (isInsideNow ? "text-emerald-400" : "text-blue-400") : "text-muted-foreground"}`}
            >
              {data?.qr?.is_active
                ? isInsideNow
                  ? "Inside"
                  : entryCount > 0
                    ? "Outside"
                    : "Active"
                : "Not Ready"}
            </p>
            {entryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {entryCount} {entryCount === 1 ? "entry" : "entries"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Team */}
        <Card
          className={`border ${(data?.teamPerformances?.length ?? 0) > 0 ? "border-sky-500/30 bg-sky-500/5" : "border-white/10"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users
                className={`w-4 h-4 ${(data?.teamPerformances?.length ?? 0) > 0 ? "text-sky-400" : "text-muted-foreground"}`}
              />
              <span className="text-xs text-muted-foreground">Team Roles</span>
            </div>
            <p
              className={`font-bold text-2xl ${(data?.teamPerformances?.length ?? 0) > 0 ? "text-sky-400" : "text-muted-foreground"}`}
            >
              {data?.teamPerformances?.length ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Organiser pinned note */}
      {data?.registration?.remarks && (
        <Card className="border border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Pin className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">
                  Organiser Note
                </p>
                <p className="text-sm text-foreground">
                  {data.registration.remarks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey steps */}
      <Card className="border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your Journey</CardTitle>
        </CardHeader>
        <Separator className="bg-white/5" />
        <CardContent className="py-2 px-4 divide-y divide-white/5">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = step.status === "done";
            const isError = step.status === "error";
            const isPending = step.status === "pending";
            const isLocked = "locked" in step && step.locked;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 py-3.5 ${isLocked ? "opacity-50" : ""}`}
              >
                {/* Icon box */}
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : isError
                        ? "bg-rose-500/10 border-rose-500/20"
                        : isPending
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-white/5 border-white/10"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isDone
                        ? "text-emerald-400"
                        : isError
                          ? "text-rose-400"
                          : isPending
                            ? "text-amber-400"
                            : "text-muted-foreground"
                    }`}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{step.label}</p>
                    <StatusIcon status={step.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>

                {/* Action */}
                {!isLocked && (
                  <Button
                    asChild
                    size="sm"
                    variant={isDone ? "ghost" : "secondary"}
                    className="flex-shrink-0 h-8 gap-1 text-xs"
                  >
                    <Link href={step.href}>
                      {step.actionLabel}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Performances */}
      {(data?.performances?.length ?? 0) > 0 && (
        <Card className="border border-white/10">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Performance Registrations
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
            >
              <Link href="/dashboard/student/performance">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </CardHeader>
          <Separator className="bg-white/5" />
          <CardContent className="px-4 py-2 divide-y divide-white/5">
            {data!.performances.map((perf, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Drama className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span className="text-sm">{perf.performance_type}</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    perf.approval_status === "approved"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : perf.approval_status === "rejected"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }
                >
                  {perf.approval_status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Team performances */}
      {(data?.teamPerformances?.length ?? 0) > 0 && (
        <Card className="border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              Team Performances
              <span className="text-xs font-normal text-muted-foreground">
                (as member)
              </span>
            </CardTitle>
          </CardHeader>
          <Separator className="bg-white/5" />
          <CardContent className="px-4 py-2 divide-y divide-white/5">
            {data!.teamPerformances.map((perf, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm">{perf.performance_type}</p>
                    <p className="text-xs text-muted-foreground">
                      Led by {perf.leader_name}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    perf.approval_status === "approved"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : perf.approval_status === "rejected"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }
                >
                  {perf.approval_status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick upload shortcut when payment pending */}
      {!payStatus && data?.registration && (
        <Card className="border border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Upload Payment</p>
                <p className="text-xs text-muted-foreground">
                  Submit your UPI receipt to continue
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="flex-shrink-0">
              <Link href="/dashboard/student/payment">Upload</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
