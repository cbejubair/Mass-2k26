"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Pin } from "lucide-react";
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
    qr_token: string;
  } | null;
}

const badgeVariant = (status: string) =>
  status === "approved"
    ? "default"
    : status === "rejected"
      ? "destructive"
      : ("secondary" as const);

const paymentLabel = (status?: string | null) => {
  if (!status) return "Not Submitted";
  if (status === "approved") return "Paid";
  if (status === "pending") return "Under Verification";
  if (status === "rejected") return "Rejected";
  return status;
};

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [regRes, payRes, perfRes, qrRes, teamPerfRes] = await Promise.all(
          [
            fetch("/api/register").then((r) => r.json()),
            fetch("/api/payments/status")
              .then((r) => r.json())
              .catch(() => ({ payment: null })),
            fetch("/api/performances/submit").then((r) => r.json()),
            fetch("/api/qr/generate").then((r) => r.json()),
            fetch("/api/performances/team")
              .then((r) => r.json())
              .catch(() => ({ teamPerformances: [] })),
          ],
        );

        setData({
          registration: regRes.registration || null,
          payment: payRes.payment || null,
          performances: perfRes.performances || [],
          teamPerformances: teamPerfRes.teamPerformances || [],
          qr: qrRes.qr || null,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to MASS 2K26. Track your registration status below.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Willingness Form"
          value={data?.registration ? "Completed" : "Pending"}
          icon="📋"
          color={data?.registration ? "green" : "amber"}
        />
        <StatCard
          title="Payment"
          value={paymentLabel(data?.payment?.payment_status)}
          subtitle={data?.payment ? `₹${data.payment.amount}` : undefined}
          icon="💳"
          color={
            data?.payment?.payment_status === "approved"
              ? "green"
              : data?.payment?.payment_status === "rejected"
                ? "red"
                : "amber"
          }
        />
        <StatCard
          title="Performances"
          value={data?.performances?.length || 0}
          icon="🎭"
          color="purple"
        />
        <StatCard
          title="QR Ticket"
          value={data?.qr?.is_active ? "Active" : "Not Available"}
          subtitle={
            data?.qr?.checked_out_at
              ? "Checked Out"
              : data?.qr?.checked_in_at
                ? "Checked In"
                : undefined
          }
          icon="🎫"
          color={data?.qr?.is_active ? "green" : "amber"}
        />
      </div>

      {data?.registration?.remarks && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-2">
              <Pin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Admin Remarks</h3>
                <p className="text-muted-foreground text-sm">
                  {data.registration.remarks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.performances && data.performances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Performance Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.performances.map((perf, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <span className="text-sm">{perf.performance_type}</span>
                <Badge variant={badgeVariant(perf.approval_status)}>
                  {perf.approval_status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data?.teamPerformances && data.teamPerformances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              🤝 Team Performances (as member)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.teamPerformances.map((perf, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div>
                  <span className="text-sm font-medium">
                    {perf.performance_type}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Led by {perf.leader_name}
                  </span>
                </div>
                <Badge variant={badgeVariant(perf.approval_status)}>
                  {perf.approval_status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {!data?.registration && (
              <Button asChild size="sm">
                <Link href="/dashboard/student/willingness">
                  Fill Willingness Form
                </Link>
              </Button>
            )}
            {!data?.payment && data?.registration && (
              <Button asChild size="sm">
                <Link href="/dashboard/student/payment">Upload Payment</Link>
              </Button>
            )}
            {data?.registration &&
              data?.payment?.payment_status === "approved" && (
                <Button asChild size="sm" variant="secondary">
                  <Link href="/dashboard/student/survey">Fill Survey Form</Link>
                </Button>
              )}
            {data?.qr?.is_active && (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/student/qr">View QR Ticket</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
