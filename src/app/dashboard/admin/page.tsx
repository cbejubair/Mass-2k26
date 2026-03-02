"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

interface Stats {
  totalStudents: number;
  totalRegistered: number;
  willingCount: number;
  totalPaymentsApproved: number;
  totalRevenue: number;
  pendingPayments: number;
  totalPerformances: number;
  pendingPerformances: number;
  supportPercentage: number;
  totalSurveys: number;
  totalCheckedIn: number;
  activeQR: number;
}

interface Charts {
  departmentBreakdown: Record<string, number>;
  yearBreakdown: Record<string, number>;
  performanceTypes: Record<string, number>;
  paymentStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setCharts(data.charts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            MASS 2K26 Overview
          </p>
        </div>
        <Button
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => (window.location.href = "/api/export/admin")}
        >
          <Download className="h-4 w-4" />
          Export Master Excel
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Willing Students"
          value={stats?.willingCount || 0}
          subtitle={`${stats?.totalRegistered || 0} forms submitted`}
          icon="📝"
          color="indigo"
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Payments Approved"
          value={stats?.totalPaymentsApproved || 0}
          subtitle={`${stats?.pendingPayments || 0} pending`}
          icon="💳"
          color="green"
        />
        {/* <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
          color="amber"
        /> */}
        <StatCard
          title="Performances"
          value={stats?.totalPerformances || 0}
          subtitle={`${stats?.pendingPerformances || 0} pending`}
          icon="🎭"
          color="purple"
        />
        <StatCard
          title="Checked In"
          value={stats?.totalCheckedIn || 0}
          subtitle={`${stats?.activeQR || 0} active QRs`}
          icon="📱"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Department Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {charts &&
              Object.entries(charts.departmentBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([dept, count]) => {
                  const max = Math.max(
                    ...Object.values(charts.departmentBreakdown),
                  );
                  const pct = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{dept}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-wise Participation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {charts &&
              Object.entries(charts.yearBreakdown)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([year, count]) => {
                  const max = Math.max(...Object.values(charts.yearBreakdown));
                  const pct = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={year}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Year {year}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Performance Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {charts &&
              Object.entries(charts.performanceTypes)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const max = Math.max(
                    ...Object.values(charts.performanceTypes),
                  );
                  const pct = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{type}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            {charts && Object.keys(charts.performanceTypes).length === 0 && (
              <p className="text-muted-foreground text-sm">
                No performances yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts &&
                Object.entries(charts.paymentStatus).map(([status, count]) => {
                  const colors: Record<string, string> = {
                    approved: "bg-green-500",
                    pending: "bg-amber-500",
                    rejected: "bg-red-500",
                  };
                  const total = Object.values(charts.paymentStatus).reduce(
                    (a, b) => a + b,
                    0,
                  );
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${colors[status] || "bg-muted"}`}
                      />
                      <span className="text-sm capitalize flex-1">
                        {status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Support Rate</span>
                <span className="text-primary font-semibold">
                  {stats?.supportPercentage || 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Survey Responses</span>
                <span className="text-primary font-semibold">
                  {stats?.totalSurveys || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
